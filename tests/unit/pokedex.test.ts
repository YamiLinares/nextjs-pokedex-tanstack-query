import { describe, expect, it } from "vitest";
import type { PokemonListItem } from "@/lib/types/pokemon";
import { getPageWindow } from "@/lib/utils/pagination";
import {
  filterPokedex,
  normalizeSearch,
  paginatePokedex,
  parsePokedexQuery,
  pokedexQueryToSearchParams,
} from "@/lib/utils/pokedex";
import { idFromResourceUrl, parsePokemonId } from "@/lib/utils/ids";
import { formatName, formatPokedexNumber } from "@/lib/utils/format";

const INDEX: PokemonListItem[] = [
  { id: 1, name: "bulbasaur", types: ["grass", "poison"] },
  { id: 4, name: "charmander", types: ["fire"] },
  { id: 5, name: "charmeleon", types: ["fire"] },
  { id: 25, name: "pikachu", types: ["electric"] },
  { id: 122, name: "mr-mime", types: ["psychic", "fairy"] },
  { id: 250, name: "ho-oh", types: ["fire", "flying"] },
];

describe("parsePokedexQuery", () => {
  it("lee page, type y q de la URL", () => {
    expect(parsePokedexQuery({ page: "3", type: "fire", q: "Char" })).toEqual({ page: 3, type: "fire", search: "char" });
  });

  it("usa valores seguros por defecto ante datos inválidos", () => {
    expect(parsePokedexQuery({ page: "-2", type: "lava", q: undefined })).toEqual({ page: 1, type: null, search: "" });
    expect(parsePokedexQuery({ page: "abc" }).page).toBe(1);
    expect(parsePokedexQuery({ page: "99999" }).page).toBe(1000);
    expect(parsePokedexQuery({ page: ["2", "5"] }).page).toBe(2);
  });

  it("normaliza la búsqueda (acentos, mayúsculas, símbolos)", () => {
    expect(normalizeSearch("  Pokémon!<script>  ")).toBe("pokemonscript");
    expect(normalizeSearch(42)).toBe("");
  });

  it("serializa solo los parámetros distintos del valor por defecto", () => {
    expect(pokedexQueryToSearchParams({ page: 1, type: null, search: "" }).toString()).toBe("");
    expect(pokedexQueryToSearchParams({ page: 2, type: "water", search: "squ" }).toString()).toBe("q=squ&type=water&page=2");
  });
});

describe("filterPokedex", () => {
  it("filtra por tipo", () => {
    expect(filterPokedex(INDEX, { type: "fire", search: "" }).map((p) => p.id)).toEqual([4, 5, 250]);
  });

  it("busca por nombre parcial, también con espacios en lugar de guiones", () => {
    expect(filterPokedex(INDEX, { type: null, search: "charm" }).map((p) => p.name)).toEqual(["charmander", "charmeleon"]);
    expect(filterPokedex(INDEX, { type: null, search: "mr mime" }).map((p) => p.id)).toEqual([122]);
  });

  it("busca por número exacto o por prefijo", () => {
    expect(filterPokedex(INDEX, { type: null, search: "25" }).map((p) => p.id)).toEqual([25, 250]);
  });

  it("combina tipo y búsqueda", () => {
    expect(filterPokedex(INDEX, { type: "fire", search: "ho" }).map((p) => p.id)).toEqual([250]);
  });
});

describe("paginatePokedex", () => {
  const items = Array.from({ length: 1025 }, (_, i) => ({ id: i + 1, name: `p${i + 1}`, types: [] }));

  it("devuelve 50 elementos en la primera página", () => {
    const page = paginatePokedex(items, 1);
    expect(page.items).toHaveLength(50);
    expect(page.items[0].id).toBe(1);
    expect(page).toMatchObject({ page: 1, pageSize: 50, totalItems: 1025, totalPages: 21 });
  });

  it("devuelve la última página parcial y ajusta páginas fuera de rango", () => {
    expect(paginatePokedex(items, 21).items).toHaveLength(25);
    expect(paginatePokedex(items, 99).page).toBe(21);
  });

  it("maneja resultados vacíos", () => {
    expect(paginatePokedex([], 3)).toMatchObject({ items: [], page: 1, totalPages: 1, totalItems: 0 });
  });
});

describe("getPageWindow", () => {
  it("muestra primera, última y vecinas con saltos", () => {
    expect(getPageWindow(1, 21)).toEqual([1, 2, null, 21]);
    expect(getPageWindow(10, 21)).toEqual([1, null, 9, 10, 11, null, 21]);
    expect(getPageWindow(2, 3)).toEqual([1, 2, 3]);
    expect(getPageWindow(1, 1)).toEqual([1]);
  });
});

describe("ids y formato", () => {
  it("valida ids de la Pokédex nacional", () => {
    expect(parsePokemonId("25")).toBe(25);
    expect(parsePokemonId("1025")).toBe(1025);
    for (const invalid of ["0", "1026", "-1", "025", "abc", "2.5", "", undefined]) {
      expect(parsePokemonId(invalid)).toBeNull();
    }
  });

  it("extrae ids de URLs de PokéAPI", () => {
    expect(idFromResourceUrl("https://pokeapi.co/api/v2/pokemon-species/133/")).toBe(133);
    expect(idFromResourceUrl("https://pokeapi.co/api/v2/evolution-chain/67")).toBe(67);
    expect(idFromResourceUrl("https://pokeapi.co/api/v2/pokemon/")).toBeNull();
  });

  it("formatea nombres y números", () => {
    expect(formatName("mr-mime")).toBe("Mr Mime");
    expect(formatPokedexNumber(7)).toBe("#0007");
  });
});
