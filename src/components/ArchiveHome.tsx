"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BrazilMap } from "./BrazilMap";
import { StateDrawer } from "./StateDrawer";
import {
  getCategoryCounts,
  getCountsByUf,
  getItems,
  getYearHistogram,
} from "@/lib/content";
import {
  archiveStateToSharePath,
  buildArchiveSearchParams,
  parseArchiveParams,
} from "@/lib/url-state";
import type { Category, SortOrder, UfCode } from "@/lib/types";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ArchiveHome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const state = useMemo(
    () => parseArchiveParams(searchParams),
    [searchParams],
  );

  const pushState = useCallback(
    (patch: Partial<typeof state>) => {
      const merged = { ...state, ...patch };
      const params = buildArchiveSearchParams(merged);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, state],
  );

  const dateFilters = useMemo(
    () => ({
      from: state.de ?? undefined,
      to: state.ate ?? undefined,
      sort: state.ordem,
    }),
    [state.de, state.ate, state.ordem],
  );

  const mapCounts = useMemo(
    () => getCountsByUf(dateFilters),
    [dateFilters],
  );
  const nationalCount = mapCounts.BR ?? 0;

  const drawerItems = useMemo(() => {
    if (!state.uf) return [];
    return getItems({
      uf: state.uf,
      from: state.de ?? undefined,
      to: state.ate ?? undefined,
      query: state.q ?? undefined,
      tag: state.tag ?? undefined,
      sort: state.ordem,
    });
  }, [state.uf, state.de, state.ate, state.q, state.tag, state.ordem]);

  const drawerCounts = useMemo(() => {
    if (!state.uf) {
      return { noticia: 0, imagem: 0, audio: 0, video: 0, total: 0 };
    }
    return getCategoryCounts({
      uf: state.uf,
      from: state.de ?? undefined,
      to: state.ate ?? undefined,
      query: state.q ?? undefined,
      tag: state.tag ?? undefined,
    });
  }, [state.uf, state.de, state.ate, state.q, state.tag]);

  const yearHistogram = useMemo(() => {
    if (!state.uf) return [];
    return getYearHistogram({
      uf: state.uf,
      query: state.q ?? undefined,
      tag: state.tag ?? undefined,
    });
  }, [state.uf, state.q, state.tag]);

  const selectedYear =
    state.de &&
    state.ate &&
    state.de.slice(0, 4) === state.ate.slice(0, 4) &&
    state.de.endsWith("-01-01") &&
    state.ate.endsWith("-12-31")
      ? Number(state.de.slice(0, 4))
      : null;

  const activeCategory: Category = state.cat ?? "noticia";
  const sharePath = archiveStateToSharePath(state);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4">
      <section className="relative flex min-h-0 flex-1 flex-col rounded-sm border border-[var(--line)] bg-[linear-gradient(180deg,rgba(20,20,22,0.9),rgba(11,11,12,0.4))] p-2 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
          <button
            type="button"
            onClick={() =>
              pushState({
                uf: "BR",
                cat: state.cat ?? "noticia",
              })
            }
            aria-pressed={state.uf === "BR"}
            className={cn(
              "rounded-sm border px-3 py-2 text-sm transition-colors",
              state.uf === "BR"
                ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent-soft)]"
                : "border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--fg)]",
            )}
          >
            Brasil (nacional)
            <span className="ml-2 tabular-nums text-[var(--fg-subtle)]">
              {formatCount(nationalCount)}
            </span>
          </button>
          <p className="text-xs text-[var(--fg-subtle)]">
            Clique em um estado · intensidade = quantidade
          </p>
        </div>

        <BrazilMap
          className="min-h-0 flex-1"
          counts={mapCounts}
          selectedUf={state.uf}
          onSelect={(uf: UfCode) =>
            pushState({
              uf,
              cat: state.cat ?? "noticia",
            })
          }
        />
      </section>

      <StateDrawer
        open={!!state.uf}
        uf={state.uf}
        category={activeCategory}
        counts={drawerCounts}
        items={drawerItems}
        query={state.q ?? ""}
        tag={state.tag}
        sort={state.ordem}
        dateFrom={state.de}
        dateTo={state.ate}
        sharePath={sharePath}
        yearHistogram={yearHistogram}
        selectedYear={selectedYear}
        onDateChange={({ from, to }) => pushState({ de: from, ate: to })}
        onSelectYear={(year) => {
          if (year === null) pushState({ de: null, ate: null });
          else
            pushState({
              de: `${year}-01-01`,
              ate: `${year}-12-31`,
            });
        }}
        onClose={() =>
          pushState({
            uf: null,
            cat: null,
            q: null,
            tag: null,
          })
        }
        onCategoryChange={(cat) => pushState({ cat })}
        onQueryChange={(q) => pushState({ q: q || null })}
        onTagChange={(tag) => pushState({ tag })}
        onSortChange={(ordem: SortOrder) => pushState({ ordem })}
      />
    </div>
  );
}
