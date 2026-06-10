'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface ProjectOut {
  id: number;
  name: string;
  address: string;
  start_date: string;
  end_date: string;
  status: string;
}

const MOCK_PORTFOLIO = [
  {
    id: 1,
    name: 'Водоканал объект №1',
    address: 'г. Тюмень, ул. Ленина 1',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'active',
    progress: 42,
    risk_critical: 5,
    deviation_days: +7,
    mto_status: 'warning',
  },
  {
    id: 2,
    name: 'Реконструкция насосной станции №3',
    address: 'г. Тюмень, ул. Мира 45',
    start_date: '2025-03-15',
    end_date: '2025-09-30',
    status: 'active',
    progress: 67,
    risk_critical: 2,
    deviation_days: 0,
    mto_status: 'ok',
  },
  {
    id: 3,
    name: 'Строительство водозабора пос. Боровский',
    address: 'Тюменский р-н, пос. Боровский',
    start_date: '2025-06-01',
    end_date: '2026-05-31',
    status: 'planned',
    progress: 0,
    risk_critical: 1,
    deviation_days: 0,
    mto_status: 'ok',
  },
];

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active:    { label: 'В работе',      cls: 'text-[#6a93c8] bg-[#6a93c8]/10 border-[#6a93c8]/30' },
  planned:   { label: 'Запланирован',  cls: 'text-slate-400 bg-slate-800/40 border-slate-700' },
  completed: { label: 'Завершён',      cls: 'text-teal-300 bg-teal-900/20 border-teal-800' },
  paused:    { label: 'Приостановлен', cls: 'text-amber-400 bg-amber-900/20 border-amber-800' },
};

const MTO_LABEL: Record<string, { label: string; cls: string }> = {
  ok:       { label: 'Норма',   cls: 'text-teal-300' },
  warning:  { label: 'Дефицит', cls: 'text-amber-400' },
  critical: { label: 'Критично', cls: 'text-red-400' },
};

