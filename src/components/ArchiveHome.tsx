"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BrazilMap } from "./BrazilMap";
import { StateDrawer } from "./StateDrawer";
import {
  getCategoryCounts,
  getCountsByUf,
  getItems,
} from "@/lib/content";
import {
  archiveStateToSharePath,
  buildArchiveSearchParams,
  parseArchiveParams,
  type ArchiveUrlState,
} from "@/lib/url-state";
import type {
  CategoryTab,
  ContentItem,
  ContentPayload,
  SortOrder,
  UfCode,
} from "@/lib/types";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/cn";
import { COUNT_BUCKETS } from "@/lib/intensity";

interface ArchiveHomeProps {
  payload: ContentPayload;
}

function writeUrl(pathname: string, state: ArchiveUrlState) {
  const params = buildArchiveSearchParams(state);
  const qs = params.toString();
  const url = qs ? `${pathname}?${qs}` : pathname;
  window.history.replaceState(window.history.state, "", url);
}

export function ArchiveHome({ payload }: ArchiveHomeProps) {
  const { items: allItems } = payload;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onMapRoute = pathname === "/";

  const [state, setState] = useState<ArchiveUrlState>(() =>
    parseArchiveParams(searchParams),
  );

  useEffect(() => {
    function onPopState() {
      setState(parseArchiveParams(new URLSearchParams(window.location.search)));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const pushState = useCallback(
    (patch: Partial<ArchiveUrlState>) => {
      setState((prev) => {
        const merged = { ...prev, ...patch };
        if (onMapRoute) writeUrl("/", merged);
        return merged;
      });
    },
    [onMapRoute],
  );

  const mapCounts = useMemo(
    () => getCountsByUf(allItems, { sort: state.ordem }),
    [allItems, state.ordem],
  );
  const nationalCount = mapCounts.BR ?? 0;

  const drawerItems = useMemo(() => {
    if (!state.uf) return [] as ContentItem[];
    return getItems(allItems, {
      uf: state.uf,
      query: state.q ?? undefined,
      tag: state.tag ?? undefined,
      sort: state.ordem,
    });
  }, [allItems, state.uf, state.q, state.tag, state.ordem]);

  const drawerCounts = useMemo(() => {
    if (!state.uf) {
      return { noticia: 0, imagem: 0, audio: 0, video: 0, total: 0 };
    }
    return getCategoryCounts(allItems, {
      uf: state.uf,
      query: state.q ?? undefined,
      tag: state.tag ?? undefined,
    });
  }, [allItems, state.uf, state.q, state.tag]);

  const activeCategory: CategoryTab = state.cat ?? "todos";
  const sharePath = archiveStateToSharePath(state);

  const openUf = (uf: UfCode) =>
    pushState({
      uf,
      cat: state.cat ?? "todos",
    });

  return (
    <>
      <BrazilMap
        counts={mapCounts}
        selectedUf={state.uf}
        onSelect={openUf}
      />

      <div className="pointer-events-none fixed inset-x-0 top-16 z-20 flex justify-center px-3 sm:top-[4.25rem]">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-sm border border-[var(--line)] bg-[var(--bg-elevated)]/90 px-2 py-1.5 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => openUf("BR")}
            aria-pressed={state.uf === "BR"}
            className={cn(
              "rounded-sm border px-3 py-1.5 text-sm transition-colors",
              state.uf === "BR"
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]",
            )}
          >
            Brasil (nacional)
            <span className="ml-2 tabular-nums text-[var(--fg-subtle)]">
              {formatCount(nationalCount)}
            </span>
          </button>
          <span className="hidden h-4 w-px bg-[var(--line)] sm:block" aria-hidden />
          <div
            className="flex flex-wrap items-center gap-2 px-1 text-[12px] text-[var(--fg-muted)]"
            aria-label="Legenda"
          >
            {COUNT_BUCKETS.map((b) => (
              <span key={b.bucket} className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-[2px] border border-[var(--line)]"
                  style={{ background: b.fill }}
                  aria-hidden
                />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <StateDrawer
        open={onMapRoute && !!state.uf}
        uf={state.uf}
        category={activeCategory}
        counts={drawerCounts}
        items={drawerItems}
        query={state.q ?? ""}
        tag={state.tag}
        sort={state.ordem}
        sharePath={sharePath}
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
    </>
  );
}
