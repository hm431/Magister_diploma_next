'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { useAuthStore, CurrentUser } from '@/lib/auth-store';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
interface LoginFormFields {
  username: string;
  password: string;
}

// Inner component uses useSearchParams — must be inside Suspense
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('from') ?? '/';
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormFields>();

  async function onSubmit(data: LoginFormFields) {
    if (!data.username) { return; }
    setLoading(true);
    try {
      const { data: tokens } = await apiClient.post<TokenResponse>('/auth/login', data);
      const { data: user } = await apiClient.get<CurrentUser>('/users/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      setAuth(user, tokens.access_token, tokens.refresh_token);
      toast.success(`Добро пожаловать, ${user.username}`);
      router.push(redirectTo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">Логин</label>
        <input
          {...register('username', { required: 'Введите логин' })}
          type="text"
          autoComplete="username"
          placeholder="admin"
          className="h-10 px-3 bg-[#0e1014] border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#6a93c8] transition-colors"
        />
        {errors.username && <p className="text-[11px] text-red-400">{errors.username.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">Пароль</label>
        <input
          {...register('password', { required: 'Введите пароль' })}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-10 px-3 bg-[#0e1014] border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#6a93c8] transition-colors"
        />
        {errors.password && <p className="text-[11px] text-red-400">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-10 bg-[#6a93c8] hover:bg-[#82a6d4] disabled:opacity-50 disabled:cursor-not-allowed text-[#0e1014] font-medium text-sm rounded transition-colors"
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Назад
    </button>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <BackButton />
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-[#6a93c8] flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-[#0e1014]">К</span>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-100 leading-none">КИС — Водоканал</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Управление строительными работами и МТР</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#15181d] border border-[#272c34] rounded-lg p-7">
          <h1 className="text-xl font-semibold text-slate-100 mb-1">Вход в систему</h1>
          <p className="text-sm text-slate-500 mb-7">Введите учётные данные для доступа</p>

          <Suspense fallback={<div className="h-40 animate-pulse bg-slate-800/30 rounded" />}>
            <LoginForm />
          </Suspense>

          {/* Role reference */}
          <div className="mt-7 pt-5 border-t border-slate-800">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-3">Роли в системе</p>
            <div className="grid grid-cols-1 gap-1">
              {[
                ['pm', 'Руководитель проекта'],
                ['pto', 'Специалист ПТО'],
                ['mts', 'Специалист МТС'],
                ['director', 'Руководитель предприятия'],
                ['admin', 'Администратор'],
              ].map(([code, name]) => (
                <div key={code} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500">{code}</span>
                  <span className="text-[11px] text-slate-600">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
