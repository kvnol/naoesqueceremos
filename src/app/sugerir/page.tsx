import type { Metadata } from "next";
import Link from "next/link";
import { SuggestionForm } from "@/components/SuggestionForm";
import { isValidUf } from "@/lib/states";

export const metadata: Metadata = {
  title: "Sugerir conteúdo",
  description:
    "Envie uma sugestão de notícia, imagem, áudio ou vídeo para o arquivo Lembranças para 2030.",
  openGraph: {
    title: "Sugerir conteúdo — Lembranças para 2030",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SugerirPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const ufRaw = Array.isArray(params.uf) ? params.uf[0] : params.uf;
  const defaultUf = ufRaw && isValidUf(ufRaw) ? ufRaw : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent-soft)]">
        Colaboração
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--fg)]">
        Sugerir conteúdo
      </h1>
      <p className="mt-3 max-w-prose text-[var(--fg-muted)]">
        Toda sugestão precisa de uma fonte verificável. O envio atual é
        front-end (mock) — a validação já está pronta para conectar a um
        backend.
      </p>

      <div className="mt-8">
        <SuggestionForm defaultUf={defaultUf} />
      </div>

      <p className="mt-10">
        <Link
          href="/"
          className="text-sm text-[var(--fg-muted)] underline-offset-2 hover:text-[var(--fg)] hover:underline"
        >
          ← Voltar ao mapa
        </Link>
      </p>
    </div>
  );
}
