"use client";

/**
 * Proveedor de TanStack Query para los Client Components.
 * getQueryClient() devuelve la misma instancia durante toda la sesión en el
 * navegador y una nueva por petición durante el renderizado en el servidor.
 */
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/queries/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Solo se incluye en desarrollo; en producción el paquete exporta un componente vacío. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
