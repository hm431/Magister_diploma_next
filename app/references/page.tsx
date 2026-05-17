'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import PageHeader from '@/components/ui/PageHeader';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/auth-store';

// ─── Shared table component ──────────────────────────────────────────────────
interface Column<T> { key: keyof T; label: string }

function RefTable<T extends { id?: number }>({
  data,
  columns,
  isLoading,
  onDelete,
}: {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  onDelete?: (id: number) => void;
}) {
  if (isLoading) return <SkeletonTable rows={4} />;
  if (!data.length) return <div className="py-8 text-center text-slate-600 text-sm">Нет записей</div>;
  return (
    <div className="overflow-x-auto rounded border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-[#15181d]">
            {columns.map(c => (
              <th key={String(c.key)} className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {c.label}
              </th>
            ))}
            {onDelete && <th className="px-4 py-2.5 w-12" />}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-[#111418]'}`}>
              {columns.map(c => (
                <td key={String(c.key)} className="px-4 py-2.5 text-slate-300">
                  {String(row[c.key] ?? '—')}
                </td>
              ))}
              {onDelete && row.id && (
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => onDelete(row.id!)}
                    className="text-[11px] text-slate-600 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────
interface Material { id: number; name: string; unit: string; unit_cost: number }
interface User { user_id: number; username: string; email: string; role: string; is_active: boolean }

const SECTIONS = [
  { id: 'materials', label: 'Материалы', icon: '▦' },
  { id: 'users', label: 'Пользователи', icon: '◉', adminOnly: true },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ─── Component ──────────────────────────────────────────────────────────────
export default function ReferencesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [active, setActive] = useState<SectionId>('materials');

  // ── Materials ──
  const { data: materials, isLoading: matLoading } = useQuery<Material[]>({
    queryKey: ['materials'],
    queryFn: () => apiClient.get('/materials').then(r => r.data),
    enabled: active === 'materials',
  });

  const matForm = useForm<{ name: string; unit: string; unit_cost: string }>();
  const addMat = useMutation({
    mutationFn: (b: { name: string; unit: string; unit_cost: number }) =>
      apiClient.post('/materials', b).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Материал добавлен');
      matForm.reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Users ──
  const { data: users, isLoading: userLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then(r => r.data),
    enabled: active === 'users' && user?.role === 'admin',
  });

  const userForm = useForm<{ username: string; email: string; password: string; role: string }>();
  const addUser = useMutation({
    mutationFn: (b: { username: string; email: string; password: string; role: string }) =>
      apiClient.post('/users', b).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Пользователь создан');
      userForm.reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Пользователь удалён');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visibleSections = SECTIONS.filter(s => !('adminOnly' in s && s.adminOnly) || user?.role === 'admin');

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        title="Справочники"
        description="Нормативно-справочная информация: материалы, поставщики, бригады, склады, пользователи."
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Справочники' }]}
      />

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-44 shrink-0">
          <nav className="flex flex-col gap-0.5">
            {[
              { id: 'materials', label: 'Материалы', icon: '▦' },
              { id: 'suppliers', label: 'Поставщики', icon: '◈' },
              { id: 'warehouses', label: 'Склады', icon: '▧' },
              { id: 'brigades', label: 'Бригады', icon: '◉' },
              { id: 'norms', label: 'Нормы расхода', icon: '≡' },
              { id: 'contracts', label: 'Договоры', icon: '▣' },
              ...(user?.role === 'admin' ? [{ id: 'users', label: 'Пользователи', icon: '○' }] : []),
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id as SectionId)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-left text-[12px] transition-colors ${
                  active === s.id
                    ? 'bg-[#6a93c8]/15 text-[#6a93c8]'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-[#1b1f25]'
                }`}
              >
                <span className="text-[10px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* ── Materials ── */}
          {active === 'materials' && (
            <>
              <h2 className="text-base font-semibold text-slate-200">Справочник материалов</h2>

              <form
                onSubmit={matForm.handleSubmit(d => addMat.mutate({ name: d.name, unit: d.unit, unit_cost: Number(d.unit_cost) }))}
                className="flex gap-3 items-end"
              >
                {[
                  { field: 'name' as const, label: 'Наименование', placeholder: 'Труба ПВХ 100мм', width: 'flex-1' },
                  { field: 'unit' as const, label: 'Ед. изм.', placeholder: 'м.п.', width: 'w-24' },
                  { field: 'unit_cost' as const, label: 'Цена/ед.', placeholder: '1200.00', width: 'w-28' },
                ].map(({ field, label, placeholder, width }) => (
                  <div key={field} className={`flex flex-col gap-1 ${width}`}>
                    <label className="font-mono text-[10px] uppercase text-slate-500">{label}</label>
                    <input
                      {...matForm.register(field, { required: true })}
                      placeholder={placeholder}
                      className="h-9 px-3 bg-[#0e1014] border border-slate-700 rounded text-sm text-slate-200 focus:border-[#6a93c8] focus:outline-none"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={addMat.isPending}
                  className="h-9 px-4 bg-[#6a93c8] text-[#0e1014] text-sm font-medium rounded hover:bg-[#82a6d4] disabled:opacity-50 shrink-0"
                >
                  + Добавить
                </button>
              </form>

              <RefTable
                data={materials ?? []}
                isLoading={matLoading}
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Наименование' },
                  { key: 'unit', label: 'Ед. изм.' },
                  { key: 'unit_cost', label: 'Цена/ед.' },
                ]}
              />
            </>
          )}

          {/* ── Users (admin only) ── */}
          {active === 'users' && (
            <>
              <h2 className="text-base font-semibold text-slate-200">Пользователи системы</h2>

              {user?.role !== 'admin' ? (
                <div className="py-10 text-center text-slate-600">
                  Только для администраторов
                </div>
              ) : (
                <>
                  <form
                    onSubmit={userForm.handleSubmit(d => addUser.mutate(d))}
                    className="grid grid-cols-4 gap-3 items-end"
                  >
                    {[
                      { field: 'username' as const, label: 'Логин', placeholder: 'ivanov' },
                      { field: 'email' as const, label: 'Email', placeholder: 'ivanov@co.ru' },
                      { field: 'password' as const, label: 'Пароль', placeholder: '••••••' },
                      { field: 'role' as const, label: 'Роль', placeholder: 'pm' },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="font-mono text-[10px] uppercase text-slate-500">{label}</label>
                        <input
                          {...userForm.register(field, { required: true })}
                          type={field === 'password' ? 'password' : 'text'}
                          placeholder={placeholder}
                          className="h-9 px-3 bg-[#0e1014] border border-slate-700 rounded text-sm text-slate-200 focus:border-[#6a93c8] focus:outline-none"
                        />
                      </div>
                    ))}
                    <button
                      type="submit"
                      disabled={addUser.isPending}
                      className="h-9 px-4 bg-[#6a93c8] text-[#0e1014] text-sm font-medium rounded hover:bg-[#82a6d4] disabled:opacity-50"
                    >
                      + Создать
                    </button>
                  </form>

                  <RefTable
                    data={(users ?? []).map(u => ({ ...u, id: u.user_id }))}
                    isLoading={userLoading}
                    columns={[
                      { key: 'user_id', label: 'ID' },
                      { key: 'username', label: 'Логин' },
                      { key: 'email', label: 'Email' },
                      { key: 'role', label: 'Роль' },
                      { key: 'is_active', label: 'Активен' },
                    ]}
                    onDelete={id => deleteUser.mutate(id)}
                  />
                </>
              )}
            </>
          )}

          {/* Stub sections */}
          {!['materials', 'users'].includes(active) && (
            <div className="flex flex-col items-center justify-center py-20 border border-slate-800 rounded-md text-slate-600">
              <p className="text-sm">Раздел «{active}» в разработке</p>
              <p className="text-[12px] mt-1">CRUD-интерфейс будет добавлен на следующем этапе</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
