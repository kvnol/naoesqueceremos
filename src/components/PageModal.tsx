"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageModalProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Conteúdo de rota renderizado como modal sobre o mapa persistente.
 */
export function PageModal({ title, children }: PageModalProps) {
  const router = useRouter();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return (
    <div className="page-modal">
      <Link
        href="/"
        aria-label="Fechar e voltar ao mapa"
        className="page-modal-backdrop"
        replace
      />
      <article
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="page-modal-panel relative z-10 px-5 py-6 sm:px-8 sm:py-8"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-[14px] uppercase tracking-[0.18em] text-[var(--accent)]">
            {title}
          </p>
          <Link
            href="/"
            className="rounded-sm border border-[var(--line)] px-2.5 py-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
            replace
          >
            Fechar
          </Link>
        </div>
        {children}
      </article>
    </div>
  );
}
