import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas unitarias: sin red (las peticiones se simulan).
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` solo es válido dentro de Next.js; en las pruebas se sustituye por un módulo vacío.
      "server-only": fileURLToPath(new URL("./tests/support/empty-module.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
