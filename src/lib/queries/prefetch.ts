/**
 * Precarga TODOS los datos de la página de detalle de un Pokémon.
 *
 * Se usa en dos sitios con el mismo código y las mismas claves:
 *  - En el navegador, al pasar el cursor sobre una tarjeta (onMouseEnter).
 *  - En el servidor, antes de renderizar /pokemon/[id] y deshidratar.
 *
 * `prefetchQuery` respeta staleTime: si los datos ya están frescos en
 * caché no se repite la petición, y las peticiones en curso se comparten.
 */
import type { QueryClient } from "@tanstack/react-query";
import { evolutionChainOptions, pokemonOptions, speciesOptions } from "@/lib/queries/options";

export async function prefetchPokemonDetail(queryClient: QueryClient, id: number): Promise<void> {
  // En la Pokédex nacional (1–1025) el id del Pokémon coincide con el de su especie,
  // así que ambas peticiones pueden ir en paralelo.
  await Promise.all([
    queryClient.prefetchQuery(pokemonOptions(id)),
    queryClient.prefetchQuery(speciesOptions(id)),
  ]);

  // La cadena evolutiva depende del id que viene en la especie.
  const species = queryClient.getQueryData(speciesOptions(id).queryKey);
  if (species?.evolutionChainId) {
    await queryClient.prefetchQuery(evolutionChainOptions(species.evolutionChainId));
  }
}
