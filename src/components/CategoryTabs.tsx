"use client";

import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";
import {
  CATEGORY_TAB_LABELS,
  CATEGORY_TABS,
  type CategoryCounts,
  type CategoryTab,
} from "@/lib/types";

interface CategoryTabsProps {
  counts: CategoryCounts;
  active: CategoryTab | null;
  onChange: (category: CategoryTab) => void;
}

export function CategoryTabs({ counts, active, onChange }: CategoryTabsProps) {
  const current = active ?? "todos";

  return (
    <div
      role="tablist"
      aria-label="Categorias de conteúdo"
      className="flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px"
    >
      {CATEGORY_TABS.map((category) => {
        const selected = current === category;
        const count =
          category === "todos" ? counts.total : counts[category];
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
            <span className="font-medium">{CATEGORY_TAB_LABELS[category]}</span>
            <span
              className={cn(
                "ml-2 inline-flex min-w-[1.25rem] justify-center rounded-sm px-1.5 py-0.5 text-[14px] tabular-nums",
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
