import Link from "next/link";
import { PokeballIcon } from "@/components/ui/pokeball-icon";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <PokeballIcon className="mx-auto h-20 w-20 opacity-30 grayscale" />
      <p className="mt-6 font-mono text-sm font-semibold text-poke-600">Error 404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy-900">Pokémon no encontrado</h1>
      <p className="mt-3 text-ink-muted">
        La página o el número que buscas no existe. La Pokédex nacional va del #0001 al #1025.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-poke-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-poke-600"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}
