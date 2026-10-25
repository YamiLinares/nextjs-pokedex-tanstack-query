/** Utilidades de formato para mostrar datos de PokéAPI en español. */

/** `mr-mime` → `Mr Mime`, `nidoran-f` → `Nidoran F`. */
export function formatName(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** 25 → `#0025` */
export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

/** Decímetros → metros. */
export function formatHeight(decimeters: number): string {
  return `${(decimeters / 10).toLocaleString("es", { maximumFractionDigits: 1 })} m`;
}

/** Hectogramos → kilogramos. */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toLocaleString("es", { maximumFractionDigits: 1 })} kg`;
}

const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. especial",
  "special-defense": "Def. especial",
  speed: "Velocidad",
};

export function statLabel(stat: string): string {
  return STAT_LABELS[stat] ?? formatName(stat);
}

const GENERATION_LABELS: Record<string, string> = {
  "generation-i": "Generación I",
  "generation-ii": "Generación II",
  "generation-iii": "Generación III",
  "generation-iv": "Generación IV",
  "generation-v": "Generación V",
  "generation-vi": "Generación VI",
  "generation-vii": "Generación VII",
  "generation-viii": "Generación VIII",
  "generation-ix": "Generación IX",
};

export function generationLabel(generation: string): string {
  return GENERATION_LABELS[generation] ?? formatName(generation);
}

/** Limpia los saltos de línea y caracteres de control de las descripciones de PokéAPI. */
export function cleanFlavorText(text: string): string {
  return text.replace(/[\f\n\r­]+/g, " ").replace(/\s+/g, " ").trim();
}

const HABITAT_LABELS: Record<string, string> = {
  cave: "Cueva",
  forest: "Bosque",
  grassland: "Pradera",
  mountain: "Montaña",
  rare: "Raro",
  "rough-terrain": "Terreno escarpado",
  sea: "Mar",
  urban: "Urbano",
  "waters-edge": "Orilla del agua",
};

export function habitatLabel(habitat: string): string {
  return HABITAT_LABELS[habitat] ?? formatName(habitat);
}
