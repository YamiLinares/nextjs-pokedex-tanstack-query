/**
 * Configuración CENTRAL de TanStack Query (única fuente de los tiempos de caché).
 *
 * staleTime (24 h): tiempo durante el que un dato se considera fresco.
 *   Mientras lo sea, useQuery/prefetchQuery NO vuelven a pedirlo.
 * gcTime (24 h): tiempo que una consulta INACTIVA (sin componentes que la
 *   usen) sigue en memoria antes de eliminarse. Se iguala a staleTime para
 *   que un dato precargado por hover no se borre mientras sigue siendo
 *   fresco (con el valor por defecto de 5 min se perdería antes).
 *   Como solo se cachean modelos compactos, el consumo de memoria es bajo.
 */
import { QueryClient, isServer } from "@tanstack/react-query";
import { isNotFoundError } from "@/lib/api/errors";
import { ONE_DAY_MS } from "@/lib/constants";

export const STALE_TIME_MS = ONE_DAY_MS;
export const GC_TIME_MS = ONE_DAY_MS;
const MAX_CLIENT_RETRIES = 2;

/** Reintenta errores temporales, pero nunca un 404 (el recurso no existe). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isNotFoundError(error)) return false;
  return failureCount < MAX_CLIENT_RETRIES;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        // En el servidor no se reintenta para no retrasar la respuesta;
        // el cliente reintentará si hace falta.
        retry: isServer ? false : shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Servidor: SIEMPRE un QueryClient nuevo (nunca se comparte caché entre
 * peticiones de usuarios distintos).
 * Navegador: una única instancia estable durante la vida de la pestaña.
 */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
