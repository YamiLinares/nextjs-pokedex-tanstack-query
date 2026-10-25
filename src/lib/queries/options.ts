/**
 * Definiciones reutilizables de consultas (`queryOptions` de TanStack v5).
 * Un mismo objeto se usa en useQuery, prefetchQuery y en el servidor, lo
 * que garantiza claves y funciones idénticas en todos los contextos.
 */
import { queryOptions } from "@tanstack/react-query";
import { fetchPokedexPage } from "@/lib/api/pokedex-client";
import { fetchEvolutionChain, fetchPokemon, fetchPokemonSpecies } from "@/lib/api/pokeapi";
import type { PokedexQuery } from "@/lib/types/pokemon";
import { queryKeys } from "@/lib/queries/keys";

/**
 * Página del catálogo. En el navegador consulta /api/pokedex; el servidor
 * reutiliza la misma clave pero sustituye `queryFn` por la lectura directa
 * del índice (ver app/page.tsx).
 */
export function pokedexPageOptions(query: PokedexQuery) {
  return queryOptions({
    queryKey: queryKeys.pokedexPage(query),
    queryFn: ({ signal }) => fetchPokedexPage(query, signal),
  });
}

/** /pokemon/{id}: tipos, estadísticas, habilidades y sprites. */
export function pokemonOptions(id: number) {
  return queryOptions({
    queryKey: queryKeys.pokemon(id),
    queryFn: ({ signal }) => fetchPokemon(id, signal),
  });
}

/** /pokemon-species/{id}: nombre en español, descripción e id de la cadena evolutiva. */
export function speciesOptions(id: number) {
  return queryOptions({
    queryKey: queryKeys.species(id),
    queryFn: ({ signal }) => fetchPokemonSpecies(id, signal),
  });
}

/** /evolution-chain/{id}: árbol de evoluciones ya transformado. */
export function evolutionChainOptions(chainId: number) {
  return queryOptions({
    queryKey: queryKeys.evolutionChain(chainId),
    queryFn: ({ signal }) => fetchEvolutionChain(chainId, signal),
  });
}
