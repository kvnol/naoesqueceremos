"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { isSocialEmbed, resolveMedia, type MediaKind } from "@/lib/media";
import { EmptyState } from "./EmptyState";
import { SourceOnlyCard } from "./SourceOnlyCard";
import { cn } from "@/lib/cn";

interface VideoEmbedProps {
  items: ContentItem[];
  uf?: string;
}

function providerAccent(kind: MediaKind): string {
  switch (kind) {
    case "youtube":
      return "from-red-950/80 to-black/40";
    case "twitter":
      return "from-sky-950/80 to-black/40";
    case "instagram":
      return "from-fuchsia-950/70 to-amber-950/40";
    default:
      return "from-black/70 to-black/20";
  }
}

function VideoCard({ item }: { item: ContentItem }) {
  const [loaded, setLoaded] = useState(false);
  const media = resolveMedia("video", item.mediaUrl || item.sourceUrl);

  if (!media.playable || !media.embedUrl) {
    return (
      <SourceOnlyCard
        item={item}
        reason="Não foi possível embutir este vídeo. Abra a fonte original para assistir (YouTube, X/Twitter ou Instagram)."
      />
    );
  }

  const social = isSocialEmbed(media.kind);
  const label = media.providerLabel ?? "Vídeo";

  return (
    <article className="overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-muted)]/40">
      <div
        className={cn(
          "relative bg-black/50",
          social
            ? "min-h-[420px] w-full sm:min-h-[520px]"
            : "aspect-video",
        )}
      >
        {!loaded && (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t p-4 text-center",
              providerAccent(media.kind),
            )}
            aria-label={`Reproduzir em ${label}: ${item.title}`}
          >
            {(item.thumbnailUrl || media.thumbnailUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnailUrl || media.thumbnailUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="relative z-10 rounded-sm border border-white/20 bg-black/40 px-2 py-0.5 text-[14px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              {label}
            </span>
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent-soft)]/70 bg-[var(--accent)]/80 text-xl text-white shadow-lg">
              ▶
            </span>
            <span className="relative z-10 max-w-[16rem] text-sm text-[var(--fg)]">
              Clique para carregar o player
            </span>
            <span className="relative z-10 max-w-[18rem] text-[14px] text-[var(--fg-subtle)]">
              {social
                ? "O embed oficial da rede será aberto neste painel"
                : "O vídeo será carregado sob demanda"}
            </span>
          </button>
        )}
        {loaded && (
          <iframe
            src={media.embedUrl}
            title={item.title}
            className={cn(
              "w-full border-0 bg-black",
              social
                ? "absolute inset-0 h-full min-h-[420px]"
                : "absolute inset-0 h-full",
            )}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--fg-subtle)]">
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          <span aria-hidden>·</span>
          <span>{item.sourceName}</span>
          {media.providerLabel && (
            <>
              <span aria-hidden>·</span>
              <span className="text-[var(--accent-soft)]">{media.providerLabel}</span>
            </>
          )}
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--fg)]">
          {item.title}
        </h3>
        <p className="text-sm text-[var(--fg-muted)]">{item.description}</p>
        {item.contributor && (
          <p className="text-xs text-[var(--fg-subtle)]">
            Contribuição de {item.contributor}
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={item.mediaUrl || item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--accent-soft)] underline-offset-2 hover:underline"
          >
            Abrir no {label}
          </a>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--fg-muted)] underline-offset-2 hover:underline"
          >
            Fonte original
          </a>
        </div>
      </div>
    </article>
  );
}

export function VideoEmbedList({ items, uf }: VideoEmbedProps) {
  if (items.length === 0) {
    return <EmptyState uf={uf} message="Nenhum vídeo neste recorte." />;
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <VideoCard item={item} />
        </li>
      ))}
    </ul>
  );
}
