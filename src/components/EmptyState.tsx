import { SuggestLink } from "./SuggestLink";
import type { UfCode } from "@/lib/types";

interface EmptyStateProps {
  uf?: UfCode | string;
  message?: string;
}

export function EmptyState({
  uf,
  message = "Ainda não há registros publicados para este recorte.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-sm border border-dashed border-[var(--line)] bg-[var(--bg-muted)]/40 px-5 py-8">
      <p className="max-w-prose text-sm leading-relaxed text-[var(--fg-muted)]">
        {message}
      </p>
      <SuggestLink
        uf={uf}
        className="inline-flex rounded-sm border border-[var(--accent)]/60 bg-[var(--accent)]/15 px-3 py-2 text-sm text-[var(--accent-soft)] transition-colors hover:bg-[var(--accent)]/25"
      >
        Sugerir conteúdo{uf ? " para este estado" : ""}
      </SuggestLink>
    </div>
  );
}
