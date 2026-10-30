"use client";

import { useMemo, useState } from "react";
import { BRAZIL_MAP_VIEWBOX, BRAZIL_STATE_PATHS } from "@/data/brazil-paths";
import { MAP_UFS, getStateName } from "@/lib/states";
import type { UfCode } from "@/lib/types";
import { countToFill } from "@/lib/intensity";
import { formatCount, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { isModifiedClick } from "@/lib/links";
import { statePath } from "@/lib/url-state";

interface BrazilMapProps {
  counts: Partial<Record<UfCode, number>>;
  selectedUf: UfCode | null;
  onSelect: (uf: UfCode) => void;
  className?: string;
}

export function BrazilMap({
  counts,
  selectedUf,
  onSelect,
  className,
}: BrazilMapProps) {
  const [hovered, setHovered] = useState<UfCode | null>(null);
  const max = useMemo(
    () => Math.max(1, ...MAP_UFS.map((uf) => counts[uf] ?? 0)),
    [counts],
  );

  const tipUf = hovered ?? (selectedUf && selectedUf !== "BR" ? selectedUf : null);
  const tipCount = tipUf ? (counts[tipUf] ?? 0) : 0;

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox={BRAZIL_MAP_VIEWBOX}
        role="group"
        aria-label="Mapa do Brasil: escolha um estado"
        className="mx-auto h-full max-h-[min(82dvh,920px)] w-full max-w-[980px]"
      >
        <title>Mapa interativo do Brasil</title>
        {MAP_UFS.map((uf) => {
          const d = BRAZIL_STATE_PATHS[uf];
          if (!d) return null;
          const count = counts[uf] ?? 0;
          const selected = selectedUf === uf;
          return (
            // Link real para rastreadores e "abrir em nova aba";
            // clique simples abre o painel sem recarregar a página.
            <a
              key={uf}
              href={statePath(uf)}
              aria-label={`${getStateName(uf)}: ${pluralize(count, "registro", "registros")}`}
              aria-current={selected ? "page" : undefined}
              className="map-link"
              onMouseEnter={() => setHovered(uf)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(uf)}
              onBlur={() => setHovered(null)}
              onClick={(e) => {
                if (isModifiedClick(e)) return;
                e.preventDefault();
                onSelect(uf);
              }}
            >
              <path
                id={`state-${uf}`}
                d={d}
                className="map-state"
                fill={countToFill(count, max)}
              />
            </a>
          );
        })}
      </svg>

      <div
        aria-live="polite"
        className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-sm border border-[var(--line)] bg-[var(--bg-elevated)]/95 px-3 py-1.5 text-center text-sm shadow-lg backdrop-blur-sm"
      >
        {tipUf ? (
          <>
            <span className="font-medium text-[var(--fg)]">
              {getStateName(tipUf)}
            </span>
            <span className="mx-2 text-[var(--fg-subtle)]">·</span>
            <span className="tabular-nums text-[var(--accent-soft)]">
              {formatCount(tipCount)}
            </span>
          </>
        ) : (
          <span className="text-[var(--fg-muted)]">
            Passe o mouse ou use Tab nos estados
          </span>
        )}
      </div>
    </div>
  );
}
