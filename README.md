# Pokédex Nexus — Explora el mundo Pokémon

Pokédex web que consume datos reales de [PokéAPI](https://pokeapi.co). Está hecha con **Next.js 16 (App Router)**, **React Server Components** y **TanStack Query v5**. El proyecto demuestra cómo optimizar la transferencia de datos entre servidor y cliente: prefetching estratégico, hidratación con `HydrationBoundary` y `dehydrate`, y una caché de 24 horas.

**Repositorio:** https://github.com/YamiLinares/nextjs-pokedex-tanstack-query

## Objetivos académicos

Actividad: *Optimización de Transferencia de Datos: Implementación de TanStack Query y Estrategias Avanzadas de Caché en Aplicaciones Modernas.*

- La página principal es un Server Component que obtiene en el servidor al menos 50 Pokémon.
- `prefetchQuery` se ejecuta con `onMouseEnter` para anticipar los datos del detalle.
- El estado se transfiere del servidor al cliente con `dehydrate` y `<HydrationBoundary>`.
- La caché usa `staleTime` de 24 horas y un `gcTime` definido de forma explícita.
- Hay una ruta dinámica `/pokemon/[id]` con cadena evolutiva completa.
- Tipado estricto, estados de carga, manejo de errores y diseño responsive.

## Tecnologías

| Tecnología | Versión |
| --- | --- |
| Next.js (App Router, Turbopack) | 16.4.3 |
| React / React DOM | 19.3.0 |
| TanStack Query (`@tanstack/react-query`) | 5.104.5 |
| TanStack Query Devtools (solo desarrollo) | 5.104.5 |
| TypeScript | 5.9 |
| Tailwind CSS | 4.3 |
| Vitest | 5.0 |

No se necesitan variables de entorno ni claves: PokéAPI es pública.

## Requisitos previos

- Node.js 20.9 o superior (probado con Node.js 24.16) y npm 10 o superior.
- Conexión a internet (la aplicación consulta PokéAPI en tiempo real).
- Opcional, para `npm run test:e2e`: Microsoft Edge o Google Chrome.

## Instalación y ejecución (Windows PowerShell)

```powershell
git clone https://github.com/YamiLinares/nextjs-pokedex-tanstack-query.git
cd nextjs-pokedex-tanstack-query
npm install

# Desarrollo (con TanStack Query Devtools)
npm run dev
# Abre http://localhost:3000

# Producción
npm run build
npm run start
# Abre http://localhost:3000
```

## Estructura del proyecto

```text
src/
├── app/
│   ├── layout.tsx               # Layout raíz + QueryProvider
│   ├── page.tsx                 # Catálogo (Server Component: prefetch + dehydrate)
│   ├── loading.tsx · error.tsx · not-found.tsx
│   ├── api/pokedex/route.ts     # Route Handler: páginas compactas del catálogo
│   └── pokemon/[id]/            # Ruta dinámica del detalle
│       ├── page.tsx             # Server Component: fetchQuery + dehydrate
│       ├── loading.tsx
│       └── error.tsx
├── components/
│   ├── layout/                  # Encabezado y pie
│   ├── providers/query-provider.tsx
│   ├── pokemon/                 # Catálogo, tarjeta, PrefetchLink, imagen, tipos
│   │   └── detail/              # Vista de detalle, estadísticas, sprites, evoluciones
│   └── ui/                      # Esqueletos, estado de error, icono
├── lib/
│   ├── api/                     # Cliente de PokéAPI, cliente del catálogo, errores
│   ├── queries/                 # QueryClient, claves, queryOptions y prefetch
│   ├── server/pokedex-index.ts  # Índice del catálogo (solo servidor)
│   ├── types/                   # Tipos de PokéAPI y modelos de dominio
│   ├── utils/                   # Evolución, filtros, paginación, formato, ids
│   └── constants.ts
└── proxy.ts                     # 404 reales para ids inválidos
scripts/
├── smoke-test.mjs               # Pruebas HTTP
└── e2e-browser.mjs              # Pruebas en navegador real (red, hover, caché)
tests/
├── unit/                        # Sin red (fetch simulado)
└── api/                         # Contra la PokéAPI real
```

## Rutas

| Ruta | Tipo | Descripción |
| --- | --- | --- |
| `/` | Server Component dinámico | Catálogo. Acepta `?page=2`, `?type=fire` y `?q=char` |
| `/pokemon/[id]` | Server Component con ISR (24 h) | Detalle del Pokémon `1`–`1025` |
| `/api/pokedex` | Route Handler | Página compacta del catálogo en JSON |
| Cualquier otra, `/pokemon/0`, `/pokemon/abc` | — | Página 404 con código HTTP 404 |

## Server Components y Client Components

| Componente | Tipo | Dónde se ejecuta la consulta |
| --- | --- | --- |
| `app/page.tsx` | Server | **Servidor**: `prefetchQuery` del catálogo (lee el índice directamente) |
| `app/pokemon/[id]/page.tsx` | Server | **Servidor**: `fetchQuery` del Pokémon y `prefetchPokemonDetail` (especie y cadena evolutiva) |
| `app/api/pokedex/route.ts` | Route Handler | **Servidor**: filtra y pagina el índice |
| `lib/server/pokedex-index.ts` | `server-only` | **Servidor**: 1 × `/pokemon?limit=1025` + 18 × `/type/{tipo}` |
| `PokedexCatalog` | Client | **Cliente**: `useQuery` (página 1 hidratada; las demás vía `/api/pokedex`) |
| `PrefetchLink` (tarjetas, evoluciones, anterior/siguiente) | Client | **Cliente**: `prefetchQuery` en `onMouseEnter` |
| `PokemonDetailView` | Client | **Cliente**: `useQuery` con datos ya hidratados o precargados |
| `PokemonImage`, `ErrorState`, `QueryProvider` | Client | Sin consultas (eventos `onError` y `onClick`, y proveedor) |

Solo son Client Components los que necesitan estado, eventos o hooks de TanStack Query.

## Integración con PokéAPI

| Endpoint oficial | Uso | Clave de caché |
| --- | --- | --- |
| `GET /pokemon?limit=1025` | Nombres e ids del catálogo | (índice del servidor) |
| `GET /type/{tipo}` × 18 | Tipos de cada Pokémon y filtro por tipo | (índice del servidor) |
| `GET /pokemon/{id}` | Tipos, estadísticas, habilidades y sprites | `["pokemon", id]` |
| `GET /pokemon-species/{id}` | Nombre en español, descripción, género e id de la cadena | `["pokemon-species", id]` |
| `GET /evolution-chain/{id}` | Árbol evolutivo | `["evolution-chain", chainId]` |
| `/api/pokedex` (propia) | Página filtrada del catálogo | `["pokedex", { page, type, search }]` |

**Optimización de la transferencia de datos:**

- El listado de PokéAPI no incluye los tipos. En lugar de hacer 50 peticiones a `/pokemon/{id}` por página, el servidor combina 19 respuestas cacheadas y envía solo `{ id, name, types }`. La URL de la imagen se calcula a partir del id.
- Cada respuesta se transforma en un modelo compacto antes de guardarla en caché. Por ejemplo, `/pokemon/25` pesa **≈ 300 KB** (casi todo es la lista de movimientos), pero `PokemonDetail` ocupa unos **2 KB**. Eso es lo que se deshidrata, y por eso el HTML completo del detalle de Pikachu pesa ≈ 68 KB.
- Las imágenes pasan por `next/image` (formatos modernos, tamaños adaptados y `minimumCacheTTL` de 24 h).

## Prefetching por hover

`src/components/pokemon/prefetch-link.tsx` hace lo siguiente:

1. En `onMouseEnter` programa la precarga con una intención de hover de 75 ms. Si el cursor sale antes, se cancela; así cruzar el cursor por encima de muchas tarjetas no dispara peticiones.
2. Ejecuta `prefetchPokemonDetail(queryClient, id)` (`src/lib/queries/prefetch.ts`):
   - `prefetchQuery(["pokemon", id])` y `prefetchQuery(["pokemon-species", id])` en paralelo;
   - con el `evolutionChainId` de la especie, `prefetchQuery(["evolution-chain", chainId])`.
3. `onFocus` y `onTouchStart` precargan de inmediato, como alternativa para teclado y pantallas táctiles.

`prefetchQuery` respeta el `staleTime`: si los datos ya están frescos no se repite la petición, y si hay una en curso se comparte. Al hacer clic, `PokemonDetailView` llama a `useQuery` con las mismas claves y encuentra los datos en caché.

Además, el catálogo precarga la **página siguiente** en cuanto se muestra la actual.

### Cómo verificar el prefetching

1. `npm run dev` y abre http://localhost:3000.
2. Abre las DevTools del navegador (F12), pestaña **Red** (Network), y filtra por `pokeapi`.
3. Pasa el cursor sobre una tarjeta. Aparecen 3 peticiones: `pokemon/{id}`, `pokemon-species/{id}` y `evolution-chain/{id}`.
4. Pasa el cursor de nuevo sobre la misma tarjeta. No aparece ninguna petición nueva.
5. Haz clic. El detalle se muestra sin nuevas peticiones a PokéAPI.
6. Para ver la caché por dentro, usa el botón de **TanStack Query Devtools** (abajo a la izquierda, solo en desarrollo). Ahí aparecen las consultas `["pokemon", id]` y las demás, con su estado `fresh`.

`npm run test:e2e` automatiza estas comprobaciones observando el tráfico real del navegador.

## HydrationBoundary y dehydrate

Flujo de datos del catálogo:

```text
PokéAPI ──fetch (caché de Next.js 24 h)──▶ índice en el servidor
        app/page.tsx (Server Component)
          1. const queryClient = makeQueryClient()   ← nuevo por petición
          2. await queryClient.prefetchQuery({ queryKey: ["pokedex", query], … })
          3. <HydrationBoundary state={dehydrate(queryClient)}>
                 <PokedexCatalog />                    ← Client Component
        navegador
          4. QueryProvider: QueryClient estable (uno por pestaña)
          5. useQuery(["pokedex", query]) encuentra los datos hidratados
             → 0 peticiones al montar; solo las páginas nuevas van a /api/pokedex
```

El detalle sigue el mismo patrón. `fetchQuery` del Pokémon permite distinguir un 404 de un error de PokéAPI. Después `prefetchPokemonDetail` obtiene la especie y la cadena, y todo se deshidrata junto. Por eso la página funciona igual si se abre la URL directamente o si se llega desde una tarjeta.

`QueryClient` en el servidor: `getQueryClient()` y `makeQueryClient()` crean siempre una instancia nueva cuando `isServer` es verdadero. Así nunca se comparte caché entre peticiones de usuarios distintos.

### Cómo comprobar que los datos hidratados se reutilizan

- Abre http://localhost:3000 con la pestaña **Red** abierta. **No** aparece ninguna petición a `/api/pokedex?page=1` ni a PokéAPI. La primera página llegó en el HTML.
- Con **Ver código fuente** se encuentra el estado deshidratado en el HTML, buscando `queryKey` y `pokedex`.
- `npm run test:smoke` verifica que el HTML contiene las consultas `pokedex`, `pokemon`, `pokemon-species` y `evolution-chain`.

## Estrategia de caché

### TanStack Query (cliente)

Está configurado en un solo lugar: `src/lib/queries/query-client.ts`.

| Opción | Valor | Significado |
| --- | --- | --- |
| `staleTime` | `24 * 60 * 60 * 1000` (24 h) | Tiempo durante el que un dato es **fresco**: no se vuelve a pedir |
| `gcTime` | `24 * 60 * 60 * 1000` (24 h) | Tiempo que una consulta **inactiva** (sin componentes que la usen) sigue en memoria antes de eliminarse |
| `retry` | 2 en el cliente, 0 en el servidor, nunca ante un 404 | Evita ciclos de reintento si PokéAPI no responde |
| `refetchOnWindowFocus` | `false` | Los datos de PokéAPI casi no cambian |

¿Por qué `gcTime` igual a `staleTime`? Un dato precargado por hover queda inactivo de inmediato, porque ningún componente lo usa todavía. Con el `gcTime` por defecto (5 min) se borraría antes de dejar de ser fresco. Como solo se guardan modelos compactos, mantenerlos 24 h ocupa poca memoria.

**Qué se guarda en caché:** páginas del catálogo, detalles de Pokémon, especies y cadenas evolutivas, ya transformados.

**Cuándo hay peticiones nuevas:**

- una página, Pokémon, especie o cadena que no esté en caché;
- un dato con más de 24 h (se considera obsoleto y se vuelve a pedir al usarlo);
- una consulta inactiva durante más de 24 h, que ya se eliminó;
- un reintento manual tras un error.

**Limitaciones:** la caché de TanStack Query vive **en memoria de la pestaña**. Al recargar la página (F5), abrir otra pestaña o iniciar una sesión nueva, se pierde. No se usa almacenamiento persistente (`persistQueryClient`). Tras recargar, los datos vuelven a llegar hidratados desde el servidor, que tiene su propia caché.

### Next.js (servidor), independiente de TanStack Query

- `next.config.ts` desactiva `cacheComponents` y usa el modelo clásico de caché de `fetch`.
- Cada petición a PokéAPI desde el servidor usa `fetch(url, { next: { revalidate: 86400 } })`. La guarda la caché de datos de Next.js durante 24 h y es compartida por todos los usuarios. No se usa `force-cache` de forma indiscriminada.
- `/pokemon/[id]` usa ISR (`revalidate = 86400`): se genera en la primera visita y se reutiliza 24 h.
- `/` es dinámica porque lee `searchParams`, pero sus datos salen de la caché de `fetch`.
- `/api/pokedex` responde con `Cache-Control: public, max-age=86400, s-maxage=86400`.
- En el navegador, `fetch` no usa la caché de Next.js: la caché del cliente es solo TanStack Query.

| | Caché de Next.js | Caché de TanStack Query |
| --- | --- | --- |
| Dónde vive | Servidor (disco/CDN) | Memoria del navegador |
| Compartida | Entre todos los usuarios | Por pestaña |
| Duración | 24 h (`revalidate`) | 24 h (`staleTime` / `gcTime`) |
| Sobrevive a recargar | Sí | No |

## Tratamiento de errores

- `proxy.ts` devuelve **404 reales** para ids con formato inválido o fuera de 1–1025, antes de renderizar.
- `/pokemon/[id]` llama a `notFound()` si PokéAPI responde 404 y lanza el error a `error.tsx` si PokéAPI falla.
- `error.tsx` (raíz y detalle) muestra un mensaje comprensible y un botón **Reintentar**, sin trazas internas.
- `loading.tsx` (catálogo y detalle) y esqueletos en los estados `isPending`.
- En el catálogo se distinguen 3 casos: `isPending` muestra el esqueleto, `isError` sin datos muestra el error con reintento, y un resultado vacío muestra un mensaje para limpiar los filtros.
- En el detalle, si falla la especie o la cadena evolutiva, el resto de la página sigue visible con un reintento parcial.
- `/api/pokedex` responde `502` con un mensaje genérico y `no-store` si PokéAPI no está disponible.
- `ApiError` conserva el código HTTP para no reintentar los 404.
- La cadena evolutiva se valida en tiempo de ejecución (`parseEvolutionChain`), porque es un dato externo.

## Pruebas

```powershell
npm run lint                      # ESLint
npm run typecheck                 # Tipos de rutas de Next.js + TypeScript estricto
npm test                          # 35 pruebas unitarias (sin red)
npm run test:api                  # 6 pruebas contra la PokéAPI real
npm run build
npm run start                     # en otra terminal:
npm run test:smoke -- http://localhost:3000
npm run test:e2e   -- http://localhost:3000
npm run verify                    # lint + typecheck + test + build
```

| Suite | Qué verifica |
| --- | --- |
| `tests/unit/evolution.test.ts` | Cadenas lineales, ramificadas (Eevee), con ramas en varios niveles (Wurmple), sin evolución, estructuras inválidas y textos de las condiciones |
| `tests/unit/queries.test.ts` | `staleTime`/`gcTime` de 24 h, reintentos, claves del prefetch, **0 peticiones repetidas** con datos frescos y peticiones compartidas |
| `tests/unit/pokedex.test.ts` | Parámetros de URL, búsqueda, filtro por tipo, paginación, ids y formato |
| `tests/unit/api-route.test.ts` | Route Handler correcta y con PokéAPI caída (502) |
| `tests/api/pokeapi.test.ts` | Índice de 1025 Pokémon, página de 50, Pikachu, Pichu → Pikachu → Raichu, 8 ramas de Eevee y 404 |
| `scripts/smoke-test.mjs` | Códigos HTTP, 50 tarjetas en el HTML, datos deshidratados, filtros, 404 |
| `scripts/e2e-browser.mjs` | En un navegador real: hidratación sin peticiones, prefetch por hover, reutilización en el detalle, paginación, búsqueda, consola sin errores y diseño sin desbordes en 390 px y 1366 px |

## Compilación de producción

```powershell
npm run build
```

Resultado esperado: `/` dinámica (ƒ), `/pokemon/[id]` con generación bajo demanda (●), `/api/pokedex` (ƒ) y el `proxy`.

## Solución de problemas

| Problema | Solución |
| --- | --- |
| El catálogo muestra "No pudimos cargar el catálogo" | PokéAPI no respondió o no hay internet. Pulsa **Reintentar** o comprueba https://pokeapi.co |
| `npm run test:api` falla | Necesita internet. Si PokéAPI está caída, vuelve a intentarlo más tarde |
| `npm run test:e2e` no encuentra el navegador | Instala Edge o Chrome, o define la ruta: `$env:BROWSER_PATH = "C:\ruta\chrome.exe"` |
| El puerto 3000 está ocupado | `npm run dev -- -p 3001` |
| No veo las peticiones del prefetch | En la pestaña Red, filtra por `pokeapi` y deja el cursor más de 75 ms sobre una tarjeta que no hayas visitado. Si ya la visitaste, sus datos siguen frescos y no se piden otra vez |
| Los datos no se actualizan | Es lo esperado durante 24 h. Recarga la página para vaciar la caché del cliente; la del servidor caduca a las 24 h |

## Créditos

Datos e imágenes de [PokéAPI](https://pokeapi.co) y su [repositorio de sprites](https://github.com/PokeAPI/sprites). Pokémon y sus nombres son marcas de Nintendo, Creatures Inc. y Game Freak. Proyecto académico sin fines comerciales.
