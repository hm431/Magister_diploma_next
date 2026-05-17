import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: 'teal' | 'amber' | 'blue' | 'slate';
  crumbs?: Crumb[];
  action?: React.ReactNode;
}

const badgeColors = {
  teal: 'text-teal-300 border-teal-300/40',
  amber: 'text-amber-300 border-amber-300/40',
  blue: 'text-[#6a93c8] border-[#6a93c8]/40',
  slate: 'text-slate-400 border-slate-700',
};

export default function PageHeader({
  title,
  description,
  badge,
  badgeColor = 'blue',
  crumbs = [],
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pb-6 border-b border-slate-800">
      {crumbs.length > 0 && (
        <nav>
          <ol className="flex flex-wrap items-center gap-2 m-0 p-0 list-none font-mono text-[11px] tracking-wide">
            {crumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-700">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-slate-500 hover:text-slate-100 transition-colors no-underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-400">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          {badge && (
            <span
              className={`self-start font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 border rounded-full ${badgeColors[badgeColor]}`}
            >
              {badge}
            </span>
          )}
          <h1 className="m-0 text-2xl font-semibold leading-tight tracking-tight text-slate-100">
            {title}
          </h1>
          {description && (
            <p className="m-0 max-w-[68ch] text-sm leading-relaxed text-slate-400">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
