import type { PokemonTypeName } from "@/lib/constants";

interface TypeMeta {
  label: string;
  /** Color de fondo de la insignia y color de texto con contraste suficiente. */
  background: string;
  foreground: string;
}

export const TYPE_META: Record<PokemonTypeName, TypeMeta> = {
  normal: { label: "Normal", background: "#a8a77a", foreground: "#1b1b12" },
  fire: { label: "Fuego", background: "#e8622a", foreground: "#ffffff" },
  water: { label: "Agua", background: "#3b7dd8", foreground: "#ffffff" },
  grass: { label: "Planta", background: "#5aa83c", foreground: "#0f230a" },
  electric: { label: "Eléctrico", background: "#f2c71b", foreground: "#2b2200" },
  ice: { label: "Hielo", background: "#7ccfcb", foreground: "#0b2a29" },
  fighting: { label: "Lucha", background: "#b8322b", foreground: "#ffffff" },
  poison: { label: "Veneno", background: "#9a46a0", foreground: "#ffffff" },
  ground: { label: "Tierra", background: "#d6b65c", foreground: "#2b2208" },
  flying: { label: "Volador", background: "#8e9ff0", foreground: "#141a3a" },
  psychic: { label: "Psíquico", background: "#ee4f84", foreground: "#ffffff" },
  bug: { label: "Bicho", background: "#98ac1f", foreground: "#1b2004" },
  rock: { label: "Roca", background: "#b39d3e", foreground: "#211c06" },
  ghost: { label: "Fantasma", background: "#6a5797", foreground: "#ffffff" },
  dragon: { label: "Dragón", background: "#6a3cf0", foreground: "#ffffff" },
  dark: { label: "Siniestro", background: "#5a4a3f", foreground: "#ffffff" },
  steel: { label: "Acero", background: "#9fa2bd", foreground: "#15172a" },
  fairy: { label: "Hada", background: "#e595c8", foreground: "#3a0f2a" },
};
