"use client";

// Client Component: el botón de reintento necesita un manejador de eventos.
import Link from "next/link";

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  showHomeLink?: boolean;
}

export function ErrorState({
  title,
  message = "No pudimos conectar con PokéAPI. Puede ser algo temporal: intenta de nuevo en unos segundos.",
  onRetry,
  retrying = false,
  showHomeLink = true,
}: ErrorStateProps) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-3xl border border-poke-500/20 bg-surface px-6 py-10 text-center shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wider text-poke-600">Algo salió mal</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-navy-900">{title}</h2>
      <p className="mt-3 text-ink-muted">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="rounded-full bg-poke-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-poke-600 disabled:cursor-wait disabled:opacity-70"
          >
            {retrying ? "Reintentando…" : "Reintentar"}
          </button>
        )}
        {showHomeLink && (
          <Link
            href="/"
            className="rounded-full border border-navy-900/20 px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-canvas"
          >
            Volver al catálogo
          </Link>
        )}
      </div>
    </div>
  );
}
