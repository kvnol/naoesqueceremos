"use client";

import { useState } from "react";
import {
  BRAZIL_STATE_PATHS,
  WORLD_LOCKED_PATHS,
  WORLD_MAP_VIEWBOX,
} from "@/data/world-map-paths";
import { MAP_UFS, getStateName } from "@/lib/states";
import type { UfCode } from "@/lib/types";
import { countToFill } from "@/lib/intensity";
import { formatCount, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";

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

  const tipUf =
    hovered ?? (selectedUf && selectedUf !== "BR" ? selectedUf : null);
  const tipCount = tipUf ? (counts[tipUf] ?? 0) : 0;

  const mapTitle = tipUf
    ? `${getStateName(tipUf)} (${tipUf}) — ${pluralize(tipCount, "registro", "registros")}`
    : "Só o Brasil é focado";

  function onKeyDown(e: React.KeyboardEvent<SVGPathElement>, uf: UfCode) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(uf);
    }
  }

  return (
    <div
      className={cn("map-stage bg-[var(--map-ocean)]", className)}
    >
      <svg
        viewBox={WORLD_MAP_VIEWBOX}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={mapTitle}
        className="h-full w-full"
      >
        <title>{mapTitle}</title>
        <rect width="100%" height="100%" fill="var(--map-ocean)" />

        <g aria-hidden="true">
          {WORLD_LOCKED_PATHS.map((d, i) => (
            <path key={i} d={d} className="map-country-locked" />
          ))}
        </g>

        <g>
          {MAP_UFS.map((uf) => {
            const d = BRAZIL_STATE_PATHS[uf];
            if (!d) return null;
            const count = counts[uf] ?? 0;
            const selected = selectedUf === uf;
            return (
              <path
                key={uf}
                id={`state-${uf}`}
                d={d}
                className="map-state"
                fill={countToFill(count)}
                tabIndex={0}
                role="button"
                aria-label={`${getStateName(uf)}: ${pluralize(count, "registro", "registros")}`}
                aria-pressed={selected}
                onMouseEnter={() => setHovered(uf)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(uf)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelect(uf)}
                onKeyDown={(e) => onKeyDown(e, uf)}
              />
            );
          })}
        </g>
      </svg>

      <div
        aria-live="polite"
        className="pointer-events-none absolute bottom-16 left-3 z-10 max-w-[240px] rounded-sm border border-[var(--line)] bg-[var(--bg-elevated)]/95 px-2.5 py-1.5 text-[15px] shadow-md sm:bottom-14 sm:left-5"
      >
        {tipUf ? (
          <>
            <span className="font-medium text-[var(--fg)]">
              {getStateName(tipUf)}
            </span>
            <span className="text-[var(--fg-subtle)]"> ({tipUf})</span>
            <span className="mx-1.5 text-[var(--fg-subtle)]">·</span>
            <span className="tabular-nums text-[var(--accent)]">
              {formatCount(tipCount)}
            </span>
          </>
        ) : (
          <span className="text-[var(--fg-muted)]">
            Clique em um estado do Brasil
          </span>
        )}
      </div>
    </div>
  );
}
