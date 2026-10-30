import Link from "next/link";
import { getCountsByUf } from "@/lib/content";
import { formatCount } from "@/lib/format";
import { STATES } from "@/lib/states";
import type { ContentItem, UfCode } from "@/lib/types";
import { statePath } from "@/lib/url-state";
import { cn } from "@/lib/cn";

interface StateIndexProps {
  items: ContentItem[];
  currentUf?: UfCode | null;
}

/** Lista de estados em HTML simples: navegação sem o mapa e links para rastreadores. */
export function StateIndex({ items, currentUf = null }: StateIndexProps) {
  const counts = getCountsByUf(items);
  const ordered = [...STATES].sort((a, b) =>
    a.uf === "BR" ? -1 : b.uf === "BR" ? 1 : a.name.localeCompare(b.name, "pt-BR"),
  );

  return (
    <nav
      aria-labelledby="state-index-title"
      className="mx-auto w-full max-w-[1600px] px-3 pb-6 sm:px-5"
    >
      <h2
        id="state-index-title"
        className="mb-3 font-[family-name:var(--font-display)] text-lg text-[var(--fg)]"
      >
        Registros por estado
      </h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-5">
        {ordered.map((s) => (
          <li key={s.uf}>
            <Link
              href={statePath(s.uf)}
              aria-current={currentUf === s.uf ? "page" : undefined}
              className={cn(
                "flex justify-between gap-2 rounded-sm px-2 py-1 transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]",
                currentUf === s.uf
                  ? "text-[var(--accent-soft)]"
                  : "text-[var(--fg-muted)]",
              )}
            >
              <span className="truncate">{s.name}</span>
              <span className="tabular-nums text-[var(--fg-subtle)]">
                {formatCount(counts[s.uf] ?? 0)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
