/**
 * Integración con la PokéAPI REAL (requiere internet): npm run test:api
 * Verifica que los endpoints oficiales siguen teniendo la forma esperada y
 * que las transformaciones funcionan con datos reales.
 */
import { describe, expect, it } from "vitest";
import { fetchEvolutionChain, fetchPokemon, fetchPokemonSpecies } from "@/lib/api/pokeapi";
import { getPokedexIndex, getPokedexPage } from "@/lib/server/pokedex-index";
import { flattenEvolution } from "@/lib/utils/evolution";

describe("PokéAPI real", () => {
  it("construye el índice de 1025 Pokémon con tipos", async () => {
    const index = await getPokedexIndex();
    expect(index).toHaveLength(1025);
    expect(index[0]).toEqual({ id: 1, name: "bulbasaur", types: ["grass", "poison"] });
    expect(index.every((pokemon) => pokemon.types.length >= 1)).toBe(true);
  });

  it("la primera página del catálogo trae 50 Pokémon", async () => {
    const page = await getPokedexPage({ page: 1, type: null, search: "" });
    expect(page.items).toHaveLength(50);
    expect(page.totalItems).toBe(1025);
  });

  it("obtiene tipos, estadísticas, habilidades y sprites de Pikachu", async () => {
    const pikachu = await fetchPokemon(25);
    expect(pikachu.types).toEqual(["electric"]);
    expect(pikachu.stats.map((stat) => stat.name)).toEqual([
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ]);
    expect(pikachu.abilities.some((ability) => ability.isHidden)).toBe(true);
    expect(pikachu.sprites.length).toBeGreaterThanOrEqual(3);
  });

  it("recorre la cadena lineal Pichu → Pikachu → Raichu", async () => {
    const species = await fetchPokemonSpecies(25);
    expect(species.evolutionChainId).not.toBeNull();
    const chain = await fetchEvolutionChain(species.evolutionChainId!);
    expect(flattenEvolution(chain).map((node) => node.name)).toEqual(["pichu", "pikachu", "raichu"]);
  });

  it("recorre todas las ramas de Eevee", async () => {
    const species = await fetchPokemonSpecies(133);
    const chain = await fetchEvolutionChain(species.evolutionChainId!);
    expect(chain.name).toBe("eevee");
    expect(chain.evolvesTo.length).toBe(8);
    expect(chain.evolvesTo.map((node) => node.name)).toContain("sylveon");
  });

  it("devuelve 404 para un Pokémon inexistente", async () => {
    await expect(fetchPokemon(99999)).rejects.toMatchObject({ status: 404 });
  });
});
