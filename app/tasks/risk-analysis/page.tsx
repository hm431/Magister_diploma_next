'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import apiClient from '@/lib/api-client';

interface CriticalWorkItem { work_id: number; criticality_index: number; risk_critical: boolean }
interface CDFPoint { t: number; F: number }
interface MonteCarloResponse {
  run_id: number; mean_duration: number; std_duration: number; prob_on_time: number;
  t_quantile_50: number; t_quantile_80: number; t_quantile_90: number;
  top_critical_works: CriticalWorkItem[]; cdf: CDFPoint[];
}
interface RiskFormFields { iterations: string; seed: string; t_plan: string }

const PROJECT_ID = 1;
const inputCls = 'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

export default function RiskAnalysisPage() {
  const [result, setResult] = useState<MonteCarloResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'scurve' | 'histogram' | 'table'>('scurve');
  const [format, setFormat] = useState<'PDF' | 'SVG'>('PDF');

  const { register, handleSubmit } = useForm<RiskFormFields>({
    defaultValues: { iterations: '1000', seed: '', t_plan: '180' },
  });

  const runMutation = useMutation({
    mutationFn: (body: { iterations: number; seed?: number; t_plan: number }) =>
      apiClient.post<MonteCarloResponse>(`/risk/monte-carlo/${PROJECT_ID}`, body).then(r => r.data),
    onSuccess: data => {
      setResult(data);
      toast.success(`Монте-Карло завершён. Run #${data.run_id}. P(T≤T_план) = ${(data.prob_on_time * 100).toFixed(1)}%`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(raw: RiskFormFields) {
    const iterations = parseInt(raw.iterations, 10);
    const t_plan = parseFloat(raw.t_plan);
    const seed = raw.seed ? parseInt(raw.seed, 10) : undefined;
    if (!iterations || iterations < 100) { toast.error('Минимум 100 итераций'); return; }
    if (!t_plan || t_plan <= 0) { toast.error('T_план должен быть положительным'); return; }
    runMutation.mutate({ iterations, t_plan, seed });
  }

  const cdfData = result?.cdf ?? [];
  const histX: number[] = [];
  const histY: number[] = [];
  if (cdfData.length > 1) {
    for (let i = 1; i < cdfData.length; i++) {
      histX.push((cdfData[i].t + cdfData[i - 1].t) / 2);
      histY.push((cdfData[i].F - cdfData[i - 1].F) / (cdfData[i].t - cdfData[i - 1].t || 1));
    }
  }

  const TABS = [
    { id: 'scurve' as const, label: 'S-кривая' },
    { id: 'histogram' as const, label: 'Гистограмма' },
    { id: 'table' as const, label: 'Топ-10 CI_i' },
  ];

  return (
    <div>
      <TaskHeaderOrganism
        path="Анализ рисков"
        subSistem="РИСК"
        taskName="Задача 3 — Анализ рисков (Монте-Карло)"
        taskDescription="Имитационная модель оценки вероятности срыва сроков. R итераций, S-кривая F_T(t), P(T≤T_план), квантили T₀.₅ T₀.₈ T₀.₉ и индексы критичности CI_i работ."
      />

      <div className="flex flex-row w-full gap-4 mt-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="w-72 shrink-0 border border-t-0 border-slate-800 bg-[#16181D] p-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">Параметры</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Итераций R</label>
              <input {...register('iterations')} type="number" min={100} max={100000} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>T_план (дн.)</label>
              <input {...register('t_plan')} type="number" min={1} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Seed (опционально)</label>
              <input {...register('seed')} type="number" className={inputCls} placeholder="случайный" />
            </div>

            <button
              type="submit"
              disabled={runMutation.isPending}
              className="w-full h-9 bg-[#6a93c8] hover:bg-[#82a6d4] disabled:opacity-50 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
            >
              {runMutation.isPending ? 'Симуляция...' : '▶ Запустить расчёт'}
            </button>

            {runMutation.isPending && (
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#6a93c8] rounded-full animate-pulse w-3/4" />
              </div>
            )}
          </form>

          {result && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              {[
                { label: 'E[T]', value: result.mean_duration.toFixed(1) + ' дн.', color: 'text-[#6a93c8]' },
                { label: 'σ[T]', value: result.std_duration.toFixed(1) + ' дн.', color: 'text-slate-300' },
                {
                  label: 'P(T≤T_план)',
                  value: (result.prob_on_time * 100).toFixed(1) + '%',
                  color: result.prob_on_time >= 0.8 ? 'text-teal-300' : result.prob_on_time >= 0.5 ? 'text-amber-300' : 'text-red-400',
                },
                { label: 'T₀.₅', value: result.t_quantile_50.toFixed(1) + ' дн.', color: 'text-slate-300' },
                { label: 'T₀.₈', value: result.t_quantile_80.toFixed(1) + ' дн.', color: 'text-amber-300' },
                { label: 'T₀.₉', value: result.t_quantile_90.toFixed(1) + ' дн.', color: 'text-red-400' },
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
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 font-mono text-[12px] tracking-wide border-b-2 -mb-[2px] transition-colors ${activeTab === t.id ? 'border-[#6a93c8] text-[#6a93c8]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'scurve' && (
                <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">S-кривая F_T(t)</div>
                  <PlotlyChart
                    data={[
                      {
                        type: 'scatter', mode: 'lines', name: 'F_T(t)',
                        x: cdfData.map(p => p.t), y: cdfData.map(p => p.F),
                        line: { color: '#6a93c8', width: 2.5 },
                        fill: 'tozeroy', fillcolor: 'rgba(106,147,200,0.06)',
                      },
                      ...[
                        { q: result.t_quantile_50, label: 'T₀.₅', color: '#aab1bd' },
                        { q: result.t_quantile_80, label: 'T₀.₈', color: '#f59e0b' },
                        { q: result.t_quantile_90, label: 'T₀.₉', color: '#ef4444' },
                      ].map(({ q, label, color }) => ({
                        type: 'scatter' as const, mode: 'lines' as const, name: label,
                        x: [q, q], y: [0, 1],
                        line: { color, dash: 'dot' as const, width: 1.5 },
                      })),
                    ]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 11 },
                      xaxis: { gridcolor: '#272c34', title: { text: 'T, дней' } },
                      yaxis: { gridcolor: '#272c34', title: { text: 'F_T(t)' }, range: [0, 1] },
                      legend: { bgcolor: 'transparent' },
                      margin: { l: 50, r: 10, t: 10, b: 50 },
                    }}
                    config={{ displayModeBar: true, toImageButtonOptions: { format: 'svg', filename: 's_curve' } }}
                    style={{ width: '100%', height: 360 }}
                  />
                </div>
              )}

              {activeTab === 'histogram' && (
                <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Гистограмма C(r)</div>
                  <PlotlyChart
                    data={[
                      { type: 'bar', x: histX, y: histY, name: 'Плотность', marker: { color: '#6a93c8', opacity: 0.75 } },
                      {
                        type: 'scatter', mode: 'lines', name: `E[T] = ${result.mean_duration.toFixed(1)}`,
                        x: [result.mean_duration, result.mean_duration],
                        y: [0, Math.max(...histY, 0.01) * 1.1],
                        line: { color: '#7fb3b0', dash: 'dash', width: 2 },
                      },
                    ]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 11 },
                      xaxis: { gridcolor: '#272c34', title: { text: 'T, дней' } },
                      yaxis: { gridcolor: '#272c34', title: { text: 'Плотность' } },
                      legend: { bgcolor: 'transparent' },
                      margin: { l: 50, r: 10, t: 10, b: 50 },
                    }}
                    config={{ displayModeBar: true, toImageButtonOptions: { format: 'png', filename: 'histogram' } }}
                    style={{ width: '100%', height: 360 }}
                  />
                </div>
              )}

              {activeTab === 'table' && (
                <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">
                    Топ-10 риск-критических работ (CI_i)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          {['#', 'ID работы', 'Индекс CI_i', 'Риск-критическая'].map(h => (
                            <th key={h} className="px-4 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...result.top_critical_works]
                          .sort((a, b) => b.criticality_index - a.criticality_index)
                          .map((w, i) => (
                            <tr key={w.work_id} className={`border-b border-slate-800/40 ${w.risk_critical ? 'bg-red-950/15' : i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
                              <td className="px-4 py-2 font-mono text-[11px] text-slate-600">{i + 1}</td>
                              <td className="px-4 py-2 text-slate-300">#{w.work_id}</td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#6a93c8] rounded-full" style={{ width: `${Math.min(w.criticality_index * 100, 100)}%` }} />
                                  </div>
                                  <span className="font-mono text-[12px] text-slate-300">{(w.criticality_index * 100).toFixed(1)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                {w.risk_critical ? <span className="font-mono text-[10px] text-red-400">⚠ ДА</span> : <span className="font-mono text-[10px] text-slate-600">нет</span>}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-72 bg-[#16181D] border border-slate-800 rounded">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 mb-2">Результат расчёта</div>
              <p className="text-slate-600 text-sm">
                {runMutation.isPending ? 'Симуляция Монте-Карло...' : 'Задайте параметры и нажмите «Запустить расчёт»'}
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
            <div className="text-[11px] font-semibold text-center text-[#e8eaee]">Отчёт по анализу рисков</div>
            <div className="font-mono text-[9px] text-center text-[#6b7380] mt-1">
              {result ? `Run #${result.run_id} · P = ${(result.prob_on_time * 100).toFixed(0)}%` : 'версия от —'}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-[#6b7380]">формат выгрузки</span>
            <div className="flex gap-1.5">
              {(['PDF', 'SVG'] as const).map(f => (
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
