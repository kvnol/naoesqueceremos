import Link from "next/link";

interface EmptyStateProps {
  uf?: string;
  message?: string;
}

export function EmptyState({
  uf,
  message = "Ainda não há registros publicados para este recorte.",
}: EmptyStateProps) {
  const href = uf ? `/sugerir?uf=${uf}` : "/sugerir";

  return (
    <div className="flex flex-col items-start gap-4 rounded-sm border border-dashed border-[var(--line)] bg-[var(--bg-muted)]/40 px-5 py-8">
      <p className="max-w-prose text-sm leading-relaxed text-[var(--fg-muted)]">
        {message}
      </p>
      <Link
        href={href}
        className="inline-flex rounded-sm border border-[var(--accent)]/60 bg-[var(--accent)]/15 px-3 py-2 text-sm text-[var(--accent-soft)] transition-colors hover:bg-[var(--accent)]/25"
      >
        Sugerir conteúdo{uf ? " para este estado" : ""}
      </Link>
    </div>
  );
}
