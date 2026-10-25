#!/usr/bin/env node
/**
 * Prueba en un navegador real (Edge o Chrome sin interfaz) usando el
 * Chrome DevTools Protocol, sin dependencias adicionales.
 *
 *   npm run test:e2e -- http://localhost:3000
 *
 * Observa el tráfico de red para demostrar:
 *  1. Hidratación: al cargar "/" el navegador NO vuelve a pedir la página 1.
 *  2. Prefetch de la página siguiente del catálogo.
 *  3. Prefetch por hover (onMouseEnter): /pokemon, /pokemon-species y /evolution-chain.
 *  4. Reutilización: al abrir el detalle no se repiten esas peticiones.
 *  5. Paginación, ausencia de errores en consola y diseño sin desbordes en móvil.
 *
 * Variable opcional: BROWSER_PATH con la ruta del ejecutable del navegador.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const outputDir = join(process.cwd(), "e2e-output");
const candidates = [
  process.env.BROWSER_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browserPath = candidates.find((path) => existsSync(path));
if (!browserPath) {
  console.error("No se encontró Edge ni Chrome. Define BROWSER_PATH.");
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let failures = 0;
const report = (ok, label, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const port = 9400 + Math.floor(Math.random() * 400);
const profile = join(tmpdir(), `pokedex-e2e-${port}`);
const browser = spawn(browserPath, ["--headless=new", `--remote-debugging-port=${port}`, "--disable-gpu", "--no-first-run", `--user-data-dir=${profile}`, "about:blank"], {
  stdio: "ignore",
});

let target;
for (let attempt = 0; attempt < 60 && !target; attempt++) {
  await sleep(250);
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
  } catch {
    /* el navegador aún no está listo */
  }
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener("open", resolve));
let nextId = 0;
const pending = new Map();
const requests = [];
const consoleErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message.result ?? {});
    pending.delete(message.id);
  } else if (message.method === "Network.requestWillBeSent") {
    requests.push(message.params.request.url);
  } else if (message.method === "Runtime.exceptionThrown") {
    consoleErrors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  } else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    consoleErrors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.value;
