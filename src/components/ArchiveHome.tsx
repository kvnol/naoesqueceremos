"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrazilMap } from "./BrazilMap";
import { StateDrawer } from "./StateDrawer";
import {
  getCategoryCounts,
  getCountsByUf,
  getItems,
} from "@/lib/content";
import {
  archiveStateToSharePath,
  parseArchiveLocation,
  statePath,
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
import { isModifiedClick } from "@/lib/links";
import { HOME_TITLE, fullPageTitle, stateTitle } from "@/lib/site";

interface ArchiveHomeProps {
  payload: ContentPayload;
  /** UF da rota (/estado/:uf); null na home. */
  initialUf: UfCode | null;
}

function readLocation(): ArchiveUrlState {
  return parseArchiveLocation(window.location.pathname, window.location.search);
}

/**
 * Troca de estado vira uma entrada no histórico (voltar fecha o painel);
 * filtros só substituem a URL atual.
 */
function writeUrl(state: ArchiveUrlState, mode: "push" | "replace") {
  const url = archiveStateToSharePath(state);
  const current = window.location.pathname + window.location.search;
  if (url === current) return;
  if (mode === "push") window.history.pushState(window.history.state, "", url);
  else window.history.replaceState(window.history.state, "", url);
}

export function ArchiveHome({ payload, initialUf }: ArchiveHomeProps) {
  const { items: allItems } = payload;

  // Render inicial só com a UF da rota, igual ao HTML estático gerado no servidor;
  // filtros da query entram depois da hidratação.
  const [state, setState] = useState<ArchiveUrlState>({
    uf: initialUf,
    cat: null,
    q: null,
    tag: null,
    ordem: "recentes",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com a URL após hidratar
    setState(readLocation());
    function onPopState() {
      setState(readLocation());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // O título da aba acompanha o estado aberto (troca sem navegação do Next)
  useEffect(() => {
    document.title = fullPageTitle(state.uf ? stateTitle(state.uf) : HOME_TITLE);
  }, [state.uf]);

  const pushState = useCallback((patch: Partial<ArchiveUrlState>) => {
    setState((prev) => {
      const merged = { ...prev, ...patch };
      writeUrl(merged, merged.uf !== prev.uf ? "push" : "replace");
      return merged;
    });
  }, []);

  const selectUf = useCallback(
    (uf: UfCode) => pushState({ uf, cat: state.cat ?? "todos" }),
    [pushState, state.cat],
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
          <a
            href={statePath("BR")}
            onClick={(e) => {
              if (isModifiedClick(e)) return;
              e.preventDefault();
              selectUf("BR");
            }}
            aria-current={state.uf === "BR" ? "page" : undefined}
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
          </a>
          <p className="text-xs text-[var(--fg-subtle)]">
            Clique em um estado · intensidade = quantidade
          </p>
        </div>

        <BrazilMap
          className="min-h-0 flex-1"
          counts={mapCounts}
          selectedUf={state.uf}
          onSelect={selectUf}
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
