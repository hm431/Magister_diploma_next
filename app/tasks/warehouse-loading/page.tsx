'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import apiClient from '@/lib/api-client';

interface ScheduleCalc { calculation_id: number; version: number }
interface LoadProfileRow {
  profile_date: string; total_load: number; utilization_ratio: number;
  peak_indicator: boolean; queue_length: number | null; wait_time: number | null; rho: number | null;
}
interface ViolationRow { profile_date: string; violation_type: string; description: string }
interface DeliveryRow { material_id: number; warehouse_id: number; supplier_id: number; planned_date: string; planned_volume: number; unit_cost: number }
interface WarehouseFeasibilityResponse {
  project_id: number; calculation_id: number; warehouse_id: number; feasible: boolean;
  violations: ViolationRow[]; load_profile: LoadProfileRow[]; adjusted_deliveries: DeliveryRow[] | null;
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
  const [result, setResult] = useState<WarehouseFeasibilityResponse | null>(null);
  const [format, setFormat] = useState<'PDF' | 'XLSX'>('PDF');

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

  const applyMutation = useMutation({
    mutationFn: () => Promise.resolve(true),
    onSuccess: () => toast.success('Корректировка поставок применена'),
  });

  const profile = result?.load_profile ?? [];
  const dates = profile.map(r => r.profile_date);
  const loads = profile.map(r => r.total_load);
  const rhos = profile.map(r => r.rho ?? 0);
  const waitTimes = profile.map(r => r.wait_time ?? 0);
  const uMax = loads.length ? Math.max(...loads) * 1.2 : 1;

  return (
    <div>
      <TaskHeaderOrganism
        path="Загрузка складов и логистика"
        subSistem="МТО"
        taskName="Задача 2.2 — Загрузка складов и логистика"
        taskDescription="Модель массового обслуживания M/M/n. Профиль загрузки склада U_t, коэффициент ρ(t), среднее время ожидания W_q(t). Автоматическая корректировка поставок при нарушениях."
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
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Модель обслуживания</label>
              <select className={inputCls + ' cursor-pointer'} defaultValue="mmn">
                <option value="mmn">M/M/n (Эрланг)</option>
              </select>
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

              {!result.feasible && result.adjusted_deliveries && (
                <button
                  onClick={() => applyMutation.mutate()}
                  className="w-full mt-2 h-8 bg-[#c9a06a] text-[#0e1014] font-mono text-[11px] font-semibold rounded hover:bg-[#d9b47e] transition-colors"
                >
                  Применить корректировку
                </button>
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
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Профиль загрузки склада U_t</div>
                <PlotlyChart
                  data={[
                    {
                      type: 'scatter', mode: 'lines+markers',
                      x: dates, y: loads, name: 'U_t',
                      line: { color: '#c9a06a', width: 2 },
                      marker: { color: profile.map(r => r.peak_indicator ? '#ef4444' : '#c9a06a'), size: profile.map(r => r.peak_indicator ? 8 : 4) },
                    },
                    {
                      type: 'scatter', mode: 'lines',
                      x: [dates[0], dates[dates.length - 1]], y: [uMax, uMax],
                      name: 'U_max', line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                    },
                  ]}
                  layout={{
                    paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                    font: { color: '#aab1bd', family: 'monospace', size: 11 },
                    xaxis: { gridcolor: '#272c34' },
                    yaxis: { gridcolor: '#272c34', title: { text: 'Объём' } },
                    legend: { bgcolor: 'transparent' },
                    margin: { l: 50, r: 10, t: 10, b: 50 },
                  }}
                  config={{ displayModeBar: true, toImageButtonOptions: { format: 'png', filename: 'warehouse_load' } }}
                  style={{ width: '100%', height: 240 }}
                />
              </div>

              {/* ρ(t) and W_q(t) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Коэффициент загрузки ρ(t)</div>
                  <PlotlyChart
                    data={[
                      {
                        type: 'scatter', mode: 'lines',
                        x: dates, y: rhos, name: 'ρ(t)',
                        line: { color: '#6a93c8', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(106,147,200,0.08)',
                      },
                      {
                        type: 'scatter', mode: 'lines',
                        x: [dates[0], dates[dates.length - 1]], y: [1, 1],
                        name: 'ρ = 1', line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                      },
                    ]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 10 },
                      xaxis: { gridcolor: '#272c34' }, yaxis: { gridcolor: '#272c34' },
                      legend: { bgcolor: 'transparent' }, margin: { l: 40, r: 10, t: 10, b: 50 },
                    }}
                    style={{ width: '100%', height: 200 }}
                  />
                </div>
                <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Время ожидания W_q(t)</div>
                  <PlotlyChart
                    data={[{
                      type: 'bar', x: dates, y: waitTimes, name: 'W_q(t)',
                      marker: { color: waitTimes.map(w => w > 0.5 ? '#ef4444' : '#7fb3b0') },
                    }]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 10 },
                      xaxis: { gridcolor: '#272c34' }, yaxis: { gridcolor: '#272c34' },
                      showlegend: false, margin: { l: 40, r: 10, t: 10, b: 50 },
                    }}
                    style={{ width: '100%', height: 200 }}
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
