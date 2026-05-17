'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import TaskHeaderOrganism from '@/components/organisms/TaskHeaderOrganism';
import GanttChart, { GanttWork } from '@/components/ui/GanttChart';
import apiClient from '@/lib/api-client';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Work {
  id: number;
  name: string;
  duration_days: number;
  predecessors: number[];
  status: string;
}
interface ScheduleItem {
  work_id: number;
  es: number; ef: number; ls: number; lf: number; tf: number;
  is_critical: boolean;
}
interface ScheduleCalc {
  calculation_id: number;
  version: number;
  scenario: string;
  t_min: number | null;
  calculation_date: string;
  items: ScheduleItem[];
}
interface WorkFormFields {
  name: string;
  duration_days: string;
  predecessors: string;
}

const PROJECT_ID = 1;

// ─── Shared atom styles ───────────────────────────────────────────────────────
const inputCls =
  'h-9 w-full px-3 bg-slate-900/50 border border-slate-800 rounded text-[13px] text-slate-200 font-mono placeholder-slate-600 focus:border-[#6a93c8] focus:outline-none transition-colors';
const labelCls = 'font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500';

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">{children}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkSchedulePage() {
  const qc = useQueryClient();
  const [schedule, setSchedule] = useState<ScheduleCalc | null>(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [format, setFormat] = useState<'PDF' | 'XLSX' | 'MPP'>('PDF');

  const { data: works, isLoading: worksLoading } = useQuery<Work[]>({
    queryKey: ['works', PROJECT_ID],
    queryFn: () =>
      apiClient.get('/works', { params: { project_id: PROJECT_ID } }).then(r => r.data),
  });

  const calcMutation = useMutation({
    mutationFn: () =>
      apiClient.post<ScheduleCalc>(`/sro/schedule/${PROJECT_ID}`).then(r => r.data),
    onSuccess: data => {
      setSchedule(data);
      toast.success(`График рассчитан. T_min = ${data.t_min} дн. Версия ${data.version}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addWorkMutation = useMutation({
    mutationFn: (body: { name: string; duration_days: number; predecessors: number[]; project_id: number }) =>
      apiClient.post<Work>('/works', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['works', PROJECT_ID] });
      toast.success('Работа добавлена');
      setShowAddWork(false);
      workForm.reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const workForm = useForm<WorkFormFields>();

  function onAddWork(data: WorkFormFields) {
    const predecessors = data.predecessors
      ? data.predecessors.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : [];
    addWorkMutation.mutate({
      name: data.name,
      duration_days: parseInt(data.duration_days, 10) || 1,
      predecessors,
      project_id: PROJECT_ID,
    });
  }

  // Build Gantt data
  const ganttWorks: GanttWork[] = (() => {
    if (!works || !schedule) return [];
    const map = new Map(schedule.items.map(i => [i.work_id, i]));
    return works.flatMap(w => {
      const item = map.get(w.id);
      if (!item) return [];
      return [{ id: w.id, name: w.name, es: item.es, ef: item.ef, ls: item.ls, lf: item.lf, tf: item.tf, is_critical: item.is_critical }];
    });
  })();

  const criticalCount = schedule?.items.filter(i => i.is_critical).length ?? 0;

  return (
    <div>
      <TaskHeaderOrganism
        path="Календарный график работ"
        subSistem="СРО"
        taskName="Задача 1.1 — Календарный график работ"
        taskDescription="Сетевая модель с ресурсными ограничениями (CPM/RCPSP). Ввод перечня работ, длительностей и зависимостей — расчёт ES/EF/LS/LF, критического пути и оптимального календарного графика."
      />

      <div className="flex flex-row w-full gap-4 mt-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="w-72 shrink-0 border border-t-0 border-slate-800 bg-[#16181D] p-3">
          <SectionHeader>
            Входные данные
            <span className="text-slate-600 normal-case tracking-normal text-[10px]">
              {works?.length ?? 0} работ
            </span>
          </SectionHeader>

          {/* Works list */}
          <div className="max-h-64 overflow-y-auto mb-3 space-y-1">
            {worksLoading ? (
              <div className="text-[11px] text-slate-600 font-mono">Загрузка...</div>
            ) : works && works.length > 0 ? (
              works.map(w => (
                <div key={w.id} className="flex items-start gap-2 py-1.5 border-b border-slate-800/50">
                  <span className="font-mono text-[10px] text-slate-600 w-5 shrink-0">{w.id}</span>
                  <div className="min-w-0">
                    <div className="text-[12px] text-slate-300 truncate">{w.name}</div>
                    <div className="font-mono text-[10px] text-slate-600">
                      {w.duration_days} дн.
                      {w.predecessors.length > 0 && ` · пред: ${w.predecessors.join(',')}`}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-slate-600 font-mono py-2">Нет работ</div>
            )}
          </div>

          {/* Add work toggle */}
          <button
            onClick={() => setShowAddWork(v => !v)}
            className="w-full h-7 text-[11px] font-mono border border-slate-700 text-slate-500 hover:text-slate-200 hover:border-slate-500 rounded transition-colors mb-3"
          >
            {showAddWork ? '— Свернуть' : '+ Добавить работу'}
          </button>

          {showAddWork && (
            <form
              onSubmit={workForm.handleSubmit(onAddWork)}
              className="flex flex-col gap-2 mb-3 p-2 bg-slate-900/40 rounded border border-slate-800"
            >
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Наименование</label>
                <input {...workForm.register('name', { required: true })} className={inputCls} placeholder="Земляные работы" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Длительность, дн.</label>
                <input {...workForm.register('duration_days', { required: true })} type="number" min={1} className={inputCls} placeholder="10" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Предшественники (ID)</label>
                <input {...workForm.register('predecessors')} className={inputCls} placeholder="1, 2" />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="submit"
                  disabled={addWorkMutation.isPending}
                  className="flex-1 h-8 text-[12px] font-mono bg-[#6a93c8] text-[#0e1014] rounded hover:bg-[#82a6d4] disabled:opacity-50"
                >
                  {addWorkMutation.isPending ? '...' : 'Сохранить'}
                </button>
                <button type="button" onClick={() => setShowAddWork(false)} className="h-8 px-3 text-[12px] border border-slate-700 text-slate-400 rounded">✕</button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Метод расчёта</label>
              <select className={inputCls + ' cursor-pointer'} defaultValue="cpm">
                <option value="cpm">CPM (критический путь)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => calcMutation.mutate()}
            disabled={calcMutation.isPending || !works?.length}
            className="w-full mt-4 h-9 bg-[#6a93c8] hover:bg-[#82a6d4] disabled:opacity-40 text-[#0e1014] font-mono text-[12px] font-semibold rounded transition-colors"
          >
            {calcMutation.isPending ? 'Расчёт...' : '▶ Рассчитать график'}
          </button>
        </div>

        {/* ── CENTER: Analytics ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {schedule ? (
            <>
              {/* Метрики */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'T_min', value: `${schedule.t_min ?? '—'} дн.`, color: 'text-[#6a93c8]' },
                  { label: 'Версия', value: schedule.version, color: 'text-slate-300' },
                  { label: 'Критических', value: criticalCount, color: 'text-red-400' },
                  { label: 'Всего работ', value: schedule.items.length, color: 'text-slate-300' },
                ].map(k => (
                  <div key={k.label} className="p-3 bg-[#15181d] border border-slate-800 rounded">
                    <div className="font-mono text-[10px] text-slate-600">{k.label}</div>
                    <div className={`font-mono text-lg font-semibold leading-none mt-1 ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Диаграмма Ганта */}
              <div className="bg-[#15181d] border border-slate-800 rounded p-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">
                  Диаграмма Ганта
                </div>
                <GanttChart works={ganttWorks} projectDuration={schedule.t_min ?? undefined} />
              </div>

              {/* Таблица ES/EF/LS/LF */}
              <div className="bg-[#15181d] border border-slate-800 rounded overflow-hidden">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">
                  Параметры работ
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['ID', 'ES', 'EF', 'LS', 'LF', 'TF', ''].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.items.map((item, i) => (
                        <tr key={item.work_id} className={`border-b border-slate-800/40 ${item.is_critical ? 'bg-red-950/15' : i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
                          <td className="px-4 py-2 font-mono text-[11px] text-slate-600">{item.work_id}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-300">{item.es}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-300">{item.ef}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-500">{item.ls}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-500">{item.lf}</td>
                          <td className="px-4 py-2 font-mono text-[12px] text-slate-300">{item.tf}</td>
                          <td className="px-4 py-2">
                            {item.is_critical && (
                              <span className="font-mono text-[10px] text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded">крит.</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-72 bg-[#16181D] border border-slate-800 rounded">
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 mb-2">
                Результат расчёта
              </div>
              <p className="text-slate-600 text-sm">
                {calcMutation.isPending ? 'Выполняется расчёт...' : 'Нажмите «Рассчитать график»'}
              </p>
              {calcMutation.isPending && (
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#6a93c8] rounded-full animate-pulse w-2/3" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Document ── */}
        <div className="w-56 shrink-0 flex flex-col gap-3 p-3 bg-[#15181d] border border-[#272c34]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6b7380]">Документ</span>
            <span className="font-mono text-[10px] text-[#6b7380]">стр. 1 / 3</span>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-2 p-3 bg-[#1b1f25] border border-[#272c34] rounded min-h-36">
            <div className="text-[11px] font-semibold text-center text-[#e8eaee]">
              Календарный график производства работ
            </div>
            <div className="font-mono text-[9px] text-center text-[#6b7380]">
              {schedule
                ? `T_min = ${schedule.t_min} дн. · версия ${schedule.version}`
                : 'версия от —'}
            </div>
            {schedule && (
              <div className="mt-2 space-y-1">
                {schedule.items.slice(0, 5).map(item => (
                  <div key={item.work_id} className="flex items-center gap-1">
                    <div
                      className="h-2 rounded-sm"
                      style={{
                        marginLeft: `${(item.es / (schedule.t_min || 1)) * 60}%`,
                        width: `${Math.max(((item.ef - item.es) / (schedule.t_min || 1)) * 60, 4)}%`,
                        backgroundColor: item.is_critical ? '#ef4444' : '#6a93c8',
                      }}
                    />
                  </div>
                ))}
                {schedule.items.length > 5 && (
                  <div className="font-mono text-[9px] text-slate-600 text-center">
                    +{schedule.items.length - 5} работ
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Format */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-[#6b7380]">формат выгрузки</span>
            <div className="flex gap-1.5">
              {(['PDF', 'XLSX', 'MPP'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 h-[30px] font-mono text-[11px] font-semibold border-[1.5px] rounded transition-colors ${
                    format === f
                      ? 'text-[#6a93c8] bg-[#2a3a52] border-[#6a93c8]'
                      : 'text-gray-400 bg-transparent border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => toast(schedule ? `Скачивание ${format}...` : 'Сначала выполните расчёт', { icon: schedule ? '📄' : '⚠️' })}
            className="h-8 inline-flex items-center justify-center px-3.5 text-[12px] font-medium text-[#0e1014] bg-[#6a93c8] border border-[#6a93c8] rounded transition-colors hover:bg-[#82a6d4]"
          >
            ↓ Скачать
          </button>
        </div>
      </div>
    </div>
  );
}
