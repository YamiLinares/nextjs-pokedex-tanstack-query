"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Solo se registra en la consola; al usuario no se le muestran detalles técnicos.
    console.error(error);
  }, [error]);

  return (
    <div className="px-4 py-16">
      <ErrorState title="No pudimos cargar esta página" onRetry={retry} />
    </div>
  );
}
