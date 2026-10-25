/**
 * Transformación de la cadena evolutiva de PokéAPI.
 *
 * La respuesta es un árbol anidado (`chain.evolves_to[].evolves_to[]...`)
 * de profundidad y anchura variables: Pichu → Pikachu → Raichu es lineal,
 * pero Eevee tiene ocho ramas y Wurmple se divide en dos.
 * Aquí se valida la estructura (es un dato externo) y se convierte en un
 * árbol compacto de `EvolutionNode`.
 */
import type { ApiChainLink, ApiEvolutionDetail } from "@/lib/types/pokeapi";
import type { EvolutionNode } from "@/lib/types/pokemon";
import { formatName } from "@/lib/utils/format";
import { idFromResourceUrl } from "@/lib/utils/ids";

export class InvalidEvolutionChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidEvolutionChainError";
  }
}

const MAX_DEPTH = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNamedResource(value: unknown): value is { name: string; url: string } {
  return isRecord(value) && typeof value.name === "string" && typeof value.url === "string";
}

function assertChainLink(value: unknown, depth: number): asserts value is ApiChainLink {
  if (depth > MAX_DEPTH) throw new InvalidEvolutionChainError("La cadena evolutiva es demasiado profunda.");
  if (!isRecord(value) || !isNamedResource(value.species)) {
    throw new InvalidEvolutionChainError("Eslabón sin especie válida.");
  }
  if (!Array.isArray(value.evolves_to) || !Array.isArray(value.evolution_details)) {
    throw new InvalidEvolutionChainError(`Eslabón incompleto: ${value.species.name}.`);
  }
}

/** Describe en español la condición de evolución más relevante. */
export function describeEvolution(details: ApiEvolutionDetail[] | undefined): string | null {
  const detail = details?.[0];
  if (!detail) return null;

  const parts: string[] = [];
  const trigger = detail.trigger?.name;

  if (trigger === "trade") parts.push("Intercambio");
  if (trigger === "use-item" && detail.item) parts.push(`Usar ${formatName(detail.item.name)}`);
  if (detail.min_level) parts.push(`Nivel ${detail.min_level}`);
  if (detail.held_item) parts.push(`Con ${formatName(detail.held_item.name)}`);
  if (detail.min_happiness) parts.push("Amistad alta");
  if (detail.min_affection) parts.push("Afecto alto");
  if (detail.known_move) parts.push(`Conocer ${formatName(detail.known_move.name)}`);
  if (detail.time_of_day === "day") parts.push("de día");
  if (detail.time_of_day === "night") parts.push("de noche");
  if (detail.location) parts.push(`en ${formatName(detail.location.name)}`);

  if (parts.length === 0 && trigger === "level-up") parts.push("Subir de nivel");
  if (parts.length === 0) return trigger ? formatName(trigger) : null;
  return parts.join(" · ");
}

function toNode(link: unknown, depth: number, isRoot: boolean): EvolutionNode {
  assertChainLink(link, depth);
  const id = idFromResourceUrl(link.species.url);
  if (id === null) throw new InvalidEvolutionChainError(`URL de especie inválida: ${link.species.url}`);

  return {
    id,
    name: link.species.name,
    condition: isRoot ? null : describeEvolution(link.evolution_details),
    evolvesTo: link.evolves_to.map((child) => toNode(child, depth + 1, false)),
  };
}

/** Valida y convierte la respuesta de /evolution-chain/{id}. */
export function parseEvolutionChain(response: unknown): EvolutionNode {
  if (!isRecord(response) || !("chain" in response)) {
    throw new InvalidEvolutionChainError("Respuesta sin la propiedad `chain`.");
  }
  return toNode(response.chain, 0, true);
}

/** Recorre el árbol en profundidad y devuelve todas las especies. */
export function flattenEvolution(node: EvolutionNode): EvolutionNode[] {
  return [node, ...node.evolvesTo.flatMap(flattenEvolution)];
}
