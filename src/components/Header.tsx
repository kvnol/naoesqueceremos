import Link from "next/link";
import { SuggestLink } from "./SuggestLink";

export function Header() {
  return (
    <header className="chrome-bar pointer-events-none fixed inset-x-0 top-0 z-30 border-b border-[var(--line)]/70">
      <div className="pointer-events-auto mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-3 py-3 sm:px-5">
        <Link
          href="/"
          className="group flex min-w-0 flex-col no-underline focus-visible:rounded-sm"
        >
          <span className="font-[family-name:var(--font-display)] text-lg leading-tight tracking-tight text-[var(--fg)] sm:text-xl">
            Lembranças para 2030
          </span>
          <span className="truncate text-[14px] text-[var(--fg-subtle)] transition-colors group-hover:text-[var(--accent)] sm:text-xs">
            Não esqueceremos o que a extrema direita fez neste país
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="flex shrink-0 items-center gap-1 text-sm sm:gap-2"
        >
          <Link
            href="/"
            className="rounded-sm px-2 py-1.5 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] sm:px-3 hover:underline"
          >
            Mapa
          </Link>
          <Link
            href="/sobre"
            className="rounded-sm px-2 py-1.5 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] sm:px-3 hover:underline"
          >
            Sobre
          </Link>
          <SuggestLink
            location="header"
            className="rounded-sm border border-[var(--line)] px-2.5 py-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
          >
            Sugerir conteúdo
          </SuggestLink>
        </nav>
      </div>
    </header>
  );
}
