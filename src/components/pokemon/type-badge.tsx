import type { PokemonTypeName } from "@/lib/constants";
import { TYPE_META } from "@/lib/utils/type-meta";

export function TypeBadge({ type, size = "sm" }: { type: PokemonTypeName; size?: "sm" | "md" }) {
  const meta = TYPE_META[type];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide ${
        size === "md" ? "px-3.5 py-1 text-sm" : "px-2.5 py-0.5 text-xs"
      }`}
      style={{ backgroundColor: meta.background, color: meta.foreground }}
    >
      {meta.label}
    </span>
  );
}

export function TypeList({ types, size }: { types: PokemonTypeName[]; size?: "sm" | "md" }) {
  if (types.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tipos">
      {types.map((type) => (
        <li key={type}>
          <TypeBadge type={type} size={size} />
        </li>
      ))}
    </ul>
  );
}
