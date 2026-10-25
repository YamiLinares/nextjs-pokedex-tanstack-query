/**
 * Comprueba la configuración de caché y que el prefetch reutiliza la caché:
 * fetch se simula para contar exactamente las peticiones a PokéAPI.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queries/keys";
import { pokemonOptions } from "@/lib/queries/options";
import { prefetchPokemonDetail } from "@/lib/queries/prefetch";
import { GC_TIME_MS, STALE_TIME_MS, makeQueryClient, shouldRetry } from "@/lib/queries/query-client";
import type { ApiPokemon, ApiPokemonSpecies } from "@/lib/types/pokeapi";

const POKEMON_25: ApiPokemon = {
  id: 25,
  name: "pikachu",
  height: 4,
  weight: 60,
  base_experience: 112,
  types: [{ slot: 1, type: { name: "electric", url: "" } }],
  stats: [{ base_stat: 35, effort: 0, stat: { name: "hp", url: "" } }],
  abilities: [
    { ability: { name: "lightning-rod", url: "" }, is_hidden: true, slot: 3 },
    { ability: { name: "static", url: "" }, is_hidden: false, slot: 1 },
  ],
  sprites: {
    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    back_default: null,
    front_shiny: null,
    back_shiny: null,
    other: { "official-artwork": { front_default: "https://example.test/art/25.png", front_shiny: null } },
  },
  species: { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon-species/25/" },
};

const SPECIES_25: ApiPokemonSpecies = {
  id: 25,
  name: "pikachu",
  names: [{ name: "Pikachu", language: { name: "es", url: "" } }],
  genera: [{ genus: "Pokémon Ratón", language: { name: "es", url: "" } }],
  flavor_text_entries: [{ flavor_text: "Almacena\nelectricidad\fen las mejillas.", language: { name: "es", url: "" }, version: { name: "x", url: "" } }],
  evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/10/" },
  generation: { name: "generation-i", url: "" },
  habitat: { name: "forest", url: "" },
  color: { name: "yellow", url: "" },
  capture_rate: 190,
  is_legendary: false,
  is_mythical: false,
};

const CHAIN_10 = {
  id: 10,
  chain: {
    species: { name: "pichu", url: "https://pokeapi.co/api/v2/pokemon-species/172/" },
    evolution_details: [],
    evolves_to: [
      {
        species: { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon-species/25/" },
        evolution_details: [{ trigger: { name: "level-up", url: "" }, min_happiness: 220 }],
        evolves_to: [],
      },
    ],
  },
};

const RESPONSES: Record<string, unknown> = {
  "/pokemon/25": POKEMON_25,
  "/pokemon-species/25": SPECIES_25,
  "/evolution-chain/10": CHAIN_10,
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async (input: string) => {
    const path = new URL(input).pathname.replace("/api/v2", "");
    const body = RESPONSES[path];
    return body ? new Response(JSON.stringify(body), { status: 200 }) : new Response("Not Found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("configuración central de caché", () => {
  it("staleTime y gcTime son de 24 horas", () => {
    expect(STALE_TIME_MS).toBe(24 * 60 * 60 * 1000);
    expect(GC_TIME_MS).toBe(24 * 60 * 60 * 1000);

    const defaults = makeQueryClient().getDefaultOptions().queries;
    expect(defaults?.staleTime).toBe(STALE_TIME_MS);
    expect(defaults?.gcTime).toBe(GC_TIME_MS);
  });

  it("no reintenta un 404 y limita los reintentos de otros errores", () => {
    expect(shouldRetry(0, new ApiError("no existe", 404))).toBe(false);
    expect(shouldRetry(0, new ApiError("caído", 503))).toBe(true);
    expect(shouldRetry(1, new TypeError("red"))).toBe(true);
    expect(shouldRetry(2, new TypeError("red"))).toBe(false);
  });

  it("crea un QueryClient distinto en cada llamada (servidor)", () => {
    expect(makeQueryClient()).not.toBe(makeQueryClient());
  });
});

describe("prefetchPokemonDetail", () => {
  it("precarga Pokémon, especie y cadena evolutiva con las claves esperadas", async () => {
    const queryClient = makeQueryClient();
    await prefetchPokemonDetail(queryClient, 25);

    const urls = fetchMock.mock.calls.map(([url]) => new URL(url as string).pathname);
    expect(urls.sort()).toEqual(["/api/v2/evolution-chain/10", "/api/v2/pokemon-species/25", "/api/v2/pokemon/25"]);

    expect(queryClient.getQueryData(queryKeys.pokemon(25))).toMatchObject({
      name: "pikachu",
      types: ["electric"],
      abilities: [
        { name: "static", isHidden: false },
        { name: "lightning-rod", isHidden: true },
      ],
    });
    expect(queryClient.getQueryData(queryKeys.species(25))).toMatchObject({
      displayName: "Pikachu",
      evolutionChainId: 10,
      description: "Almacena electricidad en las mejillas.",
    });
    expect(queryClient.getQueryData(queryKeys.evolutionChain(10))).toMatchObject({
      name: "pichu",
      evolvesTo: [{ name: "pikachu", condition: "Amistad alta" }],
    });
  });

  it("no repite peticiones mientras los datos son frescos (staleTime)", async () => {
    const queryClient = makeQueryClient();
    await prefetchPokemonDetail(queryClient, 25);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await prefetchPokemonDetail(queryClient, 25);
    await queryClient.fetchQuery(pokemonOptions(25));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("comparte las peticiones en curso si el hover se repite", async () => {
    const queryClient = makeQueryClient();
    await Promise.all([prefetchPokemonDetail(queryClient, 25), prefetchPokemonDetail(queryClient, 25)]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("propaga un 404 de PokéAPI como ApiError", async () => {
    const queryClient = makeQueryClient();
    await expect(queryClient.fetchQuery(pokemonOptions(9999))).rejects.toMatchObject({ status: 404 });
  });
});
