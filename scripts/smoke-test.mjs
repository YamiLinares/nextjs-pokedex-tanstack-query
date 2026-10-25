#!/usr/bin/env node
/**
 * Prueba HTTP contra un servidor en ejecución.
 *   npm run test:smoke -- http://localhost:3000
 *
 * Verifica códigos de estado, contenido renderizado en el servidor, datos
 * deshidratados (HydrationBoundary) en el HTML y la Route Handler.
 */
const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

let failures = 0;
const report = (ok, label, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

async function get(path) {
  const response = await fetch(baseUrl + path, { redirect: "manual" });
  return { response, body: await response.text() };
}

const uniqueIds = (html) => new Set([...html.matchAll(/data-pokemon-id="(\d+)"/g)].map((m) => Number(m[1])));
// Los datos deshidratados viajan dentro del payload RSC del HTML con comillas escapadas.
const hasDehydrated = (html, key) => html.includes(`\\"queryKey\\":[\\"${key}\\"`);

// Portada
{
  const { response, body } = await get("/");
  const ids = uniqueIds(body);
  report(response.status === 200, "/ → 200", String(response.status));
  report(ids.size >= 50, `/ renderiza al menos 50 Pokémon desde el servidor`, `${ids.size} tarjetas`);
  report(ids.has(1) && ids.has(50), "  incluye #0001 y #0050");
  report(/official-artwork%2F\d+\.png/.test(body), "  las tarjetas usan la ilustración oficial (next/image)");
  report(hasDehydrated(body, "pokedex"), "  el HTML contiene la consulta deshidratada [\"pokedex\", …]");
  report(body.includes("Bulbasaur") && body.includes("Planta"), "  nombre y tipo renderizados (Bulbasaur, Planta)");
}

// Paginación y filtros desde la URL
{
  const { body } = await get("/?page=2");
  const ids = uniqueIds(body);
  report(ids.has(51) && ids.has(100) && !ids.has(1), "/?page=2 muestra #0051–#0100", `${ids.size} tarjetas`);
}
{
  const { body } = await get("/?type=fire&q=char");
  const ids = uniqueIds(body);
  report(ids.has(4) && ids.has(6) && !ids.has(1), "/?type=fire&q=char filtra (Charmander…Charizard)", [...ids].join(","));
}

// Route Handler
{
  const { response, body } = await get("/api/pokedex?page=2");
  const json = JSON.parse(body);
  report(response.status === 200, "/api/pokedex?page=2 → 200");
  report(json.items?.length === 50 && json.items[0].id === 51, "  50 elementos compactos desde #0051");
  report((response.headers.get("cache-control") ?? "").includes("max-age=86400"), "  Cache-Control de 24 h", response.headers.get("cache-control"));
  report(Object.keys(json.items[0]).sort().join() === "id,name,types", "  cada elemento solo tiene id, nombre y tipos");
}

// Detalle
{
  const { response, body } = await get("/pokemon/25");
  report(response.status === 200, "/pokemon/25 → 200");
  for (const text of ["Pikachu", "Estadísticas base", "Habilidades", "Cadena evolutiva", "Pichu", "Raichu", "Sprites", "Eléctrico"]) {
    report(body.includes(text), `  contiene "${text}"`);
  }
  for (const key of ["pokemon", "pokemon-species", "evolution-chain"]) {
    report(hasDehydrated(body, key), `  consulta deshidratada [\"${key}\", …]`);
  }
  report(!body.includes("\\\"moves\\\""), "  no se transfiere la lista cruda de movimientos", `${Math.round(body.length / 1024)} KB de HTML`);
}
{
  const { body } = await get("/pokemon/133");
  const branches = ["Vaporeon", "Jolteon", "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Sylveon"];
  report(branches.every((name) => body.includes(name)), "/pokemon/133 muestra las 8 evoluciones de Eevee");
}
{
  const { body } = await get("/pokemon/132");
  report(body.includes("no evoluciona"), "/pokemon/132 (Ditto) indica que no evoluciona");
}

// 404
for (const path of ["/pokemon/0", "/pokemon/1026", "/pokemon/abc", "/pokemon/25abc", "/ruta-inexistente"]) {
  const { response, body } = await get(path);
  report(response.status === 404 && body.includes("Pokémon no encontrado"), `${path} → 404`, String(response.status));
}

console.log(failures === 0 ? "\nTodas las comprobaciones pasaron." : `\n${failures} comprobación(es) fallaron.`);
process.exit(failures === 0 ? 0 : 1);