function fmt(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

const labelCls = 'font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600';

export default function DashboardPage() {
  const { data: projects } = useQuery<ProjectOut[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<ProjectOut[]>('/projects/').then(r => r.data),
    staleTime: 60_000,
  });

  const portfolio = MOCK_PORTFOLIO;
  const activeCount  = portfolio.filter(p => p.status === 'active').length;
  const totalRiskCritical = portfolio.reduce((s, p) => s + p.risk_critical, 0);
  const deviatedCount = portfolio.filter(p => p.deviation_days > 0).length;
  const mtoWarnings = portfolio.filter(p => p.mto_status !== 'ok').length;

  const metrics = [
    { label: 'Активных проектов',    value: String(activeCount),     color: 'text-[#6a93c8]' },
    { label: 'Риск-крит. работ',     value: String(totalRiskCritical), color: 'text-red-400'   },
    { label: 'Отклонений от плана',  value: String(deviatedCount),   color: 'text-amber-400' },
    { label: 'Проблем с МТО',        value: String(mtoWarnings),     color: 'text-[#c9a06a]' },
  ];

  return (
    <div className="py-6 space-y-6">
      {/* Page title */}
      <div>
        <p className={labelCls}>Дашборд</p>
        <h1 className="mt-1 m-0 text-2xl font-semibold tracking-tight text-slate-100">
          Портфель проектов
        </h1>
        <p className="mt-1 m-0 text-[13px] text-slate-500">
          ООО «Тюмень Водоканал» — сводные показатели по всем проектам
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-px bg-[#1e2229] border border-[#1e2229] rounded-md overflow-hidden">
        {metrics.map(m => (
          <div key={m.label} className="flex flex-col gap-1 p-5 bg-[#15181d]">
            <span className={`font-mono text-[32px] font-semibold leading-none tracking-tighter ${m.color}`}>
              {m.value}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-600 mt-1">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Projects table */}
      <div className="border border-[#1e2229] rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2229] bg-[#13161b]">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">
            Проекты
          </span>
          <span className="font-mono text-[10px] text-slate-600">
            {projects ? `API: ${projects.length} объект(ов)` : 'загрузка...'}
          </span>
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#1e2229] bg-[#11141a]">
              {['Наименование', 'Статус', 'Выполнение', 'Риск-крит. работы', 'Отклонение', 'МТО', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {portfolio.map((p, i) => {
              const st = STATUS_LABEL[p.status] ?? STATUS_LABEL.planned;
              const mto = MTO_LABEL[p.mto_status] ?? MTO_LABEL.ok;
              return (
                <tr
                  key={p.id}
                  className={`border-b border-[#1a1d23] transition-colors hover:bg-[#1b1f25] ${i % 2 === 0 ? 'bg-[#15181d]' : 'bg-[#13161b]'}`}
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-200 leading-snug">{p.name}</div>
                    <div className="font-mono text-[10px] text-slate-600 mt-0.5">{p.address}</div>
                    <div className="font-mono text-[10px] text-slate-700 mt-0.5">
                      {fmt(p.start_date)} — {fmt(p.end_date)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-[10px] font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#1e2229] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6a93c8]"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 w-8 text-right">
                        {p.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Risk-critical works */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.risk_critical > 0 ? (
                      <span className="font-mono text-[12px] text-red-400">
                        ⚠ {p.risk_critical}
                      </span>
                    ) : (
                      <span className="font-mono text-[12px] text-teal-400">✓ нет</span>
                    )}
                  </td>

                  {/* Deviation */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.deviation_days === 0 ? (
                      <span className="font-mono text-[11px] text-slate-600">— в плане</span>
                    ) : (
                      <span className={`font-mono text-[12px] ${p.deviation_days > 0 ? 'text-amber-400' : 'text-teal-300'}`}>
                        {p.deviation_days > 0 ? '+' : ''}{p.deviation_days} дн.
                      </span>
                    )}
                  </td>

                  {/* MTO */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-mono text-[11px] ${mto.cls}`}>{mto.label}</span>
                  </td>

                  {/* Link */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-mono text-[11px] text-[#6a93c8] no-underline hover:text-[#82a6d4] transition-colors"
                    >
                      Открыть →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Risk-critical summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 border border-[#1e2229] rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e2229] bg-[#13161b]">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">
              Риск-критические работы портфеля
            </span>
          </div>
          <div className="divide-y divide-[#1a1d23]">
            {[
              { project: 'Водоканал объект №1',          work: 'Прокладка магистрального трубопровода', ci: 0.91, status: 'active' },
              { project: 'Водоканал объект №1',          work: 'Монтаж насосного оборудования',         ci: 0.78, status: 'active' },
              { project: 'Водоканал объект №1',          work: 'Пусконаладочные работы',               ci: 0.74, status: 'planned' },
              { project: 'Реконструкция насосной ст.',   work: 'Замена трубопровода Ду500',            ci: 0.65, status: 'active' },
              { project: 'Водоканал объект №1',          work: 'Земляные работы (участок №3)',         ci: 0.62, status: 'active' },
            ].map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-[#15181d]' : 'bg-[#13161b]'}`}>
                <span className="font-mono text-[10px] text-slate-600 w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-slate-300 truncate">{r.work}</div>
                  <div className="font-mono text-[10px] text-slate-600">{r.project}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-1.5 bg-[#1e2229] rounded-full overflow-hidden">
                    <div className="h-full bg-red-500/70 rounded-full" style={{ width: `${r.ci * 100}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-red-400 w-10 text-right">
                    {(r.ci * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MTO summary */}
        <div className="border border-[#1e2229] rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e2229] bg-[#13161b]">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">
              Сводно по МТО
            </span>
          </div>
          <div className="p-4 space-y-4">
            {[
              { label: 'Поставок на текущей неделе',  value: '14',  color: 'text-[#6a93c8]' },
              { label: 'Позиций с дефицитом',         value: '3',   color: 'text-amber-400' },
              { label: 'Склад загружен на',           value: '61%', color: 'text-teal-300'   },
              { label: 'Заявок выгружено в 1С',       value: '8',   color: 'text-slate-300'  },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-baseline">
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-slate-600 leading-snug max-w-[120px]">
                  {item.label}
                </span>
                <span className={`font-mono text-[20px] font-semibold leading-none ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
