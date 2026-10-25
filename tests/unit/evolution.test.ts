import { describe, expect, it } from "vitest";
import type { ApiChainLink, ApiEvolutionDetail } from "@/lib/types/pokeapi";
import {
  InvalidEvolutionChainError,
  describeEvolution,
  flattenEvolution,
  parseEvolutionChain,
} from "@/lib/utils/evolution";

const BASE_DETAIL: ApiEvolutionDetail = {
  trigger: null,
  min_level: null,
  item: null,
  held_item: null,
  min_happiness: null,
  min_affection: null,
  known_move: null,
  time_of_day: "",
  location: null,
};

function detail(overrides: Partial<ApiEvolutionDetail>): ApiEvolutionDetail {
  return { ...BASE_DETAIL, ...overrides };
}

function link(id: number, name: string, evolvesTo: ApiChainLink[] = [], details: ApiEvolutionDetail[] = []): ApiChainLink {
  return {
    species: { name, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
    evolution_details: details,
    evolves_to: evolvesTo,
  };
}

const levelUp = (level: number) => detail({ trigger: { name: "level-up", url: "" }, min_level: level });
const useItem = (item: string) => detail({ trigger: { name: "use-item", url: "" }, item: { name: item, url: "" } });

describe("parseEvolutionChain", () => {
  it("convierte una cadena lineal de tres etapas (Bulbasaur)", () => {
    const tree = parseEvolutionChain({
      id: 1,
      chain: link(1, "bulbasaur", [link(2, "ivysaur", [link(3, "venusaur", [], [levelUp(32)])], [levelUp(16)])]),
    });

    expect(tree).toEqual({
      id: 1,
      name: "bulbasaur",
      condition: null,
      evolvesTo: [
        {
          id: 2,
          name: "ivysaur",
          condition: "Nivel 16",
          evolvesTo: [{ id: 3, name: "venusaur", condition: "Nivel 32", evolvesTo: [] }],
        },
      ],
    });
  });

  it("conserva todas las ramas de una cadena ramificada (Eevee)", () => {
    const tree = parseEvolutionChain({
      id: 67,
      chain: link(133, "eevee", [
        link(134, "vaporeon", [], [useItem("water-stone")]),
        link(135, "jolteon", [], [useItem("thunder-stone")]),
        link(136, "flareon", [], [useItem("fire-stone")]),
        link(196, "espeon", [], [detail({ trigger: { name: "level-up", url: "" }, min_happiness: 160, time_of_day: "day" })]),
      ]),
    });

    expect(tree.evolvesTo.map((node) => node.name)).toEqual(["vaporeon", "jolteon", "flareon", "espeon"]);
    expect(tree.evolvesTo[0].condition).toBe("Usar Water Stone");
    expect(tree.evolvesTo[3].condition).toBe("Amistad alta · de día");
  });

  it("maneja ramas en distintos niveles (Wurmple)", () => {
    const tree = parseEvolutionChain({
      id: 135,
      chain: link(265, "wurmple", [
        link(266, "silcoon", [link(267, "beautifly", [], [levelUp(10)])], [levelUp(7)]),
        link(268, "cascoon", [link(269, "dustox", [], [levelUp(10)])], [levelUp(7)]),
      ]),
    });

    expect(flattenEvolution(tree).map((node) => node.id)).toEqual([265, 266, 267, 268, 269]);
  });

  it("acepta especies sin evolución", () => {
    const tree = parseEvolutionChain({ id: 66, chain: link(132, "ditto") });
    expect(tree).toEqual({ id: 132, name: "ditto", condition: null, evolvesTo: [] });
  });

  it.each([
    ["null", null],
    ["sin chain", { id: 1 }],
    ["eslabón sin especie", { chain: { evolves_to: [], evolution_details: [] } }],
    ["evolves_to no es un arreglo", { chain: { species: { name: "a", url: "x/1/" }, evolves_to: null, evolution_details: [] } }],
    ["URL de especie sin id", { chain: { species: { name: "a", url: "sin-id" }, evolves_to: [], evolution_details: [] } }],
  ])("rechaza estructuras inválidas: %s", (_label, input) => {
    expect(() => parseEvolutionChain(input)).toThrow(InvalidEvolutionChainError);
  });
});

describe("describeEvolution", () => {
  it("describe intercambio, objeto equipado y movimientos", () => {
    expect(describeEvolution([detail({ trigger: { name: "trade", url: "" } })])).toBe("Intercambio");
    expect(
      describeEvolution([detail({ trigger: { name: "trade", url: "" }, held_item: { name: "metal-coat", url: "" } })]),
    ).toBe("Intercambio · Con Metal Coat");
    expect(describeEvolution([detail({ trigger: { name: "level-up", url: "" }, known_move: { name: "ancient-power", url: "" } })])).toBe(
      "Conocer Ancient Power",
    );
  });

  it("usa textos genéricos cuando no hay más información", () => {
    expect(describeEvolution([])).toBeNull();
    expect(describeEvolution([detail({ trigger: { name: "level-up", url: "" } })])).toBe("Subir de nivel");
    expect(describeEvolution([detail({ trigger: { name: "spin", url: "" } })])).toBe("Spin");
  });
});
