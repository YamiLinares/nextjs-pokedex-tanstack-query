import Link from "next/link";
import { PokeballIcon } from "@/components/ui/pokeball-icon";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Pokédex Nexus, ir al catálogo">
          <PokeballIcon className="h-9 w-9" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-navy-900">Pokédex Nexus</span>
            <span className="hidden text-xs font-medium text-ink-muted sm:block">Explora el mundo Pokémon</span>
          </span>
        </Link>
        <nav aria-label="Principal">
          <Link
            href="/"
            className="rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            Catálogo
          </Link>
        </nav>
      </div>
    </header>
  );
}
