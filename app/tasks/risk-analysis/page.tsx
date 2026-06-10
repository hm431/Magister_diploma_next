'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import PlotlyChart from '@/components/ui/PlotlyChart';
import apiClient from '@/lib/api-client';
import { generatePdfReport } from '@/lib/pdf-report';
import { DEMO_DISCIPLINE, DEMO_WORK_RISK } from '@/lib/demo-data';

interface SupplierDisciplineRow {
  supplier_id: number;
  material_id: number;
  p_jk: number;
  d_jk: number;
  sample_size: number;
  is_unreliable: boolean;
}
interface SupplierDisciplineResponse {
  horizon_days: number;
  rows: SupplierDisciplineRow[];
  unreliable_count: number;
}
interface WorkRiskRow {
  work_id: number;
  tf: number;
  d_max: number;
  criticality_index: number;
  is_risky: boolean;
}
interface WorkRiskResponse {
  calculation_id: number;
  rows: WorkRiskRow[];
  risky_count: number;
}

const PROJECT_ID = 1;
const inputCls = 'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

export default function RiskAnalysisPage() {
  const [horizonDays, setHorizonDays] = useState(365);
  const [calcId, setCalcId] = useState<number>(1);
  const [discipline, setDiscipline] = useState<SupplierDisciplineResponse | null>(DEMO_DISCIPLINE as SupplierDisciplineResponse);
  const [workRisk, setWorkRisk] = useState<WorkRiskResponse | null>(DEMO_WORK_RISK as WorkRiskResponse);
  const [format, setFormat] = useState<'PDF' | 'XLSX'>('PDF');

  function handleDownload() {
    if (!discipline && !workRisk) { toast.error('Сначала выполните расчёт'); return; }
    if (format !== 'PDF') { toast(`Формат ${format} в разработке`, { icon: '⚠️' }); return; }
    const tables = [];
    if (discipline) {
      tables.push({
        title: `Дисциплина поставщиков (горизонт ${discipline.horizon_days} дн., ненадёжных: ${discipline.unreliable_count})`,
        head: ['Поставщик', 'Материал', 'p_jk (доля нарушений)', 'd_jk (ср. просрочка, дн.)', 'Выборка', 'Ненадёжный'],
        rows: discipline.rows.map(r => [
          r.supplier_id, r.material_id,
          r.p_jk.toFixed(4), r.d_jk.toFixed(2), r.sample_size,
          r.is_unreliable ? 'Да' : 'Нет',
        ]),
      });
    }
    if (workRisk) {
      tables.push({
        title: `Оценка рисков работ по МТР (расчёт №${workRisk.calculation_id}, рисковых: ${workRisk.risky_count})`,
        head: ['Работа', 'TF (запас, дн.)', 'd_max (макс. просрочка)', 'Инд. критичности', 'Рисковая'],
        rows: workRisk.rows.map(r => [
          r.work_id, r.tf, r.d_max.toFixed(2), r.criticality_index.toFixed(4),
          r.is_risky ? 'Да' : 'Нет',
        ]),
      });
    }
    generatePdfReport({
      docTitle: 'Оценка рисков поставок материально-технических ресурсов',
      taskName: 'Задача 2.3.5 — Анализ рисков МТО (статистика поставщиков)',
      calcId: workRisk?.calculation_id ?? '—',
      date: new Date().toISOString(),
      tables,
    });
  }
  const [activeTab, setActiveTab] = useState<'suppliers' | 'works'>('suppliers');

  const { data: schedule } = useQuery({
    queryKey: ['schedule', PROJECT_ID],
    queryFn: () => apiClient.get(`/sro/schedule/${PROJECT_ID}/latest`).then(r => r.data as { calculation_id: number }),
    retry: false,
    staleTime: 60_000,
  });

  const disciplineMutation = useMutation({
    mutationFn: () =>
      apiClient.post<SupplierDisciplineResponse>(`/risk/supplier-discipline?horizon_days=${horizonDays}`)
        .then(r => r.data),
    onSuccess: data => {
      setDiscipline(data);
      toast.success(`Дисциплина поставщиков рассчитана. Ненадёжных: ${data.unreliable_count}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const workRiskMutation = useMutation({
    mutationFn: (cid: number) =>
      apiClient.get<WorkRiskResponse>(`/risk/work-risk-log/${PROJECT_ID}/${cid}`)
        .then(r => r.data),
    onSuccess: data => {
      setWorkRisk(data);
      setActiveTab('works');
      toast.success(`Работы классифицированы. Рисковых: ${data.risky_count} из ${data.rows.length}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <TaskHeaderOrganism
        path="Анализ рисков"
        subSistem="РИСК"
        taskName="Задача 2.3.5 — Анализ рисков срыва сроков"
        taskDescription="SQL-агрегация дисциплины поставщиков. Работа считается рисковой если максимальное опоздание поставщика d_max превышает полный резерв TF_i."
      />

      <div className="flex flex-row w-full gap-4 mt-6 items-start">
        {/* ── LEFT: Controls ── */}
        <div className="w-72 shrink-0 border border-t-0 border-slate-800 bg-[#16181D] p-3">
          <div className="pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
              Дисциплина поставщиков
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <label className={labelCls}>Горизонт анализа (дней)</label>
                <span className="font-mono text-[10px] text-[#6a93c8]">{horizonDays}</span>
              </div>
              <input
                type="range" min={30} max={730} step={30} value={horizonDays}
                onChange={e => setHorizonDays(Number(e.target.value))}
                className="accent-[#6a93c8]"
              />
              <div className="font-mono text-[9px] text-slate-600">
                p_jk = доля просрочек, d_jk = среднее опоздание (дней)
              </div>
            </div>
            <button
              onClick={() => disciplineMutation.mutate()}
              disabled={disciplineMutation.isPending}
              className="w-full h-9 bg-[#6a93c8] hover:bg-[#82a6d4] disabled:opacity-50 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
            >
              {disciplineMutation.isPending ? 'Расчёт...' : '▶ Рассчитать дисциплину'}
            </button>
          </div>

          <div className="mt-4 pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
              Риски по работам
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Расчёт CPM #</label>
              <input
                type="number" min={1} value={schedule?.calculation_id ?? calcId}
                onChange={e => setCalcId(Number(e.target.value))}
                className={inputCls}
              />
              <div className="font-mono text-[9px] text-slate-600">is_risky = d_max {'>'} TF_i</div>
            </div>
            <button
              onClick={() => workRiskMutation.mutate(schedule?.calculation_id ?? calcId)}
              disabled={workRiskMutation.isPending}
              className="w-full h-9 bg-[#7fb3b0] hover:bg-[#9ecac7] disabled:opacity-50 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
            >
              {workRiskMutation.isPending ? 'Классификация...' : '▶ Классифицировать работы'}
            </button>
          </div>

          {(discipline || workRisk) && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              {discipline && (
                <div className="flex justify-between">
                  <span className={labelCls}>Ненадёжных поставщиков</span>
                  <span className="font-mono text-[12px] font-semibold text-red-400">
                    {discipline.unreliable_count}
                  </span>
                </div>
              )}
              {workRisk && (
                <div className="flex justify-between">
                  <span className={labelCls}>Рисковых работ</span>
                  <span className="font-mono text-[12px] font-semibold text-amber-300">
                    {workRisk.risky_count} / {workRisk.rows.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CENTER: Tables ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {[
              { id: 'suppliers' as const, label: 'Дисциплина поставщиков' },
              { id: 'works' as const, label: 'Рисковые работы' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 font-mono text-[12px] tracking-wide border-b-2 -mb-[2px] transition-colors ${activeTab === t.id ? 'border-[#6a93c8] text-[#6a93c8]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'suppliers' && (
            discipline ? (
              <div className="flex flex-col gap-4">
              {/* Bubble chart: p_jk vs d_jk */}
              <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                  Матрица дисциплины поставщиков: p_jk (доля просрочек) × d_jk (среднее опоздание)
                </div>
                <PlotlyChart
                  data={[
                    {
                      type: 'scatter', mode: 'markers',
                      x: discipline.rows.filter(r => !r.is_unreliable).map(r => r.p_jk * 100),
                      y: discipline.rows.filter(r => !r.is_unreliable).map(r => r.d_jk),
                      name: 'Надёжные',
                      text: discipline.rows.filter(r => !r.is_unreliable).map(r => `Пост.${r.supplier_id} / МТР${r.material_id}`),
                      marker: {
                        color: '#7fb3b0', size: discipline.rows.filter(r => !r.is_unreliable).map(r => Math.max(8, r.sample_size / 2)),
                        opacity: 0.85, line: { color: '#5a9390', width: 1 },
                      },
                      hovertemplate: '<b>%{text}</b><br>p_jk = %{x:.1f}%<br>d_jk = %{y:.1f} дн.<br>n = %{customdata}<extra></extra>',
                      customdata: discipline.rows.filter(r => !r.is_unreliable).map(r => r.sample_size),
                    },
                    {
                      type: 'scatter', mode: 'markers',
                      x: discipline.rows.filter(r => r.is_unreliable).map(r => r.p_jk * 100),
                      y: discipline.rows.filter(r => r.is_unreliable).map(r => r.d_jk),
                      name: 'Ненадёжные',
                      text: discipline.rows.filter(r => r.is_unreliable).map(r => `Пост.${r.supplier_id} / МТР${r.material_id}`),
                      marker: {
                        color: '#ef4444', size: discipline.rows.filter(r => r.is_unreliable).map(r => Math.max(8, r.sample_size / 2)),
                        symbol: 'diamond', opacity: 0.9, line: { color: '#cc2222', width: 1 },
                      },
                      hovertemplate: '<b>%{text}</b><br>p_jk = %{x:.1f}%<br>d_jk = %{y:.1f} дн.<br>n = %{customdata} ⚠<extra></extra>',
                      customdata: discipline.rows.filter(r => r.is_unreliable).map(r => r.sample_size),
                    },
                    {
                      type: 'scatter', mode: 'lines',
                      x: [25, 25], y: [0, Math.max(...discipline.rows.map(r => r.d_jk)) * 1.1],
                      name: 'Порог p_jk = 25%',
                      line: { color: '#f59e0b', dash: 'dash', width: 1.5 },
                    },
                    {
                      type: 'scatter', mode: 'lines',
                      x: [0, 45], y: [10, 10],
                      name: 'Порог d_jk = 10 дн.',
                      line: { color: '#f59e0b', dash: 'dot', width: 1.5 },
                    },
                  ]}
                  layout={{
                    paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                    font: { color: '#aab1bd', family: 'monospace', size: 11 },
                    xaxis: { gridcolor: '#272c34', title: { text: 'p_jk — доля просрочек, %' }, zeroline: false },
                    yaxis: { gridcolor: '#272c34', title: { text: 'd_jk — среднее опоздание, дн.' }, zeroline: false },
                    legend: { bgcolor: 'rgba(21,24,29,0.8)', bordercolor: '#272c34', borderwidth: 1 },
                    margin: { l: 60, r: 20, t: 10, b: 60 },
                    annotations: [{
                      x: 0.98, y: 0.97, xref: 'paper', yref: 'paper',
                      text: '● размер = объём выборки n',
                      showarrow: false, font: { size: 9, color: '#6b7380' }, xanchor: 'right',
                    }],
                  }}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%', height: 260 }}
                />
              </div>
              <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">
                  Рейтинг дисциплины поставщиков (горизонт {discipline.horizon_days} дней)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['Поставщик', 'Материал', 'p_jk (просрочки)', 'd_jk (сред. опоздание)', 'n', 'Статус'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...discipline.rows]
                        .sort((a, b) => b.p_jk - a.p_jk)
                        .map((row, i) => (
                          <tr key={`${row.supplier_id}-${row.material_id}`}
                            className={`border-b border-slate-800/40 ${row.is_unreliable ? 'bg-red-950/15' : i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
                            <td className="px-4 py-2 text-slate-300">#{row.supplier_id}</td>
                            <td className="px-4 py-2 text-slate-300">#{row.material_id}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${row.is_unreliable ? 'bg-red-500' : 'bg-teal-500'}`}
                                    style={{ width: `${Math.min(row.p_jk * 100, 100)}%` }} />
                                </div>
                                <span className="font-mono text-[12px] text-slate-300">{(row.p_jk * 100).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 font-mono text-[12px] text-slate-300">{row.d_jk.toFixed(1)} дн.</td>
                            <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{row.sample_size}</td>
                            <td className="px-4 py-2">
                              {row.is_unreliable
                                ? <span className="font-mono text-[10px] text-red-400">⚠ Ненадёжный</span>
                                : <span className="font-mono text-[10px] text-teal-400">✓ Надёжный</span>}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-72 bg-[#16181D] border border-slate-800 rounded">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 mb-2">Дисциплина поставщиков</div>
                <p className="text-slate-600 text-sm">Нажмите «Рассчитать дисциплину»</p>
              </div>
            )
          )}

          {activeTab === 'works' && (
            workRisk ? (
              <div className="flex flex-col gap-4">
              {/* Scatter: d_max vs TF */}
              <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                  Карта рисков: d_max (просрочка поставщика) vs TF_i (резерв работы)
                </div>
                <PlotlyChart
                  data={[
                    {
                      type: 'scatter', mode: 'markers',
                      x: workRisk.rows.filter(r => !r.is_risky).map(r => r.tf),
                      y: workRisk.rows.filter(r => !r.is_risky).map(r => r.d_max),
                      name: 'Безопасная зона',
                      text: workRisk.rows.filter(r => !r.is_risky).map(r => `Работа #${r.work_id}`),
                      marker: { color: '#7fb3b0', size: 10, opacity: 0.85, line: { color: '#5a9390', width: 1 } },
                      hovertemplate: '<b>%{text}</b><br>TF = %{x} дн.<br>d_max = %{y:.1f} дн.<extra></extra>',
                    },
                    {
                      type: 'scatter', mode: 'markers',
                      x: workRisk.rows.filter(r => r.is_risky).map(r => r.tf),
                      y: workRisk.rows.filter(r => r.is_risky).map(r => r.d_max),
                      name: 'Рисковые работы',
                      text: workRisk.rows.filter(r => r.is_risky).map(r => `Работа #${r.work_id}`),
                      marker: { color: '#ef4444', size: 13, symbol: 'diamond', opacity: 0.9, line: { color: '#cc2222', width: 1 } },
                      hovertemplate: '<b>%{text}</b><br>TF = %{x} дн.<br>d_max = %{y:.1f} дн. ← РИСК<extra></extra>',
                    },
                    {
                      type: 'scatter', mode: 'lines',
                      x: [0, Math.max(...workRisk.rows.map(r => r.tf), 1) * 1.1],
                      y: [0, Math.max(...workRisk.rows.map(r => r.tf), 1) * 1.1],
                      name: 'd_max = TF (граница риска)',
                      line: { color: '#f59e0b', dash: 'dash', width: 1.5 },
                      hovertemplate: 'Граница риска: d_max = TF<extra></extra>',
                    },
                  ]}
                  layout={{
                    paper_bgcolor: '#15181d', plot_bgcolor: '#0e1014',
                    font: { color: '#aab1bd', family: 'monospace', size: 11 },
                    xaxis: { gridcolor: '#272c34', title: { text: 'TF_i — полный резерв времени, дн.' }, zeroline: false },
                    yaxis: { gridcolor: '#272c34', title: { text: 'd_max — макс. просрочка поставщика, дн.' }, zeroline: false },
                    legend: { bgcolor: 'rgba(21,24,29,0.8)', bordercolor: '#272c34', borderwidth: 1 },
                    margin: { l: 60, r: 20, t: 15, b: 60 },
                    annotations: [{
                      x: 0.02, y: 0.97, xref: 'paper', yref: 'paper',
                      text: '⚠ выше диагонали → is_risky = true',
                      showarrow: false,
                      font: { size: 10, color: '#f59e0b' },
                      align: 'left',
                    }],
                  }}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%', height: 260 }}
                />
              </div>
              <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">
                  Классификация работ по риску (расчёт #{workRisk.calculation_id})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['Работа', 'TF_i (резерв)', 'd_max (дни)', 'd_max / TF_i', 'Риск'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-mono text-[10px] uppercase text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...workRisk.rows]
                        .sort((a, b) => b.criticality_index - a.criticality_index)
                        .map((row, i) => (
                          <tr key={row.work_id}
                            className={`border-b border-slate-800/40 ${row.is_risky ? 'bg-red-950/15' : i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
                            <td className="px-4 py-2 text-slate-300">#{row.work_id}</td>
                            <td className="px-4 py-2 font-mono text-[12px] text-slate-400">{row.tf} дн.</td>
                            <td className="px-4 py-2 font-mono text-[12px] text-slate-300">{row.d_max.toFixed(1)} дн.</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${row.is_risky ? 'bg-red-500' : 'bg-teal-500'}`}
                                    style={{ width: `${Math.min(row.criticality_index * 100, 100)}%` }} />
                                </div>
                                <span className="font-mono text-[12px] text-slate-300">{row.criticality_index.toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {row.is_risky
                                ? <span className="font-mono text-[10px] text-red-400">⚠ РИСКОВАЯ</span>
                                : <span className="font-mono text-[10px] text-slate-600">нет</span>}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-72 bg-[#16181D] border border-slate-800 rounded">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 mb-2">Риски по работам</div>
                <p className="text-slate-600 text-sm">Нажмите «Классифицировать работы»</p>
              </div>
            )
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
              {workRisk ? `Рисковых работ: ${workRisk.risky_count}` : 'версия от —'}
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
