/**
 * Lógica pura del catálogo: lectura de parámetros, filtrado y paginación.
 * Se comparte entre la página del servidor, la Route Handler y las pruebas.
 */
import { PAGE_SIZE, POKEMON_TYPES, type PokemonTypeName } from "@/lib/constants";
import type { PokedexPage, PokedexQuery, PokemonListItem } from "@/lib/types/pokemon";

const MAX_SEARCH_LENGTH = 40;
const MAX_PAGE = 1000;

export function isPokemonType(value: unknown): value is PokemonTypeName {
  return typeof value === "string" && (POKEMON_TYPES as readonly string[]).includes(value);
}

/** Normaliza la búsqueda: minúsculas, sin acentos ni caracteres extraños. */
export function normalizeSearch(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Convierte los parámetros de la URL en una consulta válida (valores por defecto seguros). */
export function parsePokedexQuery(params: RawParams): PokedexQuery {
  const rawPage = Number(first(params.page));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? Math.min(rawPage, MAX_PAGE) : 1;
  const type = first(params.type);
  return {
    page,
    type: isPokemonType(type) ? type : null,
    search: normalizeSearch(first(params.q)),
  };
}

/** Serializa la consulta para la URL omitiendo los valores por defecto. */
export function pokedexQueryToSearchParams(query: PokedexQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.type) params.set("type", query.type);
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function filterPokedex(index: PokemonListItem[], query: Pick<PokedexQuery, "type" | "search">) {
  const search = query.search;
  const numeric = /^\d+$/.test(search) ? Number(search) : null;

  return index.filter((pokemon) => {
    if (query.type && !pokemon.types.includes(query.type)) return false;
    if (!search) return true;
    if (numeric !== null) return pokemon.id === numeric || String(pokemon.id).startsWith(search);
    return pokemon.name.includes(search.replace(/ /g, "-"));
  });
}

export function paginatePokedex(items: PokemonListItem[], page: number, pageSize = PAGE_SIZE): PokedexPage {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    totalItems,
    totalPages,
  };
}
