export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800/60 ${className}`}
      aria-busy="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 bg-[#16181D] rounded-md border border-slate-800 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-full opacity-70" />
      ))}
    </div>
  );
}
