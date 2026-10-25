/** Route Handler /api/pokedex con PokéAPI simulada (correcta y caída). */
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/pokedex/route";

const request = (query: string) => new NextRequest(`http://localhost/api/pokedex${query}`);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/pokedex", () => {
  it("combina el listado y los tipos y pagina el resultado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        const path = new URL(input).pathname;
        if (path.endsWith("/pokemon")) {
          return Response.json({
            count: 2,
            next: null,
            previous: null,
            results: [
              { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
              { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4/" },
            ],
          });
        }
        const type = path.split("/").pop();
        const pokemon =
          type === "grass" ? [{ slot: 1, pokemon: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" } }]
          : type === "poison" ? [{ slot: 2, pokemon: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" } }]
          : type === "fire" ? [{ slot: 1, pokemon: { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4/" } }]
          : [];
        return Response.json({ name: type, pokemon });
      }),
    );

    const response = await GET(request("?type=fire"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("max-age=86400");
    expect(await response.json()).toMatchObject({
      items: [{ id: 4, name: "charmander", types: ["fire"] }],
      totalItems: 1,
      page: 1,
    });

    const all = await (await GET(request(""))).json();
    expect(all.items[0]).toEqual({ id: 1, name: "bulbasaur", types: ["grass", "poison"] });
  });

  it("responde 502 con un mensaje amigable si PokéAPI no está disponible", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Service Unavailable", { status: 503 })));

    const response = await GET(request("?page=1"));
    expect(response.status).toBe(502);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body.error).toMatch(/No se pudo obtener el catálogo/);
    expect(JSON.stringify(body)).not.toMatch(/503|stack|pokeapi\.co/i);
  });
});
