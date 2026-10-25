"use client";

// Client Component: necesita el evento onError del navegador para mostrar
// una alternativa si el sprite no existe o no carga.
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { PokeballIcon } from "@/components/ui/pokeball-icon";

type PokemonImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null;
  alt: string;
  pixelated?: boolean;
};

export function PokemonImage({ src, alt, pixelated = false, className = "", ...props }: PokemonImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div role="img" aria-label={`${alt} (imagen no disponible)`} className="flex h-full w-full items-center justify-center">
        <PokeballIcon className="h-1/2 w-1/2 opacity-25 grayscale" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={`${className} ${pixelated ? "[image-rendering:pixelated]" : ""}`}
      onError={() => setFailedSrc(src)}
      {...props}
    />
  );
}
