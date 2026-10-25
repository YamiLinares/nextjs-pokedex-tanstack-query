/**
 * Cliente de PokéAPI compartido por servidor y navegador.
 *
 * - En el SERVIDOR (Server Components y Route Handlers) cada `fetch` se
 *   guarda 24 h en la caché de datos de Next.js (`next.revalidate`).
 * - En el NAVEGADOR la caché la gestiona TanStack Query; el `fetch` es normal.
 *
 * Cada función transforma la respuesta cruda en un modelo compacto: por
 * ejemplo, /pokemon/25 pesa ~300 KB por la lista de movimientos, pero el
 * modelo `PokemonDetail` ocupa ~2 KB. Eso es lo que se cachea e hidrata.
 */
import { ONE_DAY_SECONDS, POKEAPI_BASE_URL } from "@/lib/constants";
import { ApiError } from "@/lib/api/errors";
import type {
  ApiPokemon,
  ApiPokemonSpecies,
} from "@/lib/types/pokeapi";
import type {
  EvolutionNode,
  PokemonDetail,
  PokemonSpecies,
  PokemonSprite,
} from "@/lib/types/pokemon";
import { parseEvolutionChain } from "@/lib/utils/evolution";
import { cleanFlavorText, formatName } from "@/lib/utils/format";
import { idFromResourceUrl } from "@/lib/utils/ids";
import { isPokemonType } from "@/lib/utils/pokedex";

const isServer = typeof window === "undefined";

/** GET a PokéAPI con caché de 24 h en el servidor y errores tipados. */
export async function pokeApiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  // Servidor: caché de datos de Next.js 24 h (sin `signal`, que impediría
  // la deduplicación de peticiones). Navegador: `signal` para cancelar
  // peticiones obsoletas; la caché la gestiona TanStack Query.
  const init: RequestInit & { next?: { revalidate: number } } = isServer
    ? { next: { revalidate: ONE_DAY_SECONDS } }
    : { signal };

  const response = await fetch(`${POKEAPI_BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new ApiError(`PokéAPI respondió ${response.status} en ${path}`, response.status);
  }
  return (await response.json()) as T;
}

export function toPokemonDetail(raw: ApiPokemon): PokemonDetail {
  const { sprites } = raw;
  const candidates: [string, string | null | undefined, boolean][] = [
    ["Ilustración oficial", sprites.other?.["official-artwork"]?.front_default, false],
    ["Ilustración variocolor", sprites.other?.["official-artwork"]?.front_shiny, false],
    ["Pokémon HOME", sprites.other?.home?.front_default, false],
    ["Frente", sprites.front_default, true],
    ["Espalda", sprites.back_default, true],
    ["Frente variocolor", sprites.front_shiny, true],
    ["Espalda variocolor", sprites.back_shiny, true],
  ];
  const spriteList: PokemonSprite[] = candidates
    .filter((entry): entry is [string, string, boolean] => typeof entry[1] === "string" && entry[1].length > 0)
    .map(([label, url, pixelated]) => ({ label, url, pixelated }));

  return {
    id: raw.id,
    name: raw.name,
    speciesId: idFromResourceUrl(raw.species.url) ?? raw.id,
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience,
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => entry.type.name)
      .filter(isPokemonType),
    stats: raw.stats.map((entry) => ({ name: entry.stat.name, value: entry.base_stat })),
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => ({ name: entry.ability.name, isHidden: entry.is_hidden })),
    artworkUrl: sprites.other?.["official-artwork"]?.front_default ?? sprites.front_default ?? null,
    sprites: spriteList,
  };
}

function pickLanguage<T extends { language: { name: string } }>(entries: T[], ...languages: string[]): T | undefined {
  for (const language of languages) {
    const found = entries.find((entry) => entry.language.name === language);
    if (found) return found;
  }
  return undefined;
}

export function toPokemonSpecies(raw: ApiPokemonSpecies): PokemonSpecies {
  const flavor = pickLanguage(raw.flavor_text_entries, "es", "en");
  return {
    id: raw.id,
    name: raw.name,
    displayName: pickLanguage(raw.names, "es", "en")?.name ?? formatName(raw.name),
    genus: pickLanguage(raw.genera, "es", "en")?.genus ?? null,
    description: flavor ? cleanFlavorText(flavor.flavor_text) : null,
    evolutionChainId: raw.evolution_chain ? idFromResourceUrl(raw.evolution_chain.url) : null,
    generation: raw.generation.name,
    habitat: raw.habitat?.name ?? null,
    captureRate: raw.capture_rate,
    isLegendary: raw.is_legendary,
    isMythical: raw.is_mythical,
  };
}

export async function fetchPokemon(id: number, signal?: AbortSignal): Promise<PokemonDetail> {
  return toPokemonDetail(await pokeApiFetch<ApiPokemon>(`/pokemon/${id}`, signal));
}

export async function fetchPokemonSpecies(id: number, signal?: AbortSignal): Promise<PokemonSpecies> {
  return toPokemonSpecies(await pokeApiFetch<ApiPokemonSpecies>(`/pokemon-species/${id}`, signal));
}

export async function fetchEvolutionChain(chainId: number, signal?: AbortSignal): Promise<EvolutionNode> {
  return parseEvolutionChain(await pokeApiFetch<unknown>(`/evolution-chain/${chainId}`, signal));
}
