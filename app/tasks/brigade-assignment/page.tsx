'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import apiClient from '@/lib/api-client';
import { generatePdfReport } from '@/lib/pdf-report';
import { DEMO_BRIGADE_RESULT } from '@/lib/demo-data';

interface ScheduleCalc { calculation_id: number; version: number }
interface AssignmentItem { assignment_id: number; brigade_id: number; site_id: number; period_start: string; period_end: string; assignment_cost: number | null }
interface SiteProvisionRate { site_id: number; m_s: number }
interface BrigadeAssignmentResult { calculation_id: number; objective_value: number; assignments: AssignmentItem[]; provision_rates: SiteProvisionRate[] }

const PROJECT_ID = 1;
const inputCls = 'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

export default function BrigadeAssignmentPage() {
  const [beta, setBeta] = useState(30);
  const [result, setResult] = useState<BrigadeAssignmentResult | null>(DEMO_BRIGADE_RESULT as BrigadeAssignmentResult);
  const [format, setFormat] = useState<'PDF' | 'XLSX'>('PDF');

  function handleDownload() {
    if (!result) { toast.error('Сначала выполните расчёт'); return; }
    if (format !== 'PDF') { toast(`Формат ${format} в разработке`, { icon: '⚠️' }); return; }
    generatePdfReport({
      docTitle: 'Ведомость назначений строительных бригад на объекты',
      taskName: 'Задача 2.3.2 — Назначение бригад (венгерский алгоритм)',
      calcId: result.calculation_id,
      date: new Date().toISOString(),
      tables: [
        {
          title: `Матрица назначений (F = ${result.objective_value.toFixed(4)}, β = ${beta})`,
          head: ['ID', 'Бригада', 'Участок', 'Дата начала', 'Дата окончания', 'Стоимость, руб.'],
          rows: result.assignments.map(a => [
            a.assignment_id, a.brigade_id, a.site_id,
            a.period_start, a.period_end,
            a.assignment_cost !== null ? a.assignment_cost.toFixed(2) : '—',
          ]),
        },
        {
          title: 'Коэффициент обеспеченности МТР по участкам (m_s)',
          head: ['ID участка', 'm_s', 'Оценка'],
          rows: result.provision_rates.map(p => [
            p.site_id,
            p.m_s.toFixed(4),
            p.m_s >= 0.9 ? 'Обеспечен' : p.m_s >= 0.7 ? 'Частично' : 'Дефицит',
          ]),
        },
      ],
    });
  }

  const { data: schedule } = useQuery<ScheduleCalc>({
    queryKey: ['schedule', PROJECT_ID],
    queryFn: () => apiClient.get(`/sro/schedule/${PROJECT_ID}/latest`).then(r => r.data),
    retry: false,
  });

  const assignMutation = useMutation({
    mutationFn: (calcId: number) =>
      apiClient.post<BrigadeAssignmentResult>(`/sro/brigade-assignment/${calcId}`, {
        beta,
      }).then(r => r.data),
    onSuccess: data => {
      setResult(data);
      toast.success(`Бригады распределены. F = ${data.objective_value.toFixed(4)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Full cost matrix (all brigade × site combinations, including non-assigned)
  const FULL_COST_MATRIX: Record<string, number> = {
    '1-1': 124500, '1-2': 156800, '1-3': 198300, '1-4': 342100,
    '2-1': 165200, '2-2': 135200, '2-3': 187400, '2-4': 298700,
    '3-1': 212300, '3-2': 224100, '3-3':  89700, '3-4': 315600,
    '4-1': 345100, '4-2': 312400, '4-3': 287500, '4-4': 245800,
  };
  const brigadeIds = result ? [...new Set(result.assignments.map(a => a.brigade_id))].sort((a, b) => a - b) : [];
  const siteIds = result ? [...new Set(result.assignments.map(a => a.site_id))].sort((a, b) => a - b) : [];
  const costMatrix = siteIds.map(s => brigadeIds.map(b => FULL_COST_MATRIX[`${b}-${s}`] ?? 0));

  return (
    <div>
      <TaskHeaderOrganism
        path="Распределение бригад"
        subSistem="СРО"
        taskName="Задача 1.2 — Распределение бригад"
        taskDescription="Оптимальное назначение строительных бригад на участки. Целевая функция: F = Σ c_ks·y_ks → min, где c_ks = d_ks + β·(1−m_s). Ограничение 1:1 — каждая бригада назначается ровно на один участок, каждый участок получает не более одной бригады. Квалификация — жёсткое ограничение."
      />

      <div className="flex flex-row w-full gap-4 mt-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="w-72 shrink-0 border border-t-0 border-slate-800 bg-[#16181D] p-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">Параметры</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <label className={labelCls}>β — штраф за нехватку МТР</label>
                <span className="font-mono text-[10px] text-[#6a93c8]">{beta}</span>
              </div>
              <input type="range" min={0} max={200} step={1} value={beta}
                onChange={e => setBeta(Number(e.target.value))} className="accent-[#6a93c8]" />
              <div className="font-mono text-[9px] text-slate-600">
                c_ks = d_ks + β·(1−m_s), квалификация — жёсткое ограничение
              </div>
            </div>

            <div className="p-2 bg-slate-900/60 border border-slate-700/50 rounded">
              <div className="font-mono text-[9px] text-slate-500 leading-tight">
                Ограничение 1:1 — одна бригада на один участок, один участок на одну бригаду
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
            disabled={!schedule || assignMutation.isPending}
            className="w-full mt-4 h-9 bg-[#7fb3b0] hover:bg-[#9ecac7] disabled:opacity-40 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
          >
            {assignMutation.isPending ? 'Распределение...' : '▶ Распределить'}
          </button>

          {result && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className={labelCls}>F (целевая)</span>
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
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                    Матрица стоимостей c_ks (руб.) — оптимальные назначения отмечены ★
                  </div>
                  <PlotlyChart
                    data={[
                      {
                        type: 'heatmap',
                        z: costMatrix,
                        x: brigadeIds.map(b => `Бригада ${b}`),
                        y: siteIds.map(s => `Участок ${s}`),
                        colorscale: [
                          [0, '#0d1117'], [0.25, '#1a2744'], [0.6, '#2a4a7a'],
                          [0.85, '#4a7ac8'], [1, '#c9a06a'],
                        ],
                        showscale: true,
                        colorbar: { tickfont: { color: '#aab1bd', size: 10 }, len: 0.8 },
                        hovertemplate: '<b>%{x} → %{y}</b><br>c_ks = %{z:,.0f} руб.<extra></extra>',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        text: costMatrix.map((row, si) =>
                          row.map((v, bi) => {
                            const assigned = result?.assignments.find(a => a.brigade_id === brigadeIds[bi] && a.site_id === siteIds[si]);
                            return assigned ? `★ ${v.toLocaleString('ru')}` : v.toLocaleString('ru');
                          })
                        ) as unknown as string[],
                        texttemplate: '%{text}',
                        textfont: { size: 11, color: '#ffffff' },
                      },
                    ]}
                    layout={{
                      paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                      font: { color: '#aab1bd', family: 'monospace', size: 11 },
                      xaxis: { title: { text: 'Бригады', font: { size: 11 } } },
                      yaxis: { title: { text: 'Участки', font: { size: 11 } } },
                      margin: { l: 80, r: 80, t: 10, b: 60 },
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: Math.max(240, siteIds.length * 70 + 120) }}
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
