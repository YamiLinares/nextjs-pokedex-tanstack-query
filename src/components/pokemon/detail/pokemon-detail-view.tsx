"use client";

/**
 * Vista de detalle (Client Component).
 *
 * Lee los datos con useQuery usando las MISMAS claves que el servidor y que
 * el prefetch por hover. Por eso, al llegar desde una tarjeta o al abrir la
 * URL directamente, los datos ya están en caché (hidratados o precargados)
 * y no se hace ninguna petición extra mientras sean frescos (24 h).
 */
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { EvolutionTree } from "@/components/pokemon/detail/evolution-tree";
import { SpriteGallery } from "@/components/pokemon/detail/sprite-gallery";
import { StatBars } from "@/components/pokemon/detail/stat-bars";
import { PokemonImage } from "@/components/pokemon/pokemon-image";
import { PrefetchLink } from "@/components/pokemon/prefetch-link";
import { TypeList } from "@/components/pokemon/type-badge";
import { ErrorState } from "@/components/ui/error-state";
import { DetailSkeleton } from "@/components/ui/skeletons";
import { POKEDEX_MAX_ID } from "@/lib/constants";
import { evolutionChainOptions, pokemonOptions, speciesOptions } from "@/lib/queries/options";
import { formatHeight, formatName, formatPokedexNumber, formatWeight, generationLabel, habitatLabel } from "@/lib/utils/format";

export function PokemonDetailView({ id }: { id: number }) {
  const pokemonQuery = useQuery(pokemonOptions(id));
  const speciesQuery = useQuery(speciesOptions(id));
  const chainId = speciesQuery.data?.evolutionChainId ?? null;
  const chainQuery = useQuery({
    ...evolutionChainOptions(chainId ?? 0),
    enabled: chainId !== null,
  });

  if (pokemonQuery.isPending) return <DetailSkeleton />;

  if (pokemonQuery.isError) {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title="No pudimos cargar este Pokémon"
          onRetry={() => void pokemonQuery.refetch()}
          retrying={pokemonQuery.isFetching}
        />
      </div>
    );
  }

  const pokemon = pokemonQuery.data;
  const species = speciesQuery.data;
  const englishName = formatName(pokemon.name);
  const displayName = species?.displayName ?? englishName;

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Navegación del Pokémon" className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-1 rounded-full px-1 text-sm font-semibold text-navy-800 hover:text-poke-600">
          ← Volver al catálogo
        </Link>
        <div className="flex gap-2">
          {id > 1 && (
            <PrefetchLink pokemonId={id - 1} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-canvas">
              ← {formatPokedexNumber(id - 1)}
            </PrefetchLink>
          )}
          {id < POKEDEX_MAX_ID && (
            <PrefetchLink pokemonId={id + 1} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-canvas">
              {formatPokedexNumber(id + 1)} →
            </PrefetchLink>
          )}
        </div>
      </nav>

      <header className="mt-6 grid items-center gap-8 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card md:grid-cols-2 md:p-10">
        <div className="relative mx-auto aspect-square w-full max-w-sm rounded-full bg-gradient-to-br from-canvas to-poke-50">
          <PokemonImage
            src={pokemon.artworkUrl}
            alt={`Ilustración oficial de ${displayName}`}
            fill
            preload
            sizes="(min-width: 768px) 384px, 90vw"
            className="object-contain p-6"
          />
        </div>
        <div>
          <p className="font-mono text-sm font-semibold text-ink-muted">{formatPokedexNumber(pokemon.id)}</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">{displayName}</h1>
          {displayName !== englishName && <p className="text-ink-muted">{englishName}</p>}
          {species?.genus && <p className="mt-2 font-medium text-poke-600">{species.genus}</p>}
          <div className="mt-4">
            <TypeList types={pokemon.types} size="md" />
          </div>
          {species?.description && <p className="mt-5 leading-relaxed text-ink">{species.description}</p>}
          {speciesQuery.isError && (
            <p className="mt-5 text-sm text-ink-muted">
              No se pudo cargar la descripción.{" "}
              <button type="button" className="font-semibold text-poke-600 underline" onClick={() => void speciesQuery.refetch()}>
                Reintentar
              </button>
            </p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact label="Altura" value={formatHeight(pokemon.height)} />
            <Fact label="Peso" value={formatWeight(pokemon.weight)} />
            <Fact label="Exp. base" value={pokemon.baseExperience?.toString() ?? "—"} />
            {species && <Fact label="Generación" value={generationLabel(species.generation)} />}
            {species?.habitat && <Fact label="Hábitat" value={habitatLabel(species.habitat)} />}
            {species && (species.isLegendary || species.isMythical) && (
              <Fact label="Rareza" value={species.isMythical ? "Singular" : "Legendario"} />
            )}
          </dl>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Estadísticas base">
          <StatBars stats={pokemon.stats} />
        </Panel>
        <Panel title="Habilidades">
          <ul className="space-y-2">
            {pokemon.abilities.map((ability) => (
              <li key={ability.name} className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
                <span className="font-medium text-navy-900">{formatName(ability.name)}</span>
                {ability.isHidden && (
                  <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-xs font-semibold text-white">Oculta</span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Cadena evolutiva" className="mt-6">
        {speciesQuery.isPending || (chainId !== null && chainQuery.isPending) ? (
          <p role="status" className="text-sm text-ink-muted">Cargando cadena evolutiva…</p>
        ) : speciesQuery.isError || chainQuery.isError ? (
          <p className="text-sm text-ink-muted">
            No se pudo cargar la cadena evolutiva.{" "}
            <button
              type="button"
              className="font-semibold text-poke-600 underline"
              onClick={() => void (speciesQuery.isError ? speciesQuery.refetch() : chainQuery.refetch())}
            >
              Reintentar
            </button>
          </p>
        ) : chainQuery.data ? (
          <EvolutionTree root={chainQuery.data} currentId={pokemon.speciesId} />
        ) : (
          <p className="text-sm text-ink-muted">PokéAPI no registra una cadena evolutiva para este Pokémon.</p>
        )}
      </Panel>

      <Panel title="Sprites" className="mt-6">
        <SpriteGallery sprites={pokemon.sprites} name={displayName} />
      </Panel>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-6 shadow-card ${className}`}>
      <h2 className="mb-5 font-display text-xl font-bold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}
