"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function PokemonError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="px-4 py-16">
      <ErrorState title="No pudimos cargar este Pokémon" onRetry={retry} />
    </div>
  );
}
