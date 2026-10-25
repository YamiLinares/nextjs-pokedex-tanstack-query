import { PokemonImage } from "@/components/pokemon/pokemon-image";
import type { PokemonSprite } from "@/lib/types/pokemon";

export function SpriteGallery({ sprites, name }: { sprites: PokemonSprite[]; name: string }) {
  if (sprites.length === 0) {
    return <p className="text-sm text-ink-muted">Este Pokémon no tiene sprites disponibles en PokéAPI.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {sprites.map((sprite) => (
        <li key={sprite.url} className="rounded-2xl border border-line bg-canvas p-2 text-center">
          <div className="relative mx-auto aspect-square w-full max-w-[120px]">
            <PokemonImage
              src={sprite.url}
              alt={`${name}: ${sprite.label.toLowerCase()}`}
              fill
              sizes="120px"
              pixelated={sprite.pixelated}
              className="object-contain"
            />
          </div>
          <p className="mt-1 text-xs font-medium text-ink-muted">{sprite.label}</p>
        </li>
      ))}
    </ul>
  );
}
