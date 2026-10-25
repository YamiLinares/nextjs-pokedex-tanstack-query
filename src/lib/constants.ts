/** Constantes compartidas por servidor y cliente. */

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/** Número de especies de la Pokédex nacional en PokéAPI (generación IX). */
export const POKEDEX_MAX_ID = 1025;

/** Pokémon por página del catálogo (la carga inicial muestra 50). */
export const PAGE_SIZE = 50;

/** Duración de la caché de datos de PokéAPI: 24 horas. */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const ONE_DAY_SECONDS = 24 * 60 * 60;

/** Tipos jugables (se excluyen `unknown`, `shadow` y `stellar`). */
export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

const SPRITES_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/**
 * Ilustración oficial servida por el repositorio de sprites de PokéAPI.
 * Se construye a partir del id para no transferir la URL en cada elemento.
 */
export function officialArtworkUrl(id: number): string {
  return `${SPRITES_BASE}/other/official-artwork/${id}.png`;
}
