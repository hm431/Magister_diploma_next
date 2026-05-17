'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  children: React.ReactNode[];
  defaultTab?: string;
}

export function Tabs({ tabs, children, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const activeIndex = tabs.findIndex((t) => t.id === active);

  return (
    <div className="flex flex-col gap-0">
      {/* Tab bar */}
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2.5 text-[12px] font-mono tracking-wide transition-colors border-b-2 -mb-[2px] ${
              active === tab.id
                ? 'border-[#6a93c8] text-[#6a93c8]'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="pt-5">
        {children[activeIndex < 0 ? 0 : activeIndex]}
      </div>
    </div>
  );
}
