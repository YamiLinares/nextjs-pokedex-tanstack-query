import { PokemonImage } from "@/components/pokemon/pokemon-image";
import { PrefetchLink } from "@/components/pokemon/prefetch-link";
import { POKEDEX_MAX_ID, officialArtworkUrl } from "@/lib/constants";
import type { EvolutionNode } from "@/lib/types/pokemon";
import { formatName, formatPokedexNumber } from "@/lib/utils/format";

/**
 * Dibuja el árbol evolutivo de forma recursiva: cada nodo muestra sus
 * evoluciones a la derecha (o debajo en móvil). Funciona con cadenas
 * lineales, ramificadas (Eevee) y de una sola etapa.
 */
export function EvolutionTree({ root, currentId }: { root: EvolutionNode; currentId: number }) {
  if (root.evolvesTo.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <EvolutionStage node={root} currentId={currentId} />
        <p className="text-sm text-ink-muted">Este Pokémon no evoluciona.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto pb-2">
      <Branch node={root} currentId={currentId} />
    </div>
  );
}

function Branch({ node, currentId }: { node: EvolutionNode; currentId: number }) {
  return (
    <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
      <EvolutionStage node={node} currentId={currentId} />
      {node.evolvesTo.length > 0 && (
        <ul className={`flex gap-3 ${node.evolvesTo.length > 2 ? "flex-wrap justify-center" : "flex-col"}`}>
          {node.evolvesTo.map((child) => (
            <li key={child.id} className="flex flex-col items-center gap-2 md:flex-row">
              <span className="flex flex-col items-center px-1 text-center text-xs font-medium text-ink-muted md:min-w-24">
                <span aria-hidden="true" className="text-lg text-poke-500">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
                {child.condition ?? "Evoluciona"}
              </span>
              <Branch node={child} currentId={currentId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EvolutionStage({ node, currentId }: { node: EvolutionNode; currentId: number }) {
  const name = formatName(node.name);
  const isCurrent = node.id === currentId;
  const content = (
    <>
      <div className="relative mx-auto h-24 w-24">
        <PokemonImage src={officialArtworkUrl(node.id)} alt={name} fill sizes="96px" className="object-contain" />
      </div>
      <p className="mt-1 font-mono text-[11px] text-ink-muted">{formatPokedexNumber(node.id)}</p>
      <p className="font-display text-sm font-semibold text-navy-900">{name}</p>
    </>
  );
  const base = "block w-32 rounded-2xl border p-3 text-center transition";

  if (isCurrent) {
    return (
      <div className={`${base} border-poke-500 bg-poke-50`} aria-current="page">
        {content}
      </div>
    );
  }
  if (node.id > POKEDEX_MAX_ID) {
    return <div className={`${base} border-line bg-surface`}>{content}</div>;
  }
  return (
    <PrefetchLink pokemonId={node.id} className={`${base} border-line bg-surface hover:border-poke-500/50 hover:shadow-card-hover`}>
      {content}
    </PrefetchLink>
  );
}
