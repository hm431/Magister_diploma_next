'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import apiClient from '@/lib/api-client';

interface ScheduleCalc { calculation_id: number; version: number }
interface AssignmentItem { assignment_id: number; brigade_id: number; site_id: number; period_start: string; period_end: string; assignment_cost: number | null }
interface SiteProvisionRate { site_id: number; m_s: number }
interface BrigadeAssignmentResult { calculation_id: number; objective_value: number; assignments: AssignmentItem[]; provision_rates: SiteProvisionRate[] }

const PROJECT_ID = 1;
const inputCls = 'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

export default function BrigadeAssignmentPage() {
  const [alpha1, setAlpha1] = useState(0.50);
  const [alpha2, setAlpha2] = useState(0.30);
  const [alpha3, setAlpha3] = useState(0.20);
  const [result, setResult] = useState<BrigadeAssignmentResult | null>(null);
  const [format, setFormat] = useState<'PDF' | 'XLSX'>('PDF');

  const sumAlphas = +(alpha1 + alpha2 + alpha3).toFixed(6);
  const alphasValid = Math.abs(sumAlphas - 1) < 0.001;

  const { data: schedule } = useQuery<ScheduleCalc>({
    queryKey: ['schedule', PROJECT_ID],
    queryFn: () => apiClient.get(`/sro/schedule/${PROJECT_ID}/latest`).then(r => r.data),
    retry: false,
  });

  const assignMutation = useMutation({
    mutationFn: (calcId: number) =>
      apiClient.post<BrigadeAssignmentResult>(`/sro/brigade-assignment/${calcId}`, {
        alpha1, alpha2, alpha3, n_min: 1, n_max: 3,
      }).then(r => r.data),
    onSuccess: data => {
      setResult(data);
      toast.success(`Бригады распределены. F₃ = ${data.objective_value.toFixed(4)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Heatmap matrix
  const brigadeIds = result ? [...new Set(result.assignments.map(a => a.brigade_id))].sort((a, b) => a - b) : [];
  const siteIds = result ? [...new Set(result.assignments.map(a => a.site_id))].sort((a, b) => a - b) : [];
  const costMatrix = siteIds.map(s => brigadeIds.map(b => {
    const a = result?.assignments.find(a => a.brigade_id === b && a.site_id === s);
    return a?.assignment_cost ?? 0;
  }));

  return (
    <div>
      <TaskHeaderOrganism
        path="Распределение бригад"
        subSistem="СРО"
        taskName="Задача 1.2 — Распределение бригад"
        taskDescription="Оптимальное назначение строительных бригад на участки с минимизацией целевой функции F₃ = α₁·c₁ + α₂·c₂ + α₃·c₃."
      />

      <div className="flex flex-row w-full gap-4 mt-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="w-72 shrink-0 border border-t-0 border-slate-800 bg-[#16181D] p-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">Веса F₃</span>
            <span className={`font-mono text-[10px] ${alphasValid ? 'text-teal-400' : 'text-red-400'}`}>
              Σ = {sumAlphas.toFixed(2)}
            </span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'α₁ — квалификация', val: alpha1, set: setAlpha1 },
              { label: 'α₂ — транспорт', val: alpha2, set: setAlpha2 },
              { label: 'α₃ — МТР', val: alpha3, set: setAlpha3 },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <label className={labelCls}>{label}</label>
                  <span className="font-mono text-[10px] text-[#6a93c8]">{val.toFixed(2)}</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={val}
                  onChange={e => set(Number(e.target.value))} className="accent-[#6a93c8]" />
              </div>
            ))}

            {!alphasValid && (
              <button
                onClick={() => { const s = alpha1 + alpha2 + alpha3; if (s > 0) { setAlpha1(+(alpha1/s).toFixed(2)); setAlpha2(+(alpha2/s).toFixed(2)); setAlpha3(+(1 - alpha1/s - alpha2/s).toFixed(2)); } }}
                className="text-[11px] text-[#6a93c8] font-mono underline"
              >
                Нормализовать →
              </button>
            )}

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Бригад на участок</label>
              <div className="flex gap-2">
                <input className={inputCls} defaultValue="1" placeholder="min" />
                <input className={inputCls} defaultValue="3" placeholder="max" />
              </div>
            </div>
          </div>

          {schedule ? (
            <div className="mt-3 p-2 bg-teal-950/30 border border-teal-800/40 rounded">
              <div className="font-mono text-[10px] text-teal-400">Расчёт #{schedule.calculation_id}</div>
            </div>
          ) : (
            <div className="mt-3 p-2 bg-amber-950/30 border border-amber-800/40 rounded">
              <div className="font-mono text-[10px] text-amber-400">⚠ Выполните Задачу 1.1 сначала</div>
            </div>
          )}

          <button
            onClick={() => schedule && assignMutation.mutate(schedule.calculation_id)}
            disabled={!schedule || !alphasValid || assignMutation.isPending}
            className="w-full mt-4 h-9 bg-[#7fb3b0] hover:bg-[#9ecac7] disabled:opacity-40 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
          >
            {assignMutation.isPending ? 'Распределение...' : '▶ Распределить'}
          </button>

          {result && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className={labelCls}>F₃ (целевая)</span>
                <span className="font-mono text-sm text-[#6a93c8] font-semibold">{result.objective_value.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className={labelCls}>Назначений</span>
                <span className="font-mono text-[12px] text-slate-300">{result.assignments.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER: Analytics ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {result ? (
            <>
              {/* Heatmap */}
              {brigadeIds.length > 0 && siteIds.length > 0 && (
                <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Матрица стоимостей c_ks</div>
                  <PlotlyChart
                    data={[{
                      type: 'heatmap',
                      z: costMatrix,
                      x: brigadeIds.map(b => `Бр.${b}`),
                      y: siteIds.map(s => `Уч.${s}`),
                      colorscale: [[0, '#0e1014'], [0.5, '#2a3a52'], [1, '#6a93c8']],
                      showscale: true,
                      hovertemplate: 'Бригада: %{x}<br>Участок: %{y}<br>c_ks: %{z:.2f}<extra></extra>',
                    }]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 11 },
                      xaxis: { title: { text: 'Бригады' } },
                      yaxis: { title: { text: 'Участки' } },
                      margin: { l: 60, r: 60, t: 10, b: 50 },
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: Math.max(200, siteIds.length * 50 + 100) }}
                  />
                </div>
              )}

              {/* Provision rates */}
              <div className="bg-[#15181d] border border-slate-800 rounded p-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">
                  Коэффициент обеспеченности m_s
                </div>
                <div className="space-y-3">
                  {result.provision_rates.map(pr => (
                    <div key={pr.site_id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[12px] text-slate-400">Участок #{pr.site_id}</span>
                        <span className={`font-mono text-[12px] font-semibold ${pr.m_s >= 0.8 ? 'text-teal-300' : pr.m_s >= 0.5 ? 'text-amber-300' : 'text-red-400'}`}>
                          {(pr.m_s * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pr.m_s >= 0.8 ? 'bg-teal-500' : pr.m_s >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(pr.m_s * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments table */}
              <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">Назначения</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['Бригада', 'Участок', 'Начало', 'Окончание', 'c_ks'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.assignments.map((a, i) => (
                        <tr key={a.assignment_id} className={`border-b border-slate-800/40 ${i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
                          <td className="px-4 py-2 text-slate-300">Бригада #{a.brigade_id}</td>
                          <td className="px-4 py-2 text-slate-300">Участок #{a.site_id}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-400">{a.period_start}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-400">{a.period_end}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-300">{a.assignment_cost != null ? a.assignment_cost.toFixed(2) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-72 bg-[#16181D] border border-slate-800 rounded">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 mb-2">Результат расчёта</div>
              <p className="text-slate-600 text-sm">
                {assignMutation.isPending ? 'Распределение...' : 'Задайте веса α и нажмите «Распределить»'}
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
            <div className="text-[11px] font-semibold text-center text-[#e8eaee]">Ведомость назначений бригад</div>
            <div className="font-mono text-[9px] text-center text-[#6b7380] mt-1">
              {result ? `F₃ = ${result.objective_value.toFixed(4)}` : 'версия от —'}
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
