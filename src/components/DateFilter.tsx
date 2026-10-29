"use client";

import { cn } from "@/lib/cn";

const YEARS = Array.from({ length: 11 }, (_, i) => 2016 + i);

interface DateFilterProps {
  from: string | null;
  to: string | null;
  onChange: (next: { from: string | null; to: string | null }) => void;
  className?: string;
}

export function DateFilter({ from, to, onChange, className }: DateFilterProps) {
  const activeYear =
    from && to && from.slice(0, 4) === to.slice(0, 4) && from.endsWith("-01-01") && to.endsWith("-12-31")
      ? Number(from.slice(0, 4))
      : null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs text-[var(--fg-muted)]">
          De
          <input
            type="date"
            value={from ?? ""}
            min="2016-01-01"
            max="2026-12-31"
            onChange={(e) =>
              onChange({ from: e.target.value || null, to })
            }
            className="rounded-sm border border-[var(--line)] bg-[var(--bg-muted)] px-2 py-1.5 text-sm text-[var(--fg)]"
          />
        </label>
        <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs text-[var(--fg-muted)]">
          Até
          <input
            type="date"
            value={to ?? ""}
            min="2016-01-01"
            max="2026-12-31"
            onChange={(e) =>
              onChange({ from, to: e.target.value || null })
            }
            className="rounded-sm border border-[var(--line)] bg-[var(--bg-muted)] px-2 py-1.5 text-sm text-[var(--fg)]"
          />
        </label>
        {(from || to) && (
          <button
            type="button"
            onClick={() => onChange({ from: null, to: null })}
            className="rounded-sm px-2 py-1.5 text-xs text-[var(--fg-muted)] underline-offset-2 hover:text-[var(--fg)] hover:underline"
          >
            Limpar datas
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Atalhos por ano"
        className="flex flex-wrap gap-1.5"
      >
        {YEARS.map((year) => {
          const selected = activeYear === year;
          return (
            <button
              key={year}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (selected) {
                  onChange({ from: null, to: null });
                } else {
                  onChange({
                    from: `${year}-01-01`,
                    to: `${year}-12-31`,
                  });
                }
              }}
              className={cn(
                "rounded-sm border px-2 py-1 text-xs transition-colors",
                selected
                  ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent-soft)]"
                  : "border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--fg-subtle)] hover:text-[var(--fg)]",
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
