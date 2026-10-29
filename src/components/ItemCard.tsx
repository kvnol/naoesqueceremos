import type { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface ItemCardProps {
  item: ContentItem;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <article className="border-b border-[var(--line)] py-4 last:border-b-0">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-[var(--fg-subtle)]">
        <time dateTime={item.date}>{formatDate(item.date)}</time>
        <span aria-hidden>·</span>
        <span>{item.sourceName}</span>
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-lg leading-snug text-[var(--fg)]">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
        {item.description}
      </p>
      {item.tags && item.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Temas">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm bg-[var(--bg-muted)] px-2 py-0.5 text-[11px] text-[var(--fg-subtle)]"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent-soft)] underline-offset-2 hover:underline"
        >
          Fonte original
        </a>
        {item.archiveUrl && (
          <a
            href={item.archiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--fg-muted)] underline-offset-2 hover:underline"
          >
            Arquivo
          </a>
        )}
      </div>
    </article>
  );
}
