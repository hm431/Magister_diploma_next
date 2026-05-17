'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import PageHeader from '@/components/ui/PageHeader';

interface Project { id: number; name: string }

const TEMPLATES = [
  { id: 'weekly',    label: 'Еженедельный отчёт',    desc: 'Ход выполнения работ за неделю, отклонения' },
  { id: 'portfolio', label: 'Портфельный отчёт',      desc: 'Сводка по всем проектам, KPI портфеля' },
  { id: 'risks',     label: 'Отчёт по рискам',        desc: 'S-кривая, топ рисков, Монте-Карло результаты' },
  { id: 'executive', label: 'Исполнительная документация', desc: 'Форматы КС-2, КС-6, сводные ведомости' },
];
const FORMATS = ['PDF', 'DOCX', 'XLSX'] as const;
type ReportFormat = typeof FORMATS[number];

export default function ReportsPage() {
  const [template, setTemplate] = useState<string>('weekly');
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [period, setPeriod] = useState({ from: '', to: '' });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      apiClient
        .post('/reports/generate', {
          template_id: template,
          format,
          project_ids: selectedProjects,
          period_from: period.from,
          period_to: period.to,
        }, { responseType: 'blob' })
        .then(r => r.data),
    onSuccess: (blob: Blob) => {
      const ext = format.toLowerCase();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${template}_${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Отчёт сформирован и скачан');
    },
    onError: (e: Error) => toast.error(`Ошибка: ${e.message}`),
  });

  const emailMutation = useMutation({
    mutationFn: () => apiClient.post('/reports/email', { template_id: template, project_ids: selectedProjects }).then(r => r.data),
    onSuccess: () => toast.success('Отчёт отправлен по электронной почте'),
    onError: (e: Error) => toast.error(e.message),
  });

  function toggleProject(id: number) {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        title="Отчётность"
        description="Конструктор отчётов. Выберите шаблон, период и формат для формирования документа."
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Отчётность' }]}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Template selection */}
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Шаблон отчёта</h3>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`text-left p-4 rounded-md border transition-colors ${
                    template === t.id
                      ? 'border-[#6a93c8]/60 bg-[#6a93c8]/8'
                      : 'border-slate-800 bg-[#15181d] hover:border-slate-700'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${template === t.id ? 'text-[#6a93c8]' : 'text-slate-200'}`}>
                    {t.label}
                  </div>
                  <div className="text-[11px] text-slate-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Период</h3>
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-slate-600">С</label>
                <input
                  type="date"
                  value={period.from}
                  onChange={e => setPeriod(p => ({ ...p, from: e.target.value }))}
                  className="h-9 px-3 bg-[#0e1014] border border-slate-700 rounded text-sm text-slate-200 focus:border-[#6a93c8] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-slate-600">По</label>
                <input
                  type="date"
                  value={period.to}
                  onChange={e => setPeriod(p => ({ ...p, to: e.target.value }))}
                  className="h-9 px-3 bg-[#0e1014] border border-slate-700 rounded text-sm text-slate-200 focus:border-[#6a93c8] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Проекты</h3>
            {projects && projects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => toggleProject(p.id)}
                    className={`h-8 px-3 rounded font-mono text-[12px] transition-colors ${
                      selectedProjects.includes(p.id)
                        ? 'bg-[#6a93c8]/15 text-[#6a93c8] border border-[#6a93c8]/40'
                        : 'border border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    #{p.id} {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-600">Нет доступных проектов</p>
            )}
          </div>
        </div>

        {/* Right panel: Format + Actions */}
        <div className="flex flex-col gap-5">
          <div className="p-5 bg-[#15181d] border border-slate-800 rounded-md flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Формат</h3>
              <div className="flex flex-col gap-2">
                {FORMATS.map(f => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={format === f}
                      onChange={() => setFormat(f)}
                      className="accent-[#6a93c8]"
                    />
                    <span className={`font-mono text-sm ${format === f ? 'text-[#6a93c8]' : 'text-slate-400'}`}>
                      {f}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
              <div className="p-3 bg-[#0e1014] border border-slate-800 rounded text-[11px] font-mono text-slate-500">
                <div className="text-slate-400 mb-1">Шаблон: {TEMPLATES.find(t => t.id === template)?.label}</div>
                <div>Формат: {format}</div>
                <div>Проектов: {selectedProjects.length || 'все'}</div>
              </div>

              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="h-10 bg-[#6a93c8] hover:bg-[#82a6d4] disabled:opacity-50 text-[#0e1014] text-sm font-medium rounded transition-colors"
              >
                {generateMutation.isPending ? 'Формирование...' : '↓ Сформировать отчёт'}
              </button>

              <button
                onClick={() => emailMutation.mutate()}
                disabled={emailMutation.isPending}
                className="h-9 border border-slate-700 text-[12px] text-slate-400 rounded hover:text-slate-200 hover:border-slate-600 transition-colors"
              >
                {emailMutation.isPending ? 'Отправка...' : '✉ Отправить по почте'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
