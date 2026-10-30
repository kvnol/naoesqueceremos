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
        writeUrl(pathname, merged);
        return merged;
      });
    },
    [pathname],
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

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4">
      <section className="relative flex min-h-0 flex-1 flex-col rounded-sm border border-[var(--line)] bg-[linear-gradient(180deg,rgba(20,20,22,0.9),rgba(11,11,12,0.4))] p-2 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
          <button
            type="button"
            onClick={() =>
              pushState({
                uf: "BR",
                cat: state.cat ?? "todos",
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
              cat: state.cat ?? "todos",
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
    </div>
  );
}
