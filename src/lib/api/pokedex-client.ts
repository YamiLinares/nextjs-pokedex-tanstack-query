/**
 * Consulta del catálogo desde el NAVEGADOR.
 * Llama a la Route Handler /api/pokedex, que responde con la página ya
 * filtrada y compacta (id, nombre y tipos de 50 Pokémon).
 */
import { ApiError } from "@/lib/api/errors";
import type { PokedexPage, PokedexQuery } from "@/lib/types/pokemon";
import { pokedexQueryToSearchParams } from "@/lib/utils/pokedex";

export async function fetchPokedexPage(query: PokedexQuery, signal?: AbortSignal): Promise<PokedexPage> {
  const params = pokedexQueryToSearchParams(query);
  params.set("page", String(query.page));
  const response = await fetch(`/api/pokedex?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new ApiError(`El catálogo respondió ${response.status}`, response.status);
  }
  return (await response.json()) as PokedexPage;
}
