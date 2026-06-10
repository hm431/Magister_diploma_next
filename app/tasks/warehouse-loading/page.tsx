'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import apiClient from '@/lib/api-client';
import { generatePdfReport } from '@/lib/pdf-report';
import { DEMO_WAREHOUSE_RESULT } from '@/lib/demo-data';

interface ScheduleCalc { calculation_id: number; version: number }
interface LoadProfileRow {
  profile_date: string; total_load: number; utilization_ratio: number;
  peak_indicator: boolean; queue_length: number | null; wait_time: number | null; rho: number | null;
}
interface ViolationRow { profile_date: string; violation_type: string; description: string }
interface ScenarioRow {
  scenario_type: string; description: string;
  delta_t: number; delta_c: number; delta_r: number; j_score: number; is_optimal: boolean;
}
interface WarehouseFeasibilityResponse {
  project_id: number; calculation_id: number; warehouse_id: number; feasible: boolean;
  violations: ViolationRow[]; load_profile: LoadProfileRow[];
  scenarios: ScenarioRow[]; adjusted_deliveries: null;
}

const PROJECT_ID = 1;
const inputCls = 'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

const VIOLATION_LABELS: Record<string, string> = {
  capacity: 'Превышение ёмкости',
  overload: 'Перегрузка',
  wait_time: 'Время ожидания',
};

