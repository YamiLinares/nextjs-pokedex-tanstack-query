/**
 * GET /api/pokedex?page=2&type=fire&q=char
 * Se ejecuta en el SERVIDOR. Devuelve una página compacta del catálogo
 * (id, nombre y tipos) para que el navegador no descargue el índice completo.
 */
import { NextResponse, type NextRequest } from "next/server";
import { ONE_DAY_SECONDS } from "@/lib/constants";
import { getPokedexPage } from "@/lib/server/pokedex-index";
import { parsePokedexQuery } from "@/lib/utils/pokedex";

export async function GET(request: NextRequest) {
  const query = parsePokedexQuery(Object.fromEntries(request.nextUrl.searchParams));

  try {
    const page = await getPokedexPage(query);
    return NextResponse.json(page, {
      headers: {
        // Caché HTTP/CDN de 24 h, coherente con el staleTime del cliente.
        "Cache-Control": `public, max-age=${ONE_DAY_SECONDS}, s-maxage=${ONE_DAY_SECONDS}, stale-while-revalidate=3600`,
      },
    });
  } catch (error) {
    console.error("[api/pokedex] No se pudo construir el catálogo", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "No se pudo obtener el catálogo de PokéAPI. Intenta de nuevo." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
