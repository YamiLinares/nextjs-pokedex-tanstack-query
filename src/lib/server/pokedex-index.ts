import "server-only";

/**
 * Índice del catálogo construido en el SERVIDOR.
 *
 * El listado de PokéAPI (/pokemon) solo trae nombre y URL; para mostrar los
 * tipos en las tarjetas sin pedir /pokemon/{id} por cada uno (50 peticiones
 * por página), se combinan 19 respuestas cacheadas 24 h:
 *   1 × /pokemon?limit=1025  +  18 × /type/{tipo}
 * El resultado permite buscar, filtrar y paginar en memoria, y el navegador
 * recibe solo la página que necesita (id, nombre y tipos).
 */
import { cache } from "react";
import { POKEDEX_MAX_ID, POKEMON_TYPES, type PokemonTypeName } from "@/lib/constants";
import { pokeApiFetch } from "@/lib/api/pokeapi";
import type { ApiType, NamedApiResourceList } from "@/lib/types/pokeapi";
import type { PokedexPage, PokedexQuery, PokemonListItem } from "@/lib/types/pokemon";
import { idFromResourceUrl } from "@/lib/utils/ids";
import { filterPokedex, paginatePokedex } from "@/lib/utils/pokedex";

/** `cache` de React evita repetir el trabajo dentro de una misma petición. */
export const getPokedexIndex = cache(async (): Promise<PokemonListItem[]> => {
  const [list, ...types] = await Promise.all([
    pokeApiFetch<NamedApiResourceList>(`/pokemon?limit=${POKEDEX_MAX_ID}`),
    ...POKEMON_TYPES.map((type) => pokeApiFetch<ApiType>(`/type/${type}`)),
  ]);

  // id → tipos ordenados por slot (tipo primario primero)
  const typesById = new Map<number, { slot: number; type: PokemonTypeName }[]>();
  types.forEach((typeResponse, index) => {
    const type = POKEMON_TYPES[index];
    for (const entry of typeResponse.pokemon) {
      const id = idFromResourceUrl(entry.pokemon.url);
      if (id === null || id > POKEDEX_MAX_ID) continue;
      const current = typesById.get(id) ?? [];
      current.push({ slot: entry.slot, type });
      typesById.set(id, current);
    }
  });

  return list.results
    .map((resource) => {
      const id = idFromResourceUrl(resource.url);
      if (id === null) return null;
      const types = (typesById.get(id) ?? []).sort((a, b) => a.slot - b.slot).map((entry) => entry.type);
      return { id, name: resource.name, types };
    })
    .filter((item): item is PokemonListItem => item !== null && item.id <= POKEDEX_MAX_ID)
    .sort((a, b) => a.id - b.id);
});

export async function getPokedexPage(query: PokedexQuery): Promise<PokedexPage> {
  const index = await getPokedexIndex();
  return paginatePokedex(filterPokedex(index, query), query.page);
}
