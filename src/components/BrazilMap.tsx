"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BRAZIL_MAP_VIEWBOX, BRAZIL_STATE_PATHS } from "@/data/brazil-paths";
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.35;

const [VB_X, VB_Y, VB_W, VB_H] = BRAZIL_MAP_VIEWBOX.split(" ").map(Number) as [
  number,
  number,
  number,
  number,
];
const CX = VB_X + VB_W / 2;
const CY = VB_Y + VB_H / 2;

interface Transform {
  scale: number;
  /** deslocamento em coordenadas do SVG */
  x: number;
  y: number;
}

const INITIAL: Transform = { scale: 1, x: 0, y: 0 };

function clampZoom(scale: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(scale.toFixed(3))));
}

export function BrazilMap({
  counts,
  selectedUf,
  onSelect,
  className,
}: BrazilMapProps) {
  const [hovered, setHovered] = useState<UfCode | null>(null);
  const [transform, setTransform] = useState<Transform>(INITIAL);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const max = useMemo(
    () => Math.max(1, ...MAP_UFS.map((uf) => counts[uf] ?? 0)),
    [counts],
  );

  const tipUf = hovered ?? (selectedUf && selectedUf !== "BR" ? selectedUf : null);
  const tipCount = tipUf ? (counts[tipUf] ?? 0) : 0;
  const canZoomOut = transform.scale > MIN_ZOOM + 0.001;
  const canZoomIn = transform.scale < MAX_ZOOM - 0.001;
  const isZoomed = transform.scale > 1.001 || Math.abs(transform.x) > 0.5 || Math.abs(transform.y) > 0.5;

  /** Converte ponto da tela → coordenadas do viewBox SVG */
  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: CX, y: CY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: CX, y: CY };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  const zoomToward = useCallback(
    (nextScaleRaw: number, focusSvgX?: number, focusSvgY?: number) => {
      setTransform((prev) => {
        const scale = clampZoom(nextScaleRaw);
        if (Math.abs(scale - prev.scale) < 0.001) return prev;
        if (scale === 1) return INITIAL;

        const fx = focusSvgX ?? CX;
        const fy = focusSvgY ?? CY;
        // Ponto sob o cursor no espaço do mapa (antes do zoom)
        const mapX = (fx - CX - prev.x) / prev.scale + CX;
        const mapY = (fy - CY - prev.y) / prev.scale + CY;
        // Mantém esse ponto sob o cursor após o zoom
        const x = fx - CX - (mapX - CX) * scale;
        const y = fy - CY - (mapY - CY) * scale;
        return { scale, x, y };
      });
    },
    [],
  );

  const zoomBy = useCallback(
    (delta: number, clientX?: number, clientY?: number) => {
      const prev = transformRef.current;
      const focus =
        clientX != null && clientY != null
          ? clientToSvg(clientX, clientY)
          : { x: CX, y: CY };
      zoomToward(prev.scale + delta, focus.x, focus.y);
    },
    [clientToSvg, zoomToward],
  );

  const resetZoom = useCallback(() => setTransform(INITIAL), []);

  // Wheel com { passive: false } para poder preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const direction = e.deltaY > 0 ? -ZOOM_STEP * 0.6 : ZOOM_STEP * 0.6;
      zoomBy(direction, e.clientX, e.clientY);
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    if (transformRef.current.scale <= 1.001) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: transformRef.current.x,
      origY: transformRef.current.y,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const svg = svgRef.current;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const dxScreen = e.clientX - drag.startClientX;
    const dyScreen = e.clientY - drag.startClientY;
    if (Math.hypot(dxScreen, dyScreen) > 5) drag.moved = true;

    // Converte deslocamento da tela para unidades do viewBox
    const scaleScreen = ctm.a; // approx uniform scale
    const dx = dxScreen / scaleScreen;
    const dy = dyScreen / scaleScreen;

    setTransform((prev) => ({
      ...prev,
      x: drag.origX + dx,
      y: drag.origY + dy,
    }));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.moved) suppressClickRef.current = true;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onKeyDownPath(
    e: React.KeyboardEvent<SVGPathElement>,
    uf: UfCode,
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(uf);
    }
  }

  function handleStateClick(uf: UfCode) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelect(uf);
  }

  const groupTransform = `translate(${CX + transform.x} ${CY + transform.y}) scale(${transform.scale}) translate(${-CX} ${-CY})`;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden outline-none",
        className,
      )}
      aria-label="Mapa do Brasil. Use a roda do mouse ou os botões + e − para ampliar."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          zoomBy(ZOOM_STEP);
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          zoomBy(-ZOOM_STEP);
        } else if (e.key === "0") {
          e.preventDefault();
          resetZoom();
        }
      }}
    >
      <svg
        ref={svgRef}
        viewBox={BRAZIL_MAP_VIEWBOX}
        role="img"
        aria-label="Mapa do Brasil com estados clicáveis"
        className={cn(
          "mx-auto h-full max-h-[min(82dvh,920px)] w-full touch-none select-none overflow-hidden",
          isZoomed ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        )}
      >
        <title>Mapa interativo do Brasil</title>
        <g transform={groupTransform}>
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
                fill={countToFill(count, max)}
                tabIndex={0}
                role="button"
                aria-label={`${getStateName(uf)}: ${pluralize(count, "registro", "registros")}`}
                aria-pressed={selected}
                onMouseEnter={() => setHovered(uf)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(uf)}
                onBlur={() => setHovered(null)}
                onClick={() => handleStateClick(uf)}
                onKeyDown={(e) => onKeyDownPath(e, uf)}
              />
            );
          })}
        </g>
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
            Scroll para zoom · arraste com zoom ativo
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label="Controles de zoom do mapa"
        className="absolute bottom-3 right-3 z-10 flex flex-col overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-elevated)]/95 shadow-lg backdrop-blur-sm"
      >
        <button
          type="button"
          aria-label="Aproximar mapa"
          disabled={!canZoomIn}
          onClick={() => zoomToward(transform.scale + ZOOM_STEP)}
          className="flex h-9 w-9 items-center justify-center text-lg leading-none text-[var(--fg)] transition-colors hover:bg-[var(--bg-muted)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Afastar mapa"
          disabled={!canZoomOut}
          onClick={() => zoomToward(transform.scale - ZOOM_STEP)}
          className="flex h-9 w-9 items-center justify-center border-t border-[var(--line)] text-lg leading-none text-[var(--fg)] transition-colors hover:bg-[var(--bg-muted)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Redefinir zoom"
          disabled={!isZoomed}
          onClick={resetZoom}
          className="flex h-9 w-9 items-center justify-center border-t border-[var(--line)] text-[10px] font-medium uppercase tracking-wide text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-35"
          title="Redefinir zoom"
        >
          1:1
        </button>
      </div>
    </div>
  );
}
