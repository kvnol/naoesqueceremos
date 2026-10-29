"use client";

import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
  type CategoryCounts,
} from "@/lib/types";

interface CategoryTabsProps {
  counts: CategoryCounts;
  active: Category | null;
  onChange: (category: Category) => void;
}

export function CategoryTabs({ counts, active, onChange }: CategoryTabsProps) {
  const current = active ?? "noticia";

  return (
    <div
      role="tablist"
      aria-label="Categorias de conteúdo"
      className="flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px"
    >
      {CATEGORIES.map((category) => {
        const selected = current === category;
        const count = counts[category];
        return (
          <button
            key={category}
            type="button"
            role="tab"
            id={`tab-${category}`}
            aria-selected={selected}
            aria-controls={`panel-${category}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(category)}
            className={cn(
              "relative shrink-0 rounded-t-sm px-3 py-2.5 text-sm transition-colors",
              selected
                ? "text-[var(--fg)]"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
            )}
          >
            <span className="font-medium">{CATEGORY_LABELS[category]}</span>
            <span
              className={cn(
                "ml-2 inline-flex min-w-[1.25rem] justify-center rounded-sm px-1.5 py-0.5 text-[11px] tabular-nums",
                selected
                  ? "bg-[var(--accent)]/25 text-[var(--accent-soft)]"
                  : "bg-[var(--bg-muted)] text-[var(--fg-subtle)]",
              )}
            >
              {formatCount(count)}
            </span>
            {selected && (
              <span
                aria-hidden
                className="absolute inset-x-2 -bottom-px h-0.5 bg-[var(--accent)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
