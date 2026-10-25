/**
 * Ruta dinámica /pokemon/[id]: React SERVER Component.
 *
 * 1. Valida el id (proxy.ts ya descarta formatos inválidos con un 404 real).
 * 2. Crea un QueryClient por petición y obtiene en el servidor el Pokémon,
 *    su especie y su cadena evolutiva con las MISMAS claves que el cliente.
 * 3. dehydrate + HydrationBoundary transfieren esos datos (compactos) al
 *    navegador; <PokemonDetailView> los reutiliza sin volver a pedirlos.
 *
 * Así la página funciona igual si se abre directamente la URL o si se llega
 * desde una tarjeta con los datos ya precargados por hover.
 */
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PokemonDetailView } from "@/components/pokemon/detail/pokemon-detail-view";
import { fetchPokemon, fetchPokemonSpecies } from "@/lib/api/pokeapi";
import { isNotFoundError } from "@/lib/api/errors";
import { pokemonOptions } from "@/lib/queries/options";
import { prefetchPokemonDetail } from "@/lib/queries/prefetch";
import { makeQueryClient } from "@/lib/queries/query-client";
import { formatName, formatPokedexNumber } from "@/lib/utils/format";
import { parsePokemonId } from "@/lib/utils/ids";

// ISR: cada detalle se genera en la primera visita y se reutiliza 24 h.
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/pokemon/[id]">): Promise<Metadata> {
  const id = parsePokemonId((await params).id);
  if (id === null) return { title: "Pokémon no encontrado" };

  try {
    // Mismas URLs que la página: Next.js deduplica estas peticiones.
    const [pokemon, species] = await Promise.all([fetchPokemon(id), fetchPokemonSpecies(id)]);
    const title = `${species.displayName} ${formatPokedexNumber(id)}`;
    const description = species.description ?? `Estadísticas, habilidades y evoluciones de ${formatName(pokemon.name)}.`;
    return {
      title,
      description,
      openGraph: { title, description, images: pokemon.artworkUrl ? [pokemon.artworkUrl] : undefined },
    };
  } catch {
    return { title: `Pokémon ${formatPokedexNumber(id)}` };
  }
}

export default async function PokemonPage({ params }: PageProps<"/pokemon/[id]">) {
  const id = parsePokemonId((await params).id);
  if (id === null) notFound();

  const queryClient = makeQueryClient();

  // fetchQuery (a diferencia de prefetchQuery) lanza el error: permite
  // distinguir "no existe" (404) de "PokéAPI no responde" (error.tsx).
  try {
    await queryClient.fetchQuery(pokemonOptions(id));
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  // Especie y cadena evolutiva (el Pokémon ya está en caché y no se repite).
  await prefetchPokemonDetail(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PokemonDetailView id={id} />
    </HydrationBoundary>
  );
}
