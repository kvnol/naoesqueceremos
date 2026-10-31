import { SuggestLink } from "./SuggestLink";
import { formatDate, formatDateTime } from "@/lib/format";

interface SiteFooterProps {
  updatedAt?: string | null;
  source?: "sheet" | "fallback";
}

export function SiteFooter({ updatedAt, source }: SiteFooterProps) {
  const updatedLabel = updatedAt ? formatDateTime(updatedAt) : null;

  return (
    <footer className="chrome-bar pointer-events-none fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)]/70">
      <div className="pointer-events-auto mx-auto flex max-w-[1600px] flex-col items-center gap-1 px-3 py-2.5 text-center text-[13px] text-[var(--fg-subtle)] sm:flex-row sm:justify-between sm:px-5 sm:text-left">
        <p className="min-w-0">
          Arquivo colaborativo
          {updatedLabel ? (
            <>
              {" · "}
              Atualizado em {updatedLabel}
              {source === "fallback" ? " (dados locais)" : ""}
            </>
          ) : null}
          {updatedAt ? (
            <span className="sr-only">
              {" "}
              Última sincronização ISO {updatedAt} (
              {formatDate(updatedAt.slice(0, 10))})
            </span>
          ) : null}
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <SuggestLink
            location="footer"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Sugerir
          </SuggestLink>
          <a
            href="/privacidade"
            className="hover:text-[var(--fg)] hover:underline"
          >
            Privacidade
          </a>
          <a
            href="https://instagram.com/kvnol"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--fg)] hover:underline"
          >
            @kvnol
          </a>
          <a
            href="https://github.com/kvnol/naoesqueceremos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--fg)] hover:underline"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
