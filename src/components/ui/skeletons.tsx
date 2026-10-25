/** Esqueletos de carga reutilizados por loading.tsx y por los estados `isPending`. */

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Cargando Pokémon…</span>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="rounded-2xl border border-line bg-surface p-4 shadow-card" aria-hidden="true">
            <div className="mx-auto aspect-square w-full max-w-[180px] animate-pulse rounded-full bg-canvas" />
            <div className="mt-3 h-3 w-12 animate-pulse rounded bg-line" />
            <div className="mt-2 h-5 w-24 animate-pulse rounded bg-line" />
            <div className="mt-3 h-5 w-16 animate-pulse rounded-full bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="sr-only">Cargando datos del Pokémon…</span>
      <div aria-hidden="true">
        <div className="h-4 w-36 animate-pulse rounded bg-line" />
        <div className="mt-6 grid gap-8 rounded-3xl border border-line bg-surface p-6 shadow-card md:grid-cols-2">
          <div className="mx-auto aspect-square w-full max-w-sm animate-pulse rounded-full bg-canvas" />
          <div className="space-y-4">
            <div className="h-4 w-20 animate-pulse rounded bg-line" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-line" />
            <div className="h-6 w-32 animate-pulse rounded-full bg-line" />
            <div className="h-20 w-full animate-pulse rounded bg-line" />
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-3xl bg-surface shadow-card" />
          <div className="h-64 animate-pulse rounded-3xl bg-surface shadow-card" />
        </div>
      </div>
    </div>
  );
}
