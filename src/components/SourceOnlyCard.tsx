import type { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface SourceOnlyCardProps {
  item: ContentItem;
  reason?: string;
}

/** Fallback quando a mídia não pode ser embutida. */
export function SourceOnlyCard({
  item,
  reason = "Mídia não disponível para visualização embutida.",
}: SourceOnlyCardProps) {
  return (
    <article className="rounded-sm border border-[var(--line)] bg-[var(--bg-muted)]/40 p-4">
      <div className="mb-1 flex flex-wrap gap-x-2 text-xs text-[var(--fg-subtle)]">
        <time dateTime={item.date}>{formatDate(item.date)}</time>
        <span aria-hidden>·</span>
        <span>{item.sourceName}</span>
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--fg)]">
        {item.title}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--fg-muted)]">{item.description}</p>
      <p className="mt-2 text-xs text-[var(--fg-subtle)]">{reason}</p>
      {item.contributor && (
        <p className="mt-2 text-xs text-[var(--fg-subtle)]">
          Contribuição de {item.contributor}
        </p>
      )}
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex rounded-sm border border-[var(--accent)]/50 bg-[var(--accent)]/15 px-3 py-1.5 text-sm text-[var(--accent-soft)] hover:bg-[var(--accent)]/25"
      >
        Ver na fonte original
      </a>
    </article>
  );
}
