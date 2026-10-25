/**
 * Página principal: React SERVER Component.
 *
 * Flujo de datos:
 * 1. Se crea un QueryClient NUEVO para esta petición (no se comparte entre usuarios).
 * 2. prefetchQuery obtiene en el servidor la página del catálogo (50 Pokémon
 *    con nombre, número y tipos) leyendo el índice construido desde PokéAPI.
 * 3. dehydrate() serializa la caché y <HydrationBoundary> la entrega al cliente.
 * 4. <PokedexCatalog> (Client Component) usa la MISMA clave de consulta y
 *    encuentra los datos ya hidratados: no repite la petición al montarse.
 */
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PokedexCatalog } from "@/components/pokemon/pokedex-catalog";
import { pokedexPageOptions } from "@/lib/queries/options";
import { makeQueryClient } from "@/lib/queries/query-client";
import { getPokedexPage } from "@/lib/server/pokedex-index";
import { parsePokedexQuery } from "@/lib/utils/pokedex";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const query = parsePokedexQuery(await searchParams);
  const queryClient = makeQueryClient();

  // Misma clave que usa el cliente; en el servidor la función lee el índice directamente.
  const options = pokedexPageOptions(query);
  await queryClient.prefetchQuery({ queryKey: options.queryKey, queryFn: () => getPokedexPage(query) });

  // prefetchQuery no lanza errores: si PokéAPI falló, el cliente lo reintentará y mostrará el error.
  const state = queryClient.getQueryState(options.queryKey);
  if (state?.status === "error") {
    console.error("[home] No se pudo precargar el catálogo:", (state.error as Error | null)?.message);
  }

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[28px] border-white/5"
        />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-poke-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-poke-500">Pokédex Nexus</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Explora el mundo Pokémon
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            Busca entre los 1025 Pokémon de la Pokédex nacional, filtra por tipo y descubre sus estadísticas,
            habilidades y evoluciones con datos reales de PokéAPI.
          </p>
        </div>
      </section>

      <div className="relative z-10 -mt-14">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PokedexCatalog initialQuery={query} />
        </HydrationBoundary>
      </div>
    </>
  );
}
