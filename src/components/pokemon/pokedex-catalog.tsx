"use client";

/**
 * Catálogo interactivo (Client Component).
 *
 * - La primera página llega HIDRATADA desde el servidor (app/page.tsx), así
 *   que el primer useQuery la encuentra en caché y no hace ninguna petición.
 * - Las páginas siguientes se piden a /api/pokedex desde el navegador.
 * - `placeholderData: keepPreviousData` mantiene la página anterior visible
 *   mientras llega la nueva, para que controles y datos no se desincronicen.
 * - Al mostrar una página se precarga la siguiente (prefetchQuery).
 */
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { PokemonCard } from "@/components/pokemon/pokemon-card";
import { ErrorState } from "@/components/ui/error-state";
import { CardGridSkeleton } from "@/components/ui/skeletons";
import { POKEMON_TYPES } from "@/lib/constants";
import { pokedexPageOptions } from "@/lib/queries/options";
import type { PokedexQuery } from "@/lib/types/pokemon";
import { getPageWindow } from "@/lib/utils/pagination";
import { isPokemonType, normalizeSearch, pokedexQueryToSearchParams } from "@/lib/utils/pokedex";
import { TYPE_META } from "@/lib/utils/type-meta";

const SEARCH_DEBOUNCE_MS = 300;

export function PokedexCatalog({ initialQuery }: { initialQuery: PokedexQuery }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<PokedexQuery>(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery.search);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const typeId = useId();

  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useQuery({
    ...pokedexPageOptions(query),
    placeholderData: keepPreviousData,
  });

  // Búsqueda con debounce: evita una petición por cada tecla.
  useEffect(() => {
    const search = normalizeSearch(searchInput);
    if (search === query.search) return;
    const timer = window.setTimeout(() => setQuery((current) => ({ ...current, search, page: 1 })), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, query.search]);

  // Refleja el estado en la URL sin recargar ni pedir datos al servidor.
  useEffect(() => {
    const params = pokedexQueryToSearchParams(query).toString();
    window.history.replaceState(null, "", params ? `?${params}` : window.location.pathname);
  }, [query]);

  // Precarga la página siguiente para que el cambio de página sea instantáneo.
  useEffect(() => {
    if (!data || isPlaceholderData || data.page >= data.totalPages) return;
    void queryClient.prefetchQuery(pokedexPageOptions({ ...query, page: data.page + 1 }));
  }, [data, isPlaceholderData, query, queryClient]);

  const goToPage = (page: number) => {
    setQuery((current) => ({ ...current, page }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasFilters = Boolean(query.search || query.type);
  const clearFilters = () => {
    setSearchInput("");
    setQuery({ page: 1, type: null, search: "" });
  };

  return (
    <section aria-labelledby="catalogo-titulo" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <h2 id="catalogo-titulo" className="sr-only">
          Catálogo de Pokémon
        </h2>
        <form className="grid gap-3 sm:grid-cols-[1fr_220px_auto]" role="search" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label htmlFor={searchId} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Buscar
            </label>
            <input
              id={searchId}
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nombre o número, p. ej. pikachu o 25"
              autoComplete="off"
              maxLength={40}
              className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-ink placeholder:text-ink-muted/70 focus:border-poke-500 focus:bg-surface focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor={typeId} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tipo
            </label>
            <select
              id={typeId}
              value={query.type ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setQuery((current) => ({ ...current, type: isPokemonType(value) ? value : null, page: 1 }));
              }}
              className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-ink focus:border-poke-500 focus:bg-surface focus:outline-none"
            >
              <option value="">Todos los tipos</option>
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_META[type].label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters && !searchInput}
              className="w-full rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar filtros
            </button>
          </div>
        </form>
      </div>

      <div ref={resultsRef} className="scroll-mt-24 pt-6">
        {isPending ? (
          <CardGridSkeleton count={10} />
        ) : isError && !data ? (
          <ErrorState title="No pudimos cargar el catálogo" onRetry={() => void refetch()} retrying={isFetching} showHomeLink={false} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted" aria-live="polite">
              <p>
                {data.totalItems === 0
                  ? "Sin resultados"
                  : `Mostrando ${(data.page - 1) * data.pageSize + 1}–${(data.page - 1) * data.pageSize + data.items.length} de ${data.totalItems} Pokémon`}
              </p>
              {isFetching && <p className="font-medium text-poke-600">Actualizando…</p>}
            </div>

            {isError && (
              <p role="alert" className="mb-4 rounded-xl bg-poke-50 px-4 py-3 text-sm text-poke-700">
                No se pudo cargar la página solicitada.{" "}
                <button type="button" className="font-semibold underline" onClick={() => void refetch()}>
                  Reintentar
                </button>
              </p>
            )}

            {data.items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-14 text-center">
                <p className="font-display text-xl font-semibold text-navy-900">No encontramos Pokémon</p>
                <p className="mt-2 text-ink-muted">Prueba con otro nombre, número o tipo.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-poke-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-poke-600"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <ul
                className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${
                  isPlaceholderData ? "opacity-60" : ""
                }`}
                aria-busy={isPlaceholderData}
              >
                {data.items.map((pokemon, index) => (
                  <li key={pokemon.id}>
                    <PokemonCard pokemon={pokemon} priority={data.page === 1 && index < 5} />
                  </li>
                ))}
              </ul>
            )}

            {data.totalPages > 1 && (
              <Pagination page={data.page} totalPages={data.totalPages} disabled={isPlaceholderData} onChange={goToPage} />
            )}
          </>
        )}
      </div>
    </section>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  disabled: boolean;
  onChange: (page: number) => void;
}

function Pagination({ page, totalPages, disabled, onChange }: PaginationProps) {
  const buttonBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className={`${buttonBase} border border-line bg-surface text-navy-900 hover:bg-canvas`}
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>
      <ol className="flex flex-wrap items-center gap-1">
        {getPageWindow(page, totalPages).map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={`${buttonBase} ${
                  item === page ? "bg-navy-900 text-white" : "bg-surface text-navy-900 hover:bg-canvas"
                }`}
                onClick={() => onChange(item)}
                disabled={disabled || item === page}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        className={`${buttonBase} bg-poke-500 text-white hover:bg-poke-600`}
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>
    </nav>
  );
}
