import { PokemonImage } from "@/components/pokemon/pokemon-image";
import { PrefetchLink } from "@/components/pokemon/prefetch-link";
import { TypeList } from "@/components/pokemon/type-badge";
import { officialArtworkUrl } from "@/lib/constants";
import type { PokemonListItem } from "@/lib/types/pokemon";
import { formatName, formatPokedexNumber } from "@/lib/utils/format";

export function PokemonCard({ pokemon, priority = false }: { pokemon: PokemonListItem; priority?: boolean }) {
  const name = formatName(pokemon.name);

  return (
    <article className="group relative h-full rounded-2xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-1 hover:border-poke-500/40 hover:shadow-card-hover focus-within:shadow-card-hover">
      <PrefetchLink
        pokemonId={pokemon.id}
        className="flex h-full flex-col p-4 focus-visible:outline-offset-0"
        aria-label={`${name}, ${formatPokedexNumber(pokemon.id)}. Ver detalles`}
      >
        <div className="relative mx-auto aspect-square w-full max-w-[180px] rounded-full bg-canvas">
          <PokemonImage
            src={officialArtworkUrl(pokemon.id)}
            alt={name}
            fill
            sizes="(min-width: 1280px) 180px, (min-width: 640px) 25vw, 42vw"
            className="object-contain p-2 transition duration-300 group-hover:scale-105"
            preload={priority}
          />
        </div>
        <p className="mt-3 font-mono text-xs font-semibold text-ink-muted">{formatPokedexNumber(pokemon.id)}</p>
        <h3 className="font-display text-lg font-semibold text-navy-900">{name}</h3>
        <div className="mt-2">
          <TypeList types={pokemon.types} />
        </div>
      </PrefetchLink>
    </article>
  );
}
