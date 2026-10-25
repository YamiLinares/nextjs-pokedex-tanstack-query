import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const body = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const heading = Outfit({ variable: "--font-heading", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Pokédex Nexus — Explora el mundo Pokémon",
    template: "%s · Pokédex Nexus",
  },
  description:
    "Pokédex con datos reales de PokéAPI: busca, filtra por tipo y consulta estadísticas, habilidades y cadenas evolutivas.",
};

export const viewport: Viewport = {
  themeColor: "#e3350d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${body.variable} ${heading.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenido"
          className="sr-only z-50 rounded-lg bg-navy-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <QueryProvider>
          <SiteHeader />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
