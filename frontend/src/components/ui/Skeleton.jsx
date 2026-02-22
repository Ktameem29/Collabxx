// Reusable skeleton loaders that match exact layouts of real components

export function SkeletonLine({ className = '' }) {
  return <div className={`h-4 rounded-lg bg-navy-600 animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-navy-700 border border-navy-500 p-5 space-y-4 animate-pulse">
      <div className="h-1 w-3/4 rounded-full bg-navy-600" />
      <div className="space-y-2">
        <div className="h-5 w-2/3 rounded-lg bg-navy-600" />
        <div className="h-3 rounded bg-navy-600" />
        <div className="h-3 w-4/5 rounded bg-navy-600" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[40, 56, 44].map((w, i) => (
          <div key={i} className="h-5 rounded-full bg-navy-600" style={{ width: w }} />
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-navy-500/50">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-navy-600 ring-2 ring-navy-700" />
          ))}
        </div>
        <div className="h-3 w-20 rounded bg-navy-600" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass p-5 rounded-2xl flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-navy-600 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-7 w-10 rounded bg-navy-600" />
        <div className="h-3 w-24 rounded bg-navy-600" />
      </div>
    </div>
  );
}

export function SkeletonProjectDetail() {
  return (
    <div className="max-w-7xl space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-navy-700 mt-1 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-navy-600" />
            <div className="h-7 w-56 rounded-lg bg-navy-700" />
            <div className="h-6 w-16 rounded-full bg-navy-600" />
          </div>
          <div className="h-4 w-80 rounded bg-navy-700" />
          <div className="flex gap-1.5">
            {[48, 56, 40].map((w, i) => (
              <div key={i} className="h-5 rounded-full bg-navy-600" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="h-10 w-80 rounded-xl bg-navy-700" />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-36 rounded-2xl bg-navy-700 border border-navy-500" />
          <div className="h-28 rounded-2xl bg-navy-700 border border-navy-500" />
        </div>
        <div className="h-64 rounded-2xl bg-navy-700 border border-navy-500" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-48 rounded bg-navy-600" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-navy-500/50">
          <div className="w-8 h-8 rounded-full bg-navy-600 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 rounded bg-navy-600" />
            <div className="h-3 w-48 rounded bg-navy-600" />
          </div>
          <div className="h-5 w-16 rounded-full bg-navy-600" />
        </div>
      ))}
    </div>
  );
}
