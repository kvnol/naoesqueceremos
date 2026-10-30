"use client";

import type { ContentItem } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { ItemCard } from "./ItemCard";
import { ImageGrid } from "./ImageGrid";
import { AudioPlayerList } from "./AudioPlayer";
import { VideoEmbedList } from "./VideoEmbed";
import { EmptyState } from "./EmptyState";

interface AllItemsFeedProps {
  items: ContentItem[];
  uf?: string;
}

/**
 * Lista unificada: cada item usa o mesmo componente da sua categoria.
 */
export function AllItemsFeed({ items, uf }: AllItemsFeedProps) {
  if (items.length === 0) {
    return (
      <EmptyState uf={uf} message="Nenhum registro neste recorte." />
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[var(--fg-subtle)]">
            {CATEGORY_LABELS[item.category]}
          </p>
          {item.category === "noticia" ? (
            <div className="border-t border-[var(--line)]">
              <ItemCard item={item} />
            </div>
          ) : item.category === "imagem" ? (
            <ImageGrid items={[item]} uf={uf} />
          ) : item.category === "audio" ? (
            <AudioPlayerList items={[item]} uf={uf} />
          ) : (
            <VideoEmbedList items={[item]} uf={uf} />
          )}
        </li>
      ))}
    </ul>
  );
}
