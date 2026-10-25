/**
 * Tipos de las respuestas de PokéAPI (https://pokeapi.co/docs/v2).
 *
 * Son tipos PARCIALES: solo declaran los campos que la aplicación usa.
 * PokéAPI devuelve muchos más (por ejemplo, `moves` en /pokemon, que ocupa
 * la mayor parte de la respuesta), pero se descartan al transformar los
 * datos a los modelos de dominio de `pokemon.ts`.
 */

export interface NamedApiResource {
  name: string;
  url: string;
}

export interface NamedApiResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface ApiPokemonType {
  slot: number;
  type: NamedApiResource;
}

export interface ApiPokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedApiResource;
}

export interface ApiPokemonAbility {
  ability: NamedApiResource;
  is_hidden: boolean;
  slot: number;
}

export interface ApiPokemonSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  other?: {
    "official-artwork"?: { front_default: string | null; front_shiny: string | null };
    home?: { front_default: string | null; front_shiny: string | null };
  };
}

/** GET /pokemon/{id} */
export interface ApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: ApiPokemonType[];
  stats: ApiPokemonStat[];
  abilities: ApiPokemonAbility[];
  sprites: ApiPokemonSprites;
  species: NamedApiResource;
}

export interface ApiName {
  name: string;
  language: NamedApiResource;
}

export interface ApiFlavorText {
  flavor_text: string;
  language: NamedApiResource;
  version: NamedApiResource;
}

export interface ApiGenus {
  genus: string;
  language: NamedApiResource;
}

/** GET /pokemon-species/{id} */
export interface ApiPokemonSpecies {
  id: number;
  name: string;
  names: ApiName[];
  genera: ApiGenus[];
  flavor_text_entries: ApiFlavorText[];
  evolution_chain: { url: string } | null;
  generation: NamedApiResource;
  habitat: NamedApiResource | null;
  color: NamedApiResource;
  capture_rate: number;
  is_legendary: boolean;
  is_mythical: boolean;
}

export interface ApiEvolutionDetail {
  trigger: NamedApiResource | null;
  min_level: number | null;
  item: NamedApiResource | null;
  held_item: NamedApiResource | null;
  min_happiness: number | null;
  min_affection: number | null;
  known_move: NamedApiResource | null;
  time_of_day: string;
  location: NamedApiResource | null;
}

export interface ApiChainLink {
  species: NamedApiResource;
  evolution_details: ApiEvolutionDetail[];
  evolves_to: ApiChainLink[];
}

/** GET /evolution-chain/{id} */
export interface ApiEvolutionChain {
  id: number;
  chain: ApiChainLink;
}

/** GET /type/{name} */
export interface ApiType {
  name: string;
  pokemon: { slot: number; pokemon: NamedApiResource }[];
}
