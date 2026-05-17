'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarOrganism from './SidebarOrganism';
import { useAuthStore } from '@/lib/auth-store';

const SIDEBAR_EXCLUDED = ['/login'];

export default function AppShellOrganism({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const showSidebar = !SIDEBAR_EXCLUDED.includes(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <SidebarOrganism />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
