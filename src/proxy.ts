/**
 * Valida el id de /pokemon/[id] ANTES de renderizar.
 * Un id con formato inválido o fuera de la Pokédex nacional (1–1025) se
 * reescribe a una ruta inexistente, lo que muestra not-found.tsx con un
 * código HTTP 404 real (sin depender del streaming de la página).
 */
import { NextResponse, type NextRequest } from "next/server";
import { parsePokemonId } from "@/lib/utils/ids";

export function proxy(request: NextRequest) {
  const segment = request.nextUrl.pathname.split("/")[2];
  if (parsePokemonId(segment) === null) {
    return NextResponse.rewrite(new URL("/pokemon-no-encontrado", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/pokemon/:id",
};
