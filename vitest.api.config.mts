import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas de integración contra la PokéAPI real (requieren conexión a internet).
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/support/empty-module.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/api/**/*.test.ts"],
    environment: "node",
    testTimeout: 60_000,
  },
});
