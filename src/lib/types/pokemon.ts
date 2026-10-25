/**
 * Modelos de dominio: versiones compactas de los datos de PokéAPI.
 * Son los que se guardan en la caché de TanStack Query y los que viajan
 * del servidor al cliente durante la hidratación.
 */
import type { PokemonTypeName } from "@/lib/constants";

/** Elemento del catálogo. La imagen se deriva del id en el cliente. */
export interface PokemonListItem {
  id: number;
  name: string;
  types: PokemonTypeName[];
}

export interface PokedexQuery {
  page: number;
  type: PokemonTypeName | null;
  search: string;
}

export interface PokedexPage {
  items: PokemonListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonSprite {
  label: string;
  url: string;
  pixelated: boolean;
}

/** Datos de /pokemon/{id} reducidos a lo que muestra la interfaz. */
export interface PokemonDetail {
  id: number;
  name: string;
  speciesId: number;
  /** Altura en decímetros y peso en hectogramos (unidades de PokéAPI). */
  height: number;
  weight: number;
  baseExperience: number | null;
  types: PokemonTypeName[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  artworkUrl: string | null;
  sprites: PokemonSprite[];
}

/** Datos de /pokemon-species/{id} reducidos. */
export interface PokemonSpecies {
  id: number;
  name: string;
  displayName: string;
  genus: string | null;
  description: string | null;
  evolutionChainId: number | null;
  generation: string;
  habitat: string | null;
  captureRate: number;
  isLegendary: boolean;
  isMythical: boolean;
}

/** Nodo de la cadena evolutiva (árbol: puede tener varias ramas). */
export interface EvolutionNode {
  id: number;
  name: string;
  /** Condición para llegar a esta etapa; `null` en la forma base. */
  condition: string | null;
  evolvesTo: EvolutionNode[];
}
