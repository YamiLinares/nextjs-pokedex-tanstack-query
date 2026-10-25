import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Se usa el modelo de caché clásico de `fetch` (next.revalidate) en lugar
  // de Cache Components: la caché del servidor (24 h por petición a PokéAPI)
  // y la de TanStack Query en el cliente quedan separadas y explícitas.
  cacheComponents: false,
  images: {
    // Sprites e ilustraciones oficiales del repositorio de PokéAPI.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
    // Las imágenes optimizadas se reutilizan durante 24 h.
    minimumCacheTTL: 86400,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
