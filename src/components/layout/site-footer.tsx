export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-navy-950 text-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          <span className="font-display font-semibold text-white">Pokédex Nexus</span> · Proyecto académico con
          Next.js y TanStack Query.
        </p>
        <p>
          Datos e imágenes de{" "}
          <a
            href="https://pokeapi.co"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-4"
          >
            PokéAPI
          </a>
          . Pokémon es una marca de Nintendo, Creatures y Game Freak.
        </p>
      </div>
    </footer>
  );
}
