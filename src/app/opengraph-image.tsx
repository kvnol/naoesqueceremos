import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0b0b0c",
          borderLeft: "16px solid #c45c26",
          color: "#f2efe8",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#e8a05c",
          }}
        >
          Arquivo de memória política · Brasil
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 84 }}>
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              lineHeight: 1.3,
              color: "#a39e94",
              maxWidth: 940,
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6f6a62" }}>
          Notícias, imagens, áudios e vídeos por estado · fontes verificáveis
        </div>
      </div>
    ),
    size,
  );
}
