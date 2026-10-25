"use client";

/**
 * Enlace a /pokemon/[id] que PRECARGA los datos del detalle con TanStack Query.
 *
 * - onMouseEnter: tras una breve intención de hover (75 ms) ejecuta
 *   prefetchQuery de Pokémon, especie y cadena evolutiva. El retraso evita
 *   peticiones al cruzar el cursor por encima de muchas tarjetas.
 * - onFocus / onTouchStart: alternativa inmediata para teclado y pantallas táctiles.
 *
 * Si los datos ya están en caché y frescos (staleTime 24 h), no se repite
 * ninguna petición.
 */
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { prefetchPokemonDetail } from "@/lib/queries/prefetch";

export const HOVER_INTENT_MS = 75;

interface PrefetchLinkProps {
  pokemonId: number;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export function PrefetchLink({ pokemonId, className, children, ...rest }: PrefetchLinkProps) {
  const queryClient = useQueryClient();
  const timer = useRef<number | undefined>(undefined);

  const prefetch = useCallback(() => {
    void prefetchPokemonDetail(queryClient, pokemonId);
  }, [queryClient, pokemonId]);

  const cancel = useCallback(() => window.clearTimeout(timer.current), []);

  useEffect(() => cancel, [cancel]);

  return (
    <Link
      href={`/pokemon/${pokemonId}`}
      className={className}
      data-pokemon-id={pokemonId}
      onMouseEnter={() => {
        cancel();
        timer.current = window.setTimeout(prefetch, HOVER_INTENT_MS);
      }}
      onMouseLeave={cancel}
      onFocus={prefetch}
      onTouchStart={prefetch}
      {...rest}
    >
      {children}
    </Link>
  );
}
