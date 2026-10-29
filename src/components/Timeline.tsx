"use client";

import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";

interface TimelineProps {
  data: { year: number; count: number }[];
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  className?: string;
}

export function Timeline({
  data,
  selectedYear,
  onSelectYear,
  className,
}: TimelineProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className={cn("w-full", className)}>
      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--fg-subtle)]">
        Linha do tempo
      </p>
      <div
        role="listbox"
        aria-label="Filtrar por ano na linha do tempo"
        className="flex h-16 items-end gap-1 sm:gap-1.5"
      >
        {data.map(({ year, count }) => {
          const height = count === 0 ? 4 : Math.max(8, Math.round((count / max) * 52));
          const selected = selectedYear === year;
          return (
            <button
              key={year}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={`${year}: ${formatCount(count)} registros`}
              title={`${year}: ${formatCount(count)}`}
              disabled={count === 0}
              onClick={() => onSelectYear(selected ? null : year)}
              className={cn(
                "group flex min-w-0 flex-1 flex-col items-center gap-1 disabled:cursor-not-allowed disabled:opacity-35",
              )}
            >
              <span
                className={cn(
                  "w-full rounded-t-sm transition-colors",
                  selected
                    ? "bg-[var(--accent-soft)]"
                    : "bg-[var(--accent)]/55 group-hover:bg-[var(--accent)]",
                )}
                style={{ height }}
              />
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  selected ? "text-[var(--accent-soft)]" : "text-[var(--fg-subtle)]",
                )}
              >
                {String(year).slice(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
