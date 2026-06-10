'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NavButton } from '@/components/atoms/NavButton';
import { useAuthStore } from '@/lib/auth-store';

export function Header() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (pathname === '/login') return null;

  return (
    <header>
      <div className="flex flex-row items-center gap-5 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.ico" alt="logo" width={24} height={24} />
          <h1 className="text-sm text-white m-0 font-normal">Кис · Водоканал</h1>
        </div>

        <NavButton title="Главная" path="/" />
        <NavButton title="Список Задач" path="/tasks" />
        <NavButton title="О программе" path="/about" />

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="font-mono text-[11px] text-slate-400">
                {user.username}
                <span className="ml-2 text-slate-600">({user.role})</span>
              </span>
              <button
                onClick={logout}
                className="rounded px-2.5 py-1 text-sm text-slate-400 border border-slate-700 hover:text-red-400 hover:border-red-800 transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded px-2.5 py-1 text-sm text-white no-underline bg-[#6A93C8] hover:bg-[#82a6d4] transition-colors"
            >
              Логин
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
