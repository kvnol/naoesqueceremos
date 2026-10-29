import Link from "next/link";
import { SuggestLink } from "./SuggestLink";

export function Header() {
  return (
    <header className="relative z-20 border-b border-[var(--line)]/80 bg-[rgba(11,11,12,0.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 flex-col no-underline focus-visible:rounded-sm"
        >
          <span className="font-[family-name:var(--font-display)] text-lg leading-tight tracking-tight text-[var(--fg)] sm:text-xl">
            Lembranças para 2030
          </span>
          <span className="truncate text-[11px] text-[var(--fg-subtle)] transition-colors group-hover:text-[var(--accent-soft)] sm:text-xs">
            Não esqueceremos o que a extrema direita fez neste país
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="flex shrink-0 items-center gap-1 text-sm sm:gap-2"
        >
          <Link
            href="/"
            className="rounded-sm px-2 py-1.5 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] sm:px-3"
          >
            Mapa
          </Link>
          <Link
            href="/sobre"
            className="rounded-sm px-2 py-1.5 text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] sm:px-3"
          >
            Sobre
          </Link>
          <SuggestLink
            className="rounded-sm border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-2.5 py-1.5 text-[var(--accent-soft)] transition-colors hover:bg-[var(--accent)]/20 sm:px-3"
          >
            Sugerir
          </SuggestLink>
        </nav>
      </div>
    </header>
  );
}
