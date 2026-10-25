import type { PokedexQuery } from "@/lib/types/pokemon";

/**
 * Claves de caché centralizadas. Servidor y cliente usan exactamente las
 * mismas, por eso el cliente encuentra los datos hidratados.
 */
export const queryKeys = {
  pokedexPage: (query: PokedexQuery) => ["pokedex", query] as const,
  pokemon: (id: number) => ["pokemon", id] as const,
  species: (id: number) => ["pokemon-species", id] as const,
  evolutionChain: (chainId: number) => ["evolution-chain", chainId] as const,
};
