"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getStateName } from "@/lib/states";
import { pluralize } from "@/lib/format";
import {
  CATEGORY_LABELS,
  THEME_TAGS,
  type Category,
  type CategoryCounts,
  type ContentItem,
  type SortOrder,
  type UfCode,
} from "@/lib/types";
import { CategoryTabs } from "./CategoryTabs";
import { ItemCard } from "./ItemCard";
import { ImageGrid } from "./ImageGrid";
import { AudioPlayerList } from "./AudioPlayer";
import { VideoEmbedList } from "./VideoEmbed";
import { EmptyState } from "./EmptyState";
import { CopyLinkButton } from "./CopyLinkButton";
import { DateFilter } from "./DateFilter";
import { Timeline } from "./Timeline";
import { SuggestLink } from "./SuggestLink";
import { cn } from "@/lib/cn";

interface StateDrawerProps {
  open: boolean;
  uf: UfCode | null;
  category: Category;
  counts: CategoryCounts;
  items: ContentItem[];
  query: string;
  tag: string | null;
  sort: SortOrder;
  dateFrom: string | null;
  dateTo: string | null;
  availableYears: number[];
  sharePath: string;
  yearHistogram: { year: number; count: number }[];
  selectedYear: number | null;
  onDateChange: (next: { from: string | null; to: string | null }) => void;
  onSelectYear: (year: number | null) => void;
  onClose: () => void;
  onCategoryChange: (category: Category) => void;
  onQueryChange: (query: string) => void;
  onTagChange: (tag: string | null) => void;
  onSortChange: (sort: SortOrder) => void;
}

export function StateDrawer({
  open,
  uf,
  category,
  counts,
  items,
  query,
  tag,
  sort,
  dateFrom,
  dateTo,
  availableYears,
  sharePath,
  yearHistogram,
  selectedYear,
  onDateChange,
  onSelectYear,
  onClose,
  onCategoryChange,
  onQueryChange,
  onTagChange,
  onSortChange,
}: StateDrawerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const filteredByCategory = useMemo(
    () => items.filter((i) => i.category === category),
    [items, category],
  );

  const name = uf ? getStateName(uf) : "";

  return (
    <AnimatePresence>
      {open && uf && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar painel"
            className="fixed inset-0 z-40 bg-black/55"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "fixed z-50 flex flex-col bg-[var(--bg-panel)] shadow-[var(--shadow-panel)]",
              "inset-x-0 bottom-0 h-[92dvh] rounded-t-lg border-t border-[var(--line)]",
              "md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-full md:max-w-xl md:rounded-none md:border-l md:border-t-0",
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            style={{ willChange: "transform, opacity" }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
                  {uf === "BR" ? "Âmbito nacional" : uf}
                </p>
                <h2
                  id={titleId}
                  className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--fg)]"
                >
                  {name}
                </h2>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  {pluralize(counts.total, "registro", "registros")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CopyLinkButton path={sharePath} />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="rounded-sm border border-[var(--line)] px-2.5 py-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <DateFilter
                from={dateFrom}
                to={dateTo}
                years={availableYears}
                onChange={onDateChange}
              />

              <Timeline
                data={yearHistogram}
                selectedYear={selectedYear}
                onSelectYear={onSelectYear}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative min-w-0 flex-1 text-sm">
                  <span className="sr-only">Buscar neste estado</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Buscar título, descrição, tags…"
                    className="w-full rounded-sm border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
                  Ordenar
                  <select
                    value={sort}
                    onChange={(e) =>
                      onSortChange(e.target.value as SortOrder)
                    }
                    className="rounded-sm border border-[var(--line)] bg-[var(--bg-muted)] px-2 py-2 text-sm text-[var(--fg)]"
                  >
                    <option value="recentes">Mais recentes</option>
                    <option value="antigos">Mais antigos</option>
                  </select>
                </label>
              </div>

              <div
                role="group"
                aria-label="Filtrar por tema"
                className="flex flex-wrap gap-1.5"
              >
                {THEME_TAGS.map((t) => {
                  const selected = tag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onTagChange(selected ? null : t)}
                      className={cn(
                        "rounded-sm border px-2 py-1 text-[11px] transition-colors",
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent-soft)]"
                          : "border-[var(--line)] text-[var(--fg-subtle)] hover:text-[var(--fg)]",
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <CategoryTabs
                counts={counts}
                active={category}
                onChange={onCategoryChange}
              />

              <div
                role="tabpanel"
                id={`panel-${category}`}
                aria-labelledby={`tab-${category}`}
                className="pt-1"
              >
                {filteredByCategory.length === 0 ? (
                  <EmptyState
                    uf={uf}
                    message={`Nenhum item em ${CATEGORY_LABELS[category].toLowerCase()} para este recorte.`}
                  />
                ) : category === "noticia" ? (
                  <ul>
                    {filteredByCategory.map((item) => (
                      <li key={item.id}>
                        <ItemCard item={item} />
                      </li>
                    ))}
                  </ul>
                ) : category === "imagem" ? (
                  <ImageGrid items={filteredByCategory} uf={uf} />
                ) : category === "audio" ? (
                  <AudioPlayerList items={filteredByCategory} uf={uf} />
                ) : (
                  <VideoEmbedList items={filteredByCategory} uf={uf} />
                )}
              </div>

              <p className="pb-4 text-center text-xs text-[var(--fg-subtle)]">
                Conteúdo ausente?{" "}
                <SuggestLink
                  uf={uf}
                  className="text-[var(--accent-soft)] underline-offset-2 hover:underline"
                >
                  Sugerir para {uf === "BR" ? "o Brasil" : getStateName(uf)}
                </SuggestLink>
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
