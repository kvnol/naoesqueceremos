"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { getEmbedUrl } from "@/lib/media";
import { EmptyState } from "./EmptyState";

interface VideoEmbedProps {
  items: ContentItem[];
  uf?: string;
}

function VideoCard({ item }: { item: ContentItem }) {
  const [loaded, setLoaded] = useState(false);
  const embed = getEmbedUrl(item.mediaUrl || item.sourceUrl);

  return (
    <article className="overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-muted)]/40">
      <div className="relative aspect-video bg-black/50">
        {!loaded && (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-black/20"
            aria-label={`Carregar vídeo: ${item.title}`}
          >
            {item.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnailUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60"
                loading="lazy"
              />
            )}
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent-soft)]/70 bg-[var(--accent)]/80 text-xl text-white">
              ▶
            </span>
            <span className="relative z-10 text-xs text-[var(--fg-muted)]">
              Carregar vídeo
            </span>
          </button>
        )}
        {loaded && embed && (
          <iframe
            src={embed}
            title={item.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
        {loaded && !embed && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-[var(--fg-muted)]">
            Não foi possível incorporar este vídeo.{" "}
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-[var(--accent-soft)] underline"
            >
              Abrir fonte
            </a>
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <div className="text-xs text-[var(--fg-subtle)]">
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          <span aria-hidden> · </span>
          <span>{item.sourceName}</span>
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--fg)]">
          {item.title}
        </h3>
        <p className="text-sm text-[var(--fg-muted)]">{item.description}</p>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-[var(--accent-soft)] underline-offset-2 hover:underline"
        >
          Fonte original
        </a>
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
