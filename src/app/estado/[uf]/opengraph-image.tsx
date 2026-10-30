import { ImageResponse } from "next/og";
import { BRAZIL_MAP_VIEWBOX, BRAZIL_STATE_PATHS } from "@/data/brazil-paths";
import { getItems } from "@/lib/content";
import { pluralize } from "@/lib/format";
import { loadContent } from "@/lib/load-content";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { MAP_UFS, STATES, getStateName } from "@/lib/states";
import type { UfCode } from "@/lib/types";
import { ufFromSlug } from "@/lib/url-state";

export const alt = `Mapa do Brasil com o estado em destaque — ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

export function generateStaticParams() {
  return STATES.map((s) => ({ uf: s.uf.toLowerCase() }));
}

/** SVG do mapa como data URI; no nacional, todos os estados ficam em destaque. */
function mapDataUri(uf: UfCode): string {
  const paths = MAP_UFS.map((code) => {
    const on = uf === "BR" || code === uf;
    return `<path d="${BRAZIL_STATE_PATHS[code]}" fill="${on ? "#c45c26" : "#1c1c1f"}" stroke="${on ? "#e8a05c" : "#2f2f34"}" stroke-width="${on ? 2 : 1}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAZIL_MAP_VIEWBOX}">${paths}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function StateOpengraphImage({
  params,
}: {
  params: Promise<{ uf: string }>;
}) {
  const uf = ufFromSlug((await params).uf) ?? "BR";
  const { items } = await loadContent();
  const total = getItems(items, { uf }).length;
  const name = uf === "BR" ? "Brasil" : getStateName(uf);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0b0b0c",
          borderLeft: "16px solid #c45c26",
          color: "#f2efe8",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 660,
            padding: "64px 0 64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#e8a05c",
            }}
          >
            {SITE_NAME}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                fontSize: name.length > 14 ? 64 : 84,
                lineHeight: 1.05,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", fontSize: 40, color: "#e8a05c" }}>
              {uf === "BR"
                ? `${pluralize(total, "registro", "registros")} nacionais`
                : pluralize(total, "registro", "registros")}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.3,
              color: "#a39e94",
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <img src={mapDataUri(uf)} width={470} height={505} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
