"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { resolveMedia } from "@/lib/media";
import { Lightbox } from "./Lightbox";
import { EmptyState } from "./EmptyState";
import { SourceOnlyCard } from "./SourceOnlyCard";

interface ImageGridProps {
  items: ContentItem[];
  uf?: string;
}

export function ImageGrid({ items, uf }: ImageGridProps) {
  const [active, setActive] = useState<ContentItem | null>(null);

  if (items.length === 0) {
    return <EmptyState uf={uf} message="Nenhuma imagem neste recorte." />;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const media = resolveMedia("imagem", item.mediaUrl || item.thumbnailUrl);
          if (!media.playable || !media.mediaUrl) {
            return (
              <li key={item.id} className="sm:col-span-2">
                <SourceOnlyCard item={item} />
              </li>
            );
          }

          const display: ContentItem = {
            ...item,
            mediaUrl: media.mediaUrl,
            thumbnailUrl: media.thumbnailUrl || media.mediaUrl,
          };

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActive(display)}
                className="group flex w-full flex-col overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-muted)] text-left transition-colors hover:border-[var(--accent)]/50"
              >
                <div className="aspect-[4/3] overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={display.thumbnailUrl || display.mediaUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1 p-2.5">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--fg)]">
                    {item.title}
                  </p>
                  <p className="text-[14px] text-[var(--fg-subtle)]">
                    {formatDate(item.date)}
                    {item.credit ? ` · ${item.credit}` : ""}
                  </p>
                  {item.contributor && (
                    <p className="text-[14px] text-[var(--fg-subtle)]">
                      Contribuição de {item.contributor}
                    </p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <Lightbox item={active} onClose={() => setActive(null)} />
    </>
  );
}
