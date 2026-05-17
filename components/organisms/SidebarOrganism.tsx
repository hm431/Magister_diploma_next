'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function buildNav(projectId?: string): NavSection[] {
  const pid = projectId ?? '1';
  return [
    {
      title: 'Общее',
      items: [
        { label: 'Дашборд', href: '/', icon: '⬡' },
        { label: 'Проекты', href: '/projects', icon: '◈' },
      ],
    },
    {
      title: 'Текущий проект',
      items: [
        { label: 'Обзор проекта', href: `/projects/${pid}`, icon: '○' },
        {
          label: 'Планирование (1.1)',
          href: `/projects/${pid}/schedule`,
          icon: '▤',
          roles: ['admin', 'pm', 'pto'],
        },
        {
          label: 'Бригады (1.2)',
          href: `/projects/${pid}/brigades`,
          icon: '◉',
          roles: ['admin', 'pm', 'pto'],
        },
        {
          label: 'График поставок (2.1)',
          href: `/projects/${pid}/supply`,
          icon: '▦',
          roles: ['admin', 'pm', 'mts'],
        },
        {
          label: 'Склад и логистика (2.2)',
          href: `/projects/${pid}/warehouse`,
          icon: '▧',
          roles: ['admin', 'pm', 'mts'],
        },
        { label: 'Анализ рисков (3)', href: `/projects/${pid}/risks`, icon: '◬' },
        {
          label: 'Оперативный контроль (4)',
          href: `/projects/${pid}/operations`,
          icon: '◌',
          roles: ['admin', 'pm', 'pto', 'mts'],
        },
      ],
    },
    {
      title: 'Система',
      items: [
        { label: 'Отчётность', href: '/reports', icon: '▣' },
        { label: 'Справочники', href: '/references', icon: '≡' },
      ],
    },
  ];
}

export default function SidebarOrganism() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Extract project id from pathname if on a project page
  const projectMatch = pathname.match(/^\/projects\/(\d+)/);
  const currentProjectId = projectMatch?.[1];
  const nav = buildNav(currentProjectId);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 min-h-screen bg-[#11141a] border-r border-[#1e2229]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#1e2229]">
        <div className="w-6 h-6 rounded-sm bg-[#6a93c8] flex items-center justify-center">
          <span className="font-mono text-[10px] font-bold text-[#0e1014]">К</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-100 leading-none">КИС</p>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">Водоканал</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {nav.map((section) => (
          <div key={section.title}>
            <p className="px-2 mb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                if (
                  item.roles &&
                  user?.role &&
                  !item.roles.includes(user.role) &&
                  !item.roles.includes('admin')
                ) {
                  return null;
                }
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-[12px] no-underline transition-colors ${
                        active
                          ? 'bg-[#6a93c8]/15 text-[#6a93c8]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b1f25]'
                      }`}
                    >
                      <span className="text-[10px] w-3 text-center">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#1e2229] px-3 py-3">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[12px] text-slate-200 truncate">{user.username}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-[11px] text-slate-500 hover:text-red-400 transition-colors ml-2 shrink-0"
              title="Выйти"
            >
              ⏻
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-[12px] text-[#6a93c8] no-underline hover:text-[#82a6d4]"
          >
            Войти
          </Link>
        )}
      </div>
    </aside>
  );
}
