'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import apiClient from '@/lib/api-client';

interface ScheduleCalc { calculation_id: number; version: number; t_min: number | null }
interface DemandRow { material_id: number; demand_date: string; quantity: number }
interface DeliveryRow { material_id: number; warehouse_id: number; supplier_id: number; planned_date: string; planned_volume: number; unit_cost: number }
interface AvailabilityRow { material_id: number; availability_date: string }
interface SupplyPlanResponse {
  project_id: number; calculation_id: number; total_cost: number;
  demand: DemandRow[]; deliveries: DeliveryRow[]; availability: AvailabilityRow[];
  solver_status: string;
}

const PROJECT_ID = 1;
const inputCls = 'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

export default function MaterialsProcurementPage() {
  const [result, setResult] = useState<SupplyPlanResponse | null>(null);
  const [selectedMat, setSelectedMat] = useState<number | null>(null);
  const [format, setFormat] = useState<'PDF' | 'XLSX'>('PDF');

  const { data: schedule } = useQuery<ScheduleCalc>({
    queryKey: ['schedule', PROJECT_ID],
    queryFn: () => apiClient.get(`/sro/schedule/${PROJECT_ID}/latest`).then(r => r.data),
    retry: false,
  });

  const calcMutation = useMutation({
    mutationFn: (calcId: number) =>
      apiClient.post<SupplyPlanResponse>(`/mtr/supply-plan/${PROJECT_ID}/${calcId}`).then(r => r.data),
    onSuccess: data => {
      setResult(data);
      const mats = [...new Set(data.demand.map(d => d.material_id))];
      if (mats.length) setSelectedMat(mats[0]);
      toast.success(`График поставок рассчитан. F₁ = ${data.total_cost.toFixed(2)} руб.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const export1cMutation = useMutation({
    mutationFn: () => apiClient.post('/integration/export-1c', { project_id: PROJECT_ID }).then(r => r.data),
    onSuccess: () => toast.success('Заявки выгружены в 1С'),
    onError: (e: Error) => toast.error(e.message),
  });

  const materialIds = result ? [...new Set(result.demand.map(d => d.material_id))] : [];
  const activeMat = selectedMat ?? materialIds[0];
  const demandRows = result?.demand.filter(d => d.material_id === activeMat) ?? [];
  const avail = result?.availability.find(a => a.material_id === activeMat);

  return (
    <div>
      <TaskHeaderOrganism
        path="График закупок МТР"
        subSistem="МТО"
        taskName="Задача 2.1 — График закупок МТР"
        taskDescription="LP-оптимизация плана поставок материалов под утверждённый календарный график. Расчёт суточной потребности Q_jt и дат доступности T_доступ(j)."
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
                <div className="font-mono text-[10px] text-teal-400">Расчёт #{ schedule.calculation_id}</div>
                <div className="font-mono text-[10px] text-slate-500">T_min = {schedule.t_min ?? '—'} дн.</div>
              </div>
            ) : (
              <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded">
                <div className="font-mono text-[10px] text-amber-400">⚠ Выполните Задачу 1.1 сначала</div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Целевая функция</label>
              <select className={inputCls + ' cursor-pointer'} defaultValue="min_cost">
                <option value="min_cost">Минимизация стоимости F₁</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => schedule && calcMutation.mutate(schedule.calculation_id)}
            disabled={!schedule || calcMutation.isPending}
            className="w-full mt-5 h-9 bg-[#c9a06a] hover:bg-[#d9b47e] disabled:opacity-40 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
          >
            {calcMutation.isPending ? 'Расчёт...' : '▶ Рассчитать'}
          </button>

          {result && (
            <button
              onClick={() => export1cMutation.mutate()}
              disabled={export1cMutation.isPending}
              className="w-full mt-2 h-8 border border-[#c9a06a]/50 text-[#c9a06a] font-mono text-[11px] rounded hover:bg-[#c9a06a]/10 disabled:opacity-50 transition-colors"
            >
              {export1cMutation.isPending ? 'Выгрузка...' : '↑ Выгрузить в 1С'}
            </button>
          )}

          {result && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex flex-col gap-0.5">
                <span className={labelCls}>Общая стоимость F₁</span>
                <span className="font-mono text-base text-[#c9a06a] font-semibold">{result.total_cost.toLocaleString('ru')} руб.</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={labelCls}>Статус решателя</span>
                <span className="font-mono text-[12px] text-slate-300">{result.solver_status}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={labelCls}>Поставок</span>
                <span className="font-mono text-[12px] text-slate-300">{result.deliveries.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER: Analytics ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {result ? (
            <>
              {/* Material selector */}
              {materialIds.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-slate-500">Материал:</span>
                  {materialIds.map(mid => (
                    <button
                      key={mid}
                      onClick={() => setSelectedMat(mid)}
                      className={`h-7 px-3 rounded font-mono text-[11px] transition-colors ${activeMat === mid ? 'bg-[#c9a06a] text-[#0e1014]' : 'border border-slate-700 text-slate-400 hover:text-slate-200'}`}
                    >
                      МТР #{mid}
                    </button>
                  ))}
                </div>
              )}

              {/* Demand chart */}
              <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                  Плановая потребность Q_jt — МТР #{activeMat}
                </div>
                <PlotlyChart
                  data={[
                    {
                      type: 'bar',
                      x: demandRows.map(d => d.demand_date),
                      y: demandRows.map(d => d.quantity),
                      name: `Q_jt МТР #${activeMat}`,
                      marker: { color: '#c9a06a' },
                    },
                    ...(avail ? [{
                      type: 'scatter' as const,
                      mode: 'lines' as const,
                      x: [avail.availability_date, avail.availability_date],
                      y: [0, Math.max(...demandRows.map(d => d.quantity), 1) * 1.15],
                      name: `T_доступ = ${avail.availability_date}`,
                      line: { color: '#ef4444', dash: 'dash' as const, width: 2 },
                    }] : []),
                  ]}
                  layout={{
                    paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                    font: { color: '#aab1bd', family: 'monospace', size: 11 },
                    xaxis: { gridcolor: '#272c34', title: { text: 'Дата' } },
                    yaxis: { gridcolor: '#272c34', title: { text: 'Объём' } },
                    legend: { bgcolor: 'transparent' },
                    margin: { l: 50, r: 10, t: 10, b: 50 },
                  }}
                  config={{ displayModeBar: true, toImageButtonOptions: { format: 'png', filename: 'demand' } }}
                  style={{ width: '100%', height: 280 }}
                />
              </div>

              {/* Deliveries table */}
              <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">
                  График поставок
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['МТР', 'Склад', 'Поставщик', 'Дата', 'Объём', 'Цена', 'Сумма'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.deliveries.map((d, i) => (
                        <tr key={i} className={`border-b border-slate-800/40 ${i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-500">#{d.material_id}</td>
                          <td className="px-3 py-2 text-slate-400">#{d.warehouse_id}</td>
                          <td className="px-3 py-2 text-slate-400">#{d.supplier_id}</td>
                          <td className="px-3 py-2 font-mono text-[12px] text-slate-300">{d.planned_date}</td>
                          <td className="px-3 py-2 font-mono text-[12px] text-slate-300">{d.planned_volume.toFixed(2)}</td>
                          <td className="px-3 py-2 font-mono text-[12px] text-slate-500">{d.unit_cost.toFixed(2)}</td>
                          <td className="px-3 py-2 font-mono text-[12px] text-[#c9a06a]">{(d.planned_volume * d.unit_cost).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-700 bg-[#15181d]">
                        <td colSpan={6} className="px-3 py-2 font-mono text-[11px] text-slate-500 text-right">Итого F₁ =</td>
                        <td className="px-3 py-2 font-mono text-sm font-bold text-[#c9a06a]">{result.total_cost.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Availability cards */}
              {result.availability.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {result.availability.map(a => (
                    <div key={a.material_id} className="p-3 bg-[#15181d] border border-slate-800 rounded">
                      <div className={labelCls}>МТР #{a.material_id} — T_доступ</div>
                      <div className="font-mono text-sm font-semibold text-slate-200 mt-1">{a.availability_date}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-72 bg-[#16181D] border border-slate-800 rounded">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 mb-2">Результат расчёта</div>
              <p className="text-slate-600 text-sm">
                {calcMutation.isPending ? 'Выполняется расчёт...' : 'Нажмите «Рассчитать»'}
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
            <div className="text-[11px] font-semibold text-center text-[#e8eaee]">График закупок МТР</div>
            <div className="font-mono text-[9px] text-center text-[#6b7380] mt-1">
              {result ? `F₁ = ${result.total_cost.toFixed(0)} руб.` : 'версия от —'}
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
