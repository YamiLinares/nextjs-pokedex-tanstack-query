import { POKEDEX_MAX_ID } from "@/lib/constants";

/**
 * Convierte el parámetro de la ruta `/pokemon/[id]` en un número válido de
 * la Pokédex nacional (1–1025). Devuelve `null` si no es válido.
 */
export function parsePokemonId(value: unknown): number | null {
  if (typeof value !== "string" || !/^[1-9]\d{0,4}$/.test(value)) return null;
  const id = Number(value);
  return id <= POKEDEX_MAX_ID ? id : null;
}

/** Extrae el id numérico de una URL de PokéAPI, p. ej. `.../pokemon-species/25/`. */
export function idFromResourceUrl(url: string): number | null {
  const match = /\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : null;
}