export default function WarehouseLoadingPage() {
  const [result, setResult] = useState<WarehouseFeasibilityResponse | null>(DEMO_WAREHOUSE_RESULT as WarehouseFeasibilityResponse);
  const [format, setFormat] = useState<'PDF' | 'XLSX'>('PDF');

  function handleDownload() {
    if (!result) { toast.error('Сначала выполните расчёт'); return; }
    if (format !== 'PDF') { toast(`Формат ${format} в разработке`, { icon: '⚠️' }); return; }
    generatePdfReport({
      docTitle: 'Отчёт по загрузке склада и логистике МТР',
      taskName: 'Задача 2.3.3 — Загрузка складов и логистика',
      calcId: result.calculation_id,
      date: new Date().toISOString(),
      tables: [
        {
          title: `Профиль загрузки склада (склад №${result.warehouse_id}, статус: ${result.feasible ? 'реализуем' : 'нереализуем'})`,
          head: ['Дата', 'U(t)', 'Утилизация', 'Пик', 'ρ(t)', 'Lq (справ.)', 'Wq (справ.)'],
          rows: result.load_profile.map(r => [
            r.profile_date,
            r.total_load.toFixed(2),
            (r.utilization_ratio * 100).toFixed(1) + '%',
            r.peak_indicator ? 'Да' : 'Нет',
            r.rho !== null ? r.rho.toFixed(4) : '—',
            r.queue_length !== null ? r.queue_length.toFixed(3) : '—',
            r.wait_time !== null ? r.wait_time.toFixed(3) : '—',
          ]),
        },
        ...(result.violations.length > 0 ? [{
          title: `Выявленные нарушения (${result.violations.length})`,
          head: ['Дата', 'Тип нарушения', 'Описание'],
          rows: result.violations.map(v => [v.profile_date, v.violation_type, v.description]),
        }] : []),
        ...(result.scenarios.length > 0 ? [{
          title: 'Корректирующие сценарии (J = w_t·ΔT + w_c·ΔC + w_r·ΔR)',
          head: ['Сценарий', 'Описание', 'ΔT', 'ΔC', 'ΔR', 'J-оценка', 'Оптимальный'],
          rows: result.scenarios.map(s => [
            s.scenario_type.toUpperCase(), s.description,
            s.delta_t.toFixed(4), s.delta_c.toFixed(2), s.delta_r.toFixed(4),
            s.j_score.toFixed(4), s.is_optimal ? 'σ*' : '',
          ]),
        }] : []),
      ],
    });
  }

  const { data: schedule } = useQuery<ScheduleCalc>({
    queryKey: ['schedule', PROJECT_ID],
    queryFn: () => apiClient.get(`/sro/schedule/${PROJECT_ID}/latest`).then(r => r.data),
    retry: false,
  });

  const checkMutation = useMutation({
    mutationFn: (calcId: number) =>
      apiClient.post<WarehouseFeasibilityResponse>(`/mtr/warehouse-feasibility/${PROJECT_ID}/${calcId}`).then(r => r.data),
    onSuccess: data => {
      setResult(data);
      if (data.feasible) toast.success('Склад реализуем — нарушений не обнаружено');
      else toast.error(`Обнаружено ${data.violations.length} нарушений`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const profile = result?.load_profile ?? [];
  const dates = profile.map(r => r.profile_date);
  const loads = profile.map(r => r.total_load);
  const utils = profile.map(r => r.utilization_ratio);
  const rhos = profile.map(r => r.rho ?? 0);
  const waitTimes = profile.map(r => r.wait_time ?? 0);
  // Capacity = max load / max utilization (recovers the 100% line)
  const maxUtil = utils.length ? Math.max(...utils) : 1;
  const maxLoad = loads.length ? Math.max(...loads) : 1;
  const capacityLine = maxUtil > 0 ? maxLoad / maxUtil : maxLoad * 1.1;

  return (
    <div>
      <TaskHeaderOrganism
        path="Загрузка складов и логистика"
        subSistem="МТО"
        taskName="Задача 2.2 — Загрузка складов и логистика"
        taskDescription="Посуточный баланс запасов: U(t) = Σ stock(j,t)·w_j. Коэффициент загрузки ρ(t) = λ(t)/(n·μ). При нарушениях — три корректирующих сценария σ1/σ2/σ3 с J-оценкой."
      />

      <div className="flex flex-row w-full gap-4 mt-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="w-72 shrink-0 border border-t-0 border-slate-800 bg-[#16181D] p-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">Входные данные</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Проект</label>
              <input className={inputCls} value={`Проект #${PROJECT_ID}`} readOnly />
            </div>
            {schedule ? (
              <div className="p-2 bg-teal-950/30 border border-teal-800/40 rounded">
                <div className="font-mono text-[10px] text-teal-400">Расчёт #{schedule.calculation_id}</div>
              </div>
            ) : (
              <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded">
                <div className="font-mono text-[10px] text-amber-400">⚠ Выполните Задачи 1.1 и 2.1</div>
              </div>
            )}
            <div className="p-2 bg-slate-900/40 border border-slate-800/60 rounded">
              <div className="font-mono text-[9px] uppercase text-slate-600 mb-1">Алгоритм</div>
              <div className="font-mono text-[10px] text-slate-400">Посуточный баланс + сценарии</div>
            </div>
          </div>

          <button
            onClick={() => schedule && checkMutation.mutate(schedule.calculation_id)}
            disabled={!schedule || checkMutation.isPending}
            className="w-full mt-5 h-9 bg-[#c9a06a] hover:bg-[#d9b47e] disabled:opacity-40 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
          >
            {checkMutation.isPending ? 'Проверка...' : '▶ Проверить реализуемость'}
          </button>

          {result && (
            <>
              <div className={`mt-4 p-3 rounded border ${result.feasible ? 'border-teal-800/40 bg-teal-950/20' : 'border-red-800/40 bg-red-950/20'}`}>
                <div className={`font-semibold text-sm ${result.feasible ? 'text-teal-300' : 'text-red-400'}`}>
                  {result.feasible ? '✓ Склад реализуем' : '✗ Склад нереализуем'}
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-1">
                  Нарушений: {result.violations.length}
                </div>
              </div>

              {result.scenarios.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-600">Оптимальный сценарий</div>
                  {result.scenarios.filter(s => s.is_optimal).map(s => (
                    <div key={s.scenario_type} className="p-2 bg-teal-950/30 border border-teal-800/40 rounded">
                      <div className="font-mono text-[10px] text-teal-300 font-semibold">{s.scenario_type.toUpperCase()}</div>
                      <div className="font-mono text-[9px] text-slate-400 mt-0.5">J = {s.j_score.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── CENTER: Analytics ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {result && profile.length > 0 ? (
            <>
              {/* U_t profile */}
              <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                  Профиль загрузки склада U_t — фактическая vs. предельная ёмкость
                </div>
                <PlotlyChart
                  data={[
                    {
                      type: 'scatter', mode: 'lines',
                      x: dates, y: loads, name: 'U_t (м²)',
                      fill: 'tozeroy',
                      fillcolor: 'rgba(201,160,106,0.12)',
                      line: { color: '#c9a06a', width: 2 },
                      hovertemplate: '<b>%{x}</b><br>Загрузка: %{y:.1f} м²<br>Утилизация: %{customdata:.1%}<extra></extra>',
                      customdata: utils,
                    },
                    {
                      type: 'scatter', mode: 'markers',
                      x: dates.filter((_, i) => profile[i]?.peak_indicator),
                      y: loads.filter((_, i) => profile[i]?.peak_indicator),
                      name: 'Пиковые дни',
                      marker: { color: '#ef4444', size: 9, symbol: 'triangle-up' },
                      hovertemplate: '<b>%{x}</b><br>Пик: %{y:.1f} м²<extra></extra>',
                    },
                    {
                      type: 'scatter', mode: 'lines',
                      x: [dates[0], dates[dates.length - 1]],
                      y: [capacityLine * 0.9, capacityLine * 0.9],
                      name: 'Предел 90% U_max',
                      line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                      hovertemplate: 'Предел загрузки: 90% U_max<extra></extra>',
                    },
                    {
                      type: 'scatter', mode: 'lines',
                      x: [dates[0], dates[dates.length - 1]],
                      y: [capacityLine, capacityLine],
                      name: 'U_max (ёмкость)',
                      line: { color: '#7fb3b0', dash: 'dot', width: 1 },
                      hovertemplate: 'Максимальная ёмкость склада<extra></extra>',
                    },
                  ]}
                  layout={{
                    paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                    font: { color: '#aab1bd', family: 'monospace', size: 11 },
                    xaxis: { gridcolor: '#272c34', title: { text: 'Дата' } },
                    yaxis: { gridcolor: '#272c34', title: { text: 'Загрузка, м²' } },
                    legend: { bgcolor: 'rgba(21,24,29,0.8)', bordercolor: '#272c34', borderwidth: 1 },
                    margin: { l: 55, r: 15, t: 15, b: 55 },
                  }}
                  config={{ displayModeBar: true, toImageButtonOptions: { format: 'png', filename: 'warehouse_load' } }}
                  style={{ width: '100%', height: 260 }}
                />
              </div>

              {/* ρ(t) and W_q(t) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Интенсивность нагрузки ρ(t) = λ/nμ</div>
                  <PlotlyChart
                    data={[
                      {
                        type: 'scatter', mode: 'lines',
                        x: dates, y: rhos, name: 'ρ(t)',
                        line: { color: '#6a93c8', width: 2 },
                        fill: 'tozeroy', fillcolor: 'rgba(106,147,200,0.10)',
                        hovertemplate: '<b>%{x}</b><br>ρ = %{y:.3f}<extra></extra>',
                      },
                      {
                        type: 'scatter', mode: 'lines',
                        x: [dates[0], dates[dates.length - 1]], y: [1, 1],
                        name: 'ρ = 1 (перегрузка)',
                        line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                      },
                      {
                        type: 'scatter', mode: 'lines',
                        x: [dates[0], dates[dates.length - 1]], y: [0.75, 0.75],
                        name: 'ρ = 0.75 (предупреждение)',
                        line: { color: '#f59e0b', dash: 'dot', width: 1 },
                      },
                    ]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 10 },
                      xaxis: { gridcolor: '#272c34' },
                      yaxis: { gridcolor: '#272c34', title: { text: 'ρ(t)' }, range: [0, 1.45] },
                      legend: { bgcolor: 'transparent', font: { size: 9 } },
                      margin: { l: 45, r: 10, t: 10, b: 50 },
                    }}
                    style={{ width: '100%', height: 210 }}
                  />
                </div>
                <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Среднее время ожидания W_q(t), ч</div>
                  <PlotlyChart
                    data={[{
                      type: 'bar', x: dates, y: waitTimes, name: 'W_q(t)',
                      marker: {
                        color: waitTimes.map(w => w > 2.0 ? '#ef4444' : w > 0.5 ? '#f59e0b' : '#7fb3b0'),
                      },
                      hovertemplate: '<b>%{x}</b><br>W_q = %{y:.2f} ч<extra></extra>',
                    },
                    {
                      type: 'scatter', mode: 'lines',
                      x: [dates[0], dates[dates.length - 1]], y: [2, 2],
                      name: 'Норматив 2 ч',
                      line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                    }]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 10 },
                      xaxis: { gridcolor: '#272c34' },
                      yaxis: { gridcolor: '#272c34', title: { text: 'W_q, ч' } },
                      legend: { bgcolor: 'transparent', font: { size: 9 } },
                      barmode: 'overlay',
                      margin: { l: 45, r: 10, t: 10, b: 50 },
                    }}
                    style={{ width: '100%', height: 210 }}
                  />
                </div>
              </div>

              {/* Violations */}
              {result.violations.length > 0 && (
                <div className="bg-[#15181d] border border-red-900/30 rounded overflow-hidden">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-red-400 px-4 py-2 border-b border-red-900/30">
                    Нарушения ({result.violations.length})
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          {['Дата', 'Тип', 'Описание'].map(h => (
                            <th key={h} className="px-4 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.violations.map((v, i) => (
                          <tr key={i} className="border-b border-slate-800/40">
                            <td className="px-4 py-2 font-mono text-[11px] text-slate-400">{v.profile_date}</td>
                            <td className="px-4 py-2 font-mono text-[11px] text-red-400">{VIOLATION_LABELS[v.violation_type] ?? v.violation_type}</td>
                            <td className="px-4 py-2 text-[12px] text-slate-400">{v.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Scenarios */}
              {result.scenarios.length > 0 && (
                <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 px-4 py-2 border-b border-slate-800">
                    Корректирующие сценарии (J = w_t·Δt + w_c·Δc + w_r·Δr)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          {['Сценарий', 'Описание', 'ΔT', 'ΔC', 'ΔR', 'J-оценка', ''].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.scenarios.map(s => (
                          <tr key={s.scenario_type} className={`border-b border-slate-800/40 ${s.is_optimal ? 'bg-teal-950/20' : ''}`}>
                            <td className="px-3 py-2 font-mono text-[11px] text-slate-300 font-semibold">{s.scenario_type.toUpperCase()}</td>
                            <td className="px-3 py-2 text-[11px] text-slate-400">{s.description}</td>
                            <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{s.delta_t.toFixed(4)}</td>
                            <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{s.delta_c.toFixed(2)}</td>
                            <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{s.delta_r.toFixed(4)}</td>
                            <td className="px-3 py-2 font-mono text-[11px] text-[#c9a06a] font-semibold">{s.j_score.toFixed(4)}</td>
                            <td className="px-3 py-2 font-mono text-[10px]">
                              {s.is_optimal && <span className="text-teal-400 border border-teal-700 rounded px-1 py-0.5">σ*</span>}
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
                {checkMutation.isPending ? 'Проверка реализуемости...' : 'Нажмите «Проверить реализуемость»'}
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
            <div className="text-[11px] font-semibold text-center text-[#e8eaee]">Отчёт по загрузке склада</div>
            <div className="font-mono text-[9px] text-center text-[#6b7380] mt-1">
              {result ? (result.feasible ? '✓ реализуем' : `✗ ${result.violations.length} нарушений`) : 'версия от —'}
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
            onClick={handleDownload}
            className="h-8 text-[12px] font-medium text-[#0e1014] bg-[#6a93c8] border border-[#6a93c8] rounded hover:bg-[#82a6d4] transition-colors"
          >
            ↓ Скачать
          </button>
        </div>
      </div>
    </div>
  );
}
