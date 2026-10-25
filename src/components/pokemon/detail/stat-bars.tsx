import type { PokemonStat } from "@/lib/types/pokemon";
import { statLabel } from "@/lib/utils/format";

/** Valor máximo de una estadística base en los juegos principales. */
const MAX_BASE_STAT = 255;

export function StatBars({ stats }: { stats: PokemonStat[] }) {
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <dl className="space-y-3">
      {stats.map((stat) => {
        const percent = Math.min(100, Math.round((stat.value / MAX_BASE_STAT) * 100));
        return (
          <div key={stat.name} className="grid grid-cols-[110px_40px_1fr] items-center gap-3">
            <dt className="text-sm font-medium text-ink-muted">{statLabel(stat.name)}</dt>
            <dd className="text-right font-mono text-sm font-semibold text-navy-900">{stat.value}</dd>
            <dd aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-canvas">
              <div
                className={`h-full rounded-full ${stat.value >= 100 ? "bg-emerald-500" : stat.value >= 60 ? "bg-amber-400" : "bg-poke-500"}`}
                style={{ width: `${percent}%` }}
              />
            </dd>
          </div>
        );
      })}
      <div className="grid grid-cols-[110px_40px_1fr] items-center gap-3 border-t border-line pt-3">
        <dt className="text-sm font-semibold text-navy-900">Total</dt>
        <dd className="text-right font-mono text-sm font-bold text-navy-900">{total}</dd>
      </div>
    </dl>
  );
}