const waitFor = async (expression, timeout = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return true;
    await sleep(150);
  }
  return false;
};
const pokeApi = (fragment) => requests.filter((url) => url.startsWith("https://pokeapi.co/") && url.includes(fragment));
const centerOf = (selector) =>
  evaluate(`(() => { const el = document.querySelector('${selector}'); if (!el) return null; el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
const mouse = (type, point) => send("Input.dispatchMouseEvent", { type, x: point.x, y: point.y, button: "left", clickCount: type === "mouseMoved" ? 0 : 1 });

await send("Network.enable");
await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

try {
  // 1. Carga inicial e hidratación
  await send("Page.navigate", { url: `${baseUrl}/` });
  await waitFor(`document.readyState === 'complete' && document.querySelectorAll('[data-pokemon-id]').length >= 50`);
  await sleep(2500);
  const cardCount = await evaluate(`new Set([...document.querySelectorAll('[data-pokemon-id]')].map(a => a.dataset.pokemonId)).size`);
  report(cardCount >= 50, "La portada muestra al menos 50 Pokémon", `${cardCount} tarjetas`);
  const loadedImages = await evaluate(`[...document.querySelectorAll('[data-pokemon-id] img')].slice(0, 10).filter(img => img.complete && img.naturalWidth > 0).length`);
  report(loadedImages === 10, "Las imágenes de las primeras tarjetas se cargan", `${loadedImages}/10`);
  const page1Requests = requests.filter((url) => url.includes("/api/pokedex") && !url.includes("page=2"));
  report(page1Requests.length === 0, "Hidratación: el navegador no vuelve a pedir la página 1", `${page1Requests.length} peticiones`);
  report(pokeApi("").length === 0, "Al cargar no se hace ninguna petición a PokéAPI desde el navegador");
  report(requests.some((url) => url.includes("/api/pokedex?page=2")), "Se precarga la página 2 del catálogo");

  // 2. Prefetch por hover
  const card = await centerOf('[data-pokemon-id="4"]');
  await mouse("mouseMoved", card);
  await waitFor(`true`, 100);
  const hovered = await waitFor(`performance.getEntriesByType('resource').some(e => e.name.includes('evolution-chain'))`, 10000);
  await sleep(500);
  const hoverRequests = pokeApi("");
  report(pokeApi("/pokemon/4").length === 1, "Hover → prefetchQuery de /pokemon/4");
  report(pokeApi("/pokemon-species/4").length === 1, "Hover → prefetchQuery de /pokemon-species/4");
  report(hovered && pokeApi("/evolution-chain/").length === 1, "Hover → prefetchQuery de la cadena evolutiva");

  // Un segundo hover no repite peticiones (datos frescos durante 24 h)
  await mouse("mouseMoved", { x: 5, y: 5 });
  await sleep(200);
  await mouse("mouseMoved", await centerOf('[data-pokemon-id="4"]'));
  await sleep(1000);
  report(pokeApi("").length === hoverRequests.length, "Un segundo hover no repite peticiones");

  // 3. Navegación al detalle reutilizando la caché
  const before = pokeApi("").length;
  const point = await centerOf('[data-pokemon-id="4"]');
  await mouse("mousePressed", point);
  await mouse("mouseReleased", point);
  const opened = await waitFor(`location.pathname === '/pokemon/4' && document.querySelector('h1')?.textContent.includes('Charmander')`);
  await sleep(1500);
  report(opened, "Clic en la tarjeta abre /pokemon/4");
  report(pokeApi("").length === before, "El detalle reutiliza los datos precargados (0 peticiones nuevas a PokéAPI)");
  const detailText = await evaluate(`document.body.innerText`);
  report(["Estadísticas base", "Habilidades", "Charmeleon", "Charizard"].every((t) => detailText.includes(t)), "El detalle muestra estadísticas, habilidades y evoluciones");

  // 4. Navegación por la cadena evolutiva y vuelta al catálogo
  await mouse("mouseMoved", await centerOf('a[data-pokemon-id="5"]'));
  await sleep(1500);
  const evoPoint = await centerOf('a[data-pokemon-id="5"]');
  await mouse("mousePressed", evoPoint);
  await mouse("mouseReleased", evoPoint);
  report(await waitFor(`location.pathname === '/pokemon/5' && document.querySelector('h1')?.textContent.includes('Charmeleon')`), "Enlace de la cadena evolutiva abre /pokemon/5");

  // 5. Paginación (carga nueva de la portada)
  requests.length = 0;
  await send("Page.navigate", { url: `${baseUrl}/` });
  await waitFor(`document.querySelectorAll('[data-pokemon-id]').length >= 50`);
  await waitFor(`performance.getEntriesByType('resource').some(e => e.name.includes('/api/pokedex?page=2'))`);
  await sleep(500);
  const next = await centerOf('button[aria-label="Página siguiente"]');
  await mouse("mousePressed", next);
  await mouse("mouseReleased", next);
  const paged = await waitFor(`!!document.querySelector('[data-pokemon-id="51"]') && !document.querySelector('[data-pokemon-id="1"]')`);
  await sleep(800);
  report(paged, "El botón Siguiente muestra #0051–#0100");
  report(requests.filter((url) => url.includes("/api/pokedex?page=2")).length === 1, "La página 2 se sirvió desde la caché precargada (1 sola petición)");
  report((await evaluate(`location.search`)) === "?page=2", "La URL refleja la página actual", await evaluate(`location.search`));

  // 6. Búsqueda
  await evaluate(`(() => { const input = document.querySelector('input[type=search]'); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'eevee'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  report(await waitFor(`!!document.querySelector('[data-pokemon-id="133"]') && document.querySelectorAll('[data-pokemon-id]').length === 1`), "La búsqueda 'eevee' muestra solo a Eevee");

  // 7. Responsive
  mkdirSync(outputDir, { recursive: true });
  for (const [label, width, height, path] of [
    ["escritorio-catalogo", 1366, 900, "/"],
    ["movil-catalogo", 390, 844, "/"],
    ["movil-detalle", 390, 844, "/pokemon/133"],
    ["escritorio-detalle", 1366, 900, "/pokemon/133"],
  ]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await send("Page.navigate", { url: baseUrl + path });
    await waitFor(`document.readyState === 'complete'`);
    await sleep(2500);
    const overflow = await evaluate(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
    report(overflow <= 0, `Sin desbordamiento horizontal: ${label} (${width}px)`, `${overflow}px`);
    const fullHeight = Math.min(await evaluate(`document.documentElement.scrollHeight`), 4000);
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: fullHeight, scale: 1 } });
    writeFileSync(join(outputDir, `${label}.jpg`), Buffer.from(shot.data, "base64"));
  }

  report(consoleErrors.length === 0, "Sin errores en la consola del navegador", consoleErrors.slice(0, 3).join(" | "));
} finally {
  socket.close();
  browser.kill();
  await sleep(500);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* el perfil temporal puede seguir bloqueado unos instantes en Windows */
  }
}

console.log(failures === 0 ? "\nTodas las comprobaciones pasaron." : `\n${failures} comprobación(es) fallaron.`);
console.log(`Capturas en: ${outputDir}`);
process.exit(failures === 0 ? 0 : 1);
