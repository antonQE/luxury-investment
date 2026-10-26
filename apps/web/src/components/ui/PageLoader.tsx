export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6"
      data-testid="page-loader"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 animate-[loader-ring_1.1s_ease-in-out_infinite] rounded-full border border-brass/30" />
        <span className="absolute inset-1 animate-[loader-spin_0.9s_linear_infinite] rounded-full border border-transparent border-t-brass" />
      </div>
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft">{label}</p>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="property-grid-skeleton"
      aria-hidden
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/3] bg-line/70" />
          <div className="mt-5 h-2 w-24 bg-line/80" />
          <div className="mt-3 h-5 w-[80%] bg-line/70" />
          <div className="mt-2 h-3 w-[40%] bg-line/60" />
          <div className="mt-5 h-6 w-[33%] bg-line/75" />
        </div>
      ))}
    </div>
  );
}
