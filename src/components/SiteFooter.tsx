import { SuggestLink } from "./SuggestLink";
import { formatDate } from "@/lib/format";

interface SiteFooterProps {
  updatedAt?: string | null;
  source?: "sheet" | "fallback";
}

export function SiteFooter({ updatedAt, source }: SiteFooterProps) {
  let updatedLabel: string | null = null;
  if (updatedAt) {
    const d = new Date(updatedAt);
    if (!Number.isNaN(d.getTime())) {
      updatedLabel = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    }
  }

  return (
    <footer className="border-t border-[var(--line)] px-4 py-3 text-center text-xs text-[var(--fg-subtle)] sm:px-6">
      <p>
        Lembranças para 2030 · arquivo colaborativo · todo conteúdo exige fonte
        verificável
        {updatedLabel ? (
          <>
            {" · "}
            Atualizado em {updatedLabel}
            {source === "fallback" ? " (dados locais)" : ""}
          </>
        ) : null}
      </p>
      <p className="mt-1">
        <SuggestLink className="text-[var(--accent-soft)] underline-offset-2 hover:underline">
          Sugerir conteúdo
        </SuggestLink>
        {updatedAt ? (
          <span className="sr-only">
            {" "}
            Última sincronização ISO {updatedAt} ({formatDate(updatedAt.slice(0, 10))})
          </span>
        ) : null}
      </p>
      <p>
        <a href="https://instagram.com/kvnol" target="_blank" rel="noopener noreferrer">
          Desenvolvido por @kvnol
        </a> | <a href="https://github.com/kvnol/naoesqueceremos" target="_blank" rel="noopener noreferrer">Contribua com o projeto</a>
      </p>
    </footer>
  );
}
