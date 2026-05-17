'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import GanttChart, { GanttWork } from '@/components/ui/GanttChart';
import apiClient from '@/lib/api-client';

interface DeviationItem {
  work_id: number; plan_percent: number; fact_percent: number;
  delta_percent: number; chi_mtr: boolean; category: string;
}
interface ScheduleItemActual {
  work_id: number; es: number; ef: number; ls: number; lf: number; tf: number; is_critical: boolean;
}
interface ScenarioResult {
  scenario_type: string; delta_t: number; delta_c: number; delta_r: number; j_score: number; is_optimal: boolean;
}
interface RecalculateResponse {
  project_id: number; calculation_id: number;
  t_plan: number; t_actual: number; delta_t: number; delta_t_mtr: number; delta_t_other: number;
  deviations: DeviationItem[]; schedule: ScheduleItemActual[]; scenarios: ScenarioResult[];
}
interface OpsFormFields { t_0: string; beta1: string; beta2: string; beta3: string }

const PROJECT_ID = 1;
const inputCls = 'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

const SCENARIO_LABELS: Record<string, string> = {
  sigma1: 'σ₁ — ускорение поставок',
  sigma2: 'σ₂ — перераспределение бригад',
  sigma3: 'σ₃ — параллельные работы',
};
const CATEGORY_COLORS: Record<string, string> = {
  MTR: 'text-amber-300', weather: 'text-blue-300',
  technological: 'text-purple-300', personnel: 'text-green-300', other: 'text-slate-400',
};

export default function ScheduleDeviationsPage() {
  const [result, setResult] = useState<RecalculateResponse | null>(null);
  const [approvedScenario, setApprovedScenario] = useState<string | null>(null);
  const [format, setFormat] = useState<'PDF' | 'XLSX'>('PDF');
  const [activeTab, setActiveTab] = useState<'gantt' | 'deviations' | 'scenarios'>('gantt');

  const { register, handleSubmit, watch } = useForm<OpsFormFields>({
    defaultValues: { t_0: new Date().toISOString().split('T')[0], beta1: '0.5', beta2: '0.3', beta3: '0.2' },
  });

  const b1 = parseFloat(watch('beta1') || '0');
  const b2 = parseFloat(watch('beta2') || '0');
  const b3 = parseFloat(watch('beta3') || '0');
  const betaSum = +(b1 + b2 + b3).toFixed(6);
  const betaValid = Math.abs(betaSum - 1) < 0.001;

  const recalcMutation = useMutation({
    mutationFn: (body: { t_0: string; beta1: number; beta2: number; beta3: number }) =>
      apiClient.post<RecalculateResponse>(`/ops/recalculate/${PROJECT_ID}`, body).then(r => r.data),
    onSuccess: data => {
      setResult(data);
      const opt = data.scenarios.find(s => s.is_optimal);
      toast.success(`Пересчёт завершён. ΔT = ${data.delta_t > 0 ? '+' : ''}${data.delta_t.toFixed(1)} дн. Оптимальный: ${opt ? SCENARIO_LABELS[opt.scenario_type] ?? opt.scenario_type : '—'}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(raw: OpsFormFields) {
    if (!betaValid) { toast.error('β₁ + β₂ + β₃ должны равняться 1.0'); return; }
    recalcMutation.mutate({ t_0: raw.t_0, beta1: b1, beta2: b2, beta3: b3 });
  }

  const ganttWorks: GanttWork[] = (result?.schedule ?? []).map(s => ({
    id: s.work_id, name: `Работа #${s.work_id}`,
    es: s.es, ef: s.ef, ls: s.ls, lf: s.lf, tf: s.tf, is_critical: s.is_critical,
  }));

  const dtMtr = result?.delta_t_mtr ?? 0;
  const dtOther = result?.delta_t_other ?? 0;

  const TABS = [
    { id: 'gantt' as const, label: 'Актуальный график' },
    { id: 'deviations' as const, label: 'Отклонения' },
    { id: 'scenarios' as const, label: 'Сценарии' },
  ];

  return (
    <div>
      <TaskHeaderOrganism
        path="Оперативный контроль"
        subSistem="ОПС"
        taskName="Задача 4 — Оперативный контроль"
        taskDescription="Динамический пересчёт сроков по фактическим данным. Декомпозиция отклонения ΔT = ΔT_МТР + ΔT_иные. Выбор оптимального корректирующего сценария σ*."
      />

      <div className="flex flex-row w-full gap-4 mt-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="w-72 shrink-0 border border-t-0 border-slate-800 bg-[#16181D] p-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">Параметры</span>
            <span className={`font-mono text-[10px] ${betaValid ? 'text-teal-400' : 'text-red-400'}`}>
              Σβ = {betaSum.toFixed(2)}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Дата контроля t₀</label>
              <input {...register('t_0', { required: true })} type="date" className={inputCls} />
            </div>

            {[
              { field: 'beta1' as const, label: 'β₁ — ΔT (время)', val: b1 },
              { field: 'beta2' as const, label: 'β₂ — ΔC (стоимость)', val: b2 },
              { field: 'beta3' as const, label: 'β₃ — ΔR (ресурсы)', val: b3 },
            ].map(({ field, label, val }) => (
              <div key={field} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <label className={labelCls}>{label}</label>
                  <span className="font-mono text-[10px] text-[#6a93c8]">{val.toFixed(2)}</span>
                </div>
                <input {...register(field)} type="range" min={0} max={1} step={0.05} className="accent-[#6a93c8]" />
              </div>
            ))}

            <button
              type="submit"
              disabled={!betaValid || recalcMutation.isPending}
              className="w-full h-9 bg-[#6a93c8] hover:bg-[#82a6d4] disabled:opacity-40 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
            >
              {recalcMutation.isPending ? 'Пересчёт...' : '▶ Пересчитать'}
            </button>
          </form>

          {result && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              {[
                { label: 'T_план', value: result.t_plan + ' дн.', color: 'text-slate-300' },
                { label: 'T_актуальный', value: result.t_actual.toFixed(1) + ' дн.', color: 'text-slate-300' },
                {
                  label: 'ΔT', color: result.delta_t > 0 ? 'text-red-400' : 'text-teal-300',
                  value: (result.delta_t > 0 ? '+' : '') + result.delta_t.toFixed(1) + ' дн.',
                },
                { label: 'ΔT_МТР', value: result.delta_t_mtr.toFixed(1) + ' дн.', color: 'text-amber-300' },
              ].map(k => (
                <div key={k.label} className="flex justify-between items-center">
                  <span className={labelCls}>{k.label}</span>
                  <span className={`font-mono text-[12px] font-semibold ${k.color}`}>{k.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CENTER: Analytics ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {result ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 font-mono text-[12px] tracking-wide border-b-2 -mb-[2px] transition-colors ${
                      activeTab === t.id ? 'border-[#6a93c8] text-[#6a93c8]' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'gantt' && (
                <div className="flex flex-col gap-4">
                  {/* Pie chart decomposition */}
                  {(dtMtr + dtOther) > 0 && (
                    <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Декомпозиция ΔT</div>
                      <PlotlyChart
                        data={[{
                          type: 'pie',
                          labels: ['ΔT_МТР', 'ΔT_иные'],
                          values: [Math.max(dtMtr, 0), Math.max(dtOther, 0)],
                          hole: 0.45,
                          marker: { colors: ['#c9a06a', '#6a93c8'] },
                          textinfo: 'label+percent',
                          textfont: { color: '#e8eaee', size: 11 },
                        }]}
                        layout={{
                          paper_bgcolor: '#15181d', font: { color: '#aab1bd', family: 'monospace' },
                          margin: { l: 20, r: 20, t: 20, b: 20 }, showlegend: false, height: 200,
                        }}
                        style={{ width: '100%', height: 200 }}
                      />
                    </div>
                  )}
                  <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                      Актуализированный график
                    </div>
                    <GanttChart works={ganttWorks} />
                  </div>
                </div>
              )}

              {activeTab === 'deviations' && (
                <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">
                    Отклонения по работам
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          {['ID', 'План %', 'Факт %', 'ΔP', 'Категория', 'МТР'].map(h => (
                            <th key={h} className="px-4 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.deviations.map((d, i) => (
                          <tr key={d.work_id} className={`border-b border-slate-800/40 ${d.chi_mtr ? 'bg-amber-950/15' : i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
                            <td className="px-4 py-2 font-mono text-[11px] text-slate-500">#{d.work_id}</td>
                            <td className="px-4 py-2 font-mono text-[12px] text-slate-400">{d.plan_percent.toFixed(1)}%</td>
                            <td className="px-4 py-2 font-mono text-[12px] text-slate-300">{d.fact_percent.toFixed(1)}%</td>
                            <td className={`px-4 py-2 font-mono text-[12px] font-semibold ${d.delta_percent < 0 ? 'text-red-400' : 'text-teal-300'}`}>
                              {d.delta_percent > 0 ? '+' : ''}{d.delta_percent.toFixed(1)}%
                            </td>
                            <td className={`px-4 py-2 font-mono text-[11px] ${CATEGORY_COLORS[d.category] ?? 'text-slate-400'}`}>{d.category}</td>
                            <td className="px-4 py-2">
                              {d.chi_mtr ? <span className="font-mono text-[10px] text-amber-400">⚠</span> : <span className="text-slate-600">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'scenarios' && (
                <div className="flex flex-col gap-3">
                  {result.scenarios.sort((a, b) => a.j_score - b.j_score).map(sc => (
                    <div key={sc.scenario_type} className={`p-4 rounded border transition-colors ${
                      sc.is_optimal ? 'border-[#6a93c8]/60 bg-[#6a93c8]/8'
                        : approvedScenario === sc.scenario_type ? 'border-teal-700/60 bg-teal-950/20'
                        : 'border-slate-800 bg-[#15181d]'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {sc.is_optimal && <span className="font-mono text-[10px] text-[#6a93c8] border border-[#6a93c8]/40 px-1.5 py-0.5 rounded uppercase">σ* оптимальный</span>}
                            {approvedScenario === sc.scenario_type && <span className="font-mono text-[10px] text-teal-300 border border-teal-700/40 px-1.5 py-0.5 rounded uppercase">✓ утверждён</span>}
                          </div>
                          <h4 className="text-sm font-medium text-slate-200 mb-2">{SCENARIO_LABELS[sc.scenario_type] ?? sc.scenario_type}</h4>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { l: 'ΔT', v: sc.delta_t.toFixed(1) + ' дн.', c: sc.delta_t > 0 ? 'text-red-400' : 'text-teal-300' },
                              { l: 'ΔC', v: sc.delta_c.toFixed(2), c: 'text-slate-300' },
                              { l: 'ΔR', v: sc.delta_r.toFixed(2), c: 'text-slate-300' },
                              { l: 'J(σ)', v: sc.j_score.toFixed(4), c: sc.is_optimal ? 'text-[#6a93c8]' : 'text-slate-400' },
                            ].map(k => (
                              <div key={k.l}>
                                <div className="font-mono text-[10px] text-slate-600">{k.l}</div>
                                <div className={`font-mono text-sm font-semibold ${k.c}`}>{k.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => { setApprovedScenario(sc.scenario_type); toast.success(`${SCENARIO_LABELS[sc.scenario_type]} утверждён`); }}
                          disabled={approvedScenario === sc.scenario_type}
                          className={`shrink-0 h-8 px-3 text-[12px] rounded transition-colors ${
                            approvedScenario === sc.scenario_type
                              ? 'bg-teal-950/40 text-teal-500 border border-teal-800/40 cursor-default'
                              : 'border border-slate-700 text-slate-400 hover:border-[#6a93c8] hover:text-[#6a93c8]'
                          }`}
                        >
                          {approvedScenario === sc.scenario_type ? '✓ Утверждён' : 'Утвердить'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-72 bg-[#16181D] border border-slate-800 rounded">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 mb-2">Результат расчёта</div>
              <p className="text-slate-600 text-sm">
                {recalcMutation.isPending ? 'Выполняется пересчёт...' : 'Введите параметры и нажмите «Пересчитать»'}
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Document ── */}
        <div className="w-56 shrink-0 flex flex-col gap-3 p-3 bg-[#15181d] border border-[#272c34]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b7380]">Документ</span>
          </div>
          <div className="p-3 bg-[#1b1f25] border border-[#272c34] rounded min-h-36">
            <div className="text-[11px] font-semibold text-center text-[#e8eaee]">Отчёт об отклонениях</div>
            <div className="font-mono text-[9px] text-center text-[#6b7380] mt-1">
              {result ? `ΔT = ${result.delta_t > 0 ? '+' : ''}${result.delta_t.toFixed(1)} дн.` : 'версия от —'}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-[#6b7380]">формат выгрузки</span>
            <div className="flex gap-1.5">
              {(['PDF', 'XLSX'] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`flex-1 h-[30px] font-mono text-[11px] font-semibold border-[1.5px] rounded transition-colors ${format === f ? 'text-[#6a93c8] bg-[#2a3a52] border-[#6a93c8]' : 'text-gray-400 border-gray-600 hover:border-gray-400'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => toast(result ? `Скачивание ${format}...` : 'Сначала выполните расчёт', { icon: result ? '📄' : '⚠️' })}
            className="h-8 text-[12px] font-medium text-[#0e1014] bg-[#6a93c8] border border-[#6a93c8] rounded hover:bg-[#82a6d4] transition-colors"
          >
            ↓ Скачать
          </button>
        </div>
      </div>
    </div>
  );
}
