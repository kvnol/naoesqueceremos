import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Manifesto, critérios editoriais e como contribuir com o arquivo Lembranças para 2030.",
  openGraph: {
    title: "Sobre — Lembranças para 2030",
  },
};

export default function SobrePage() {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent-soft)]">
        Manifesto
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--fg)]">
        Sobre o arquivo
      </h1>

      <div className="prose-archive mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--fg-muted)]">
        <p>
          <strong className="font-medium text-[var(--fg)]">
            Lembranças para 2030
          </strong>{" "}
          é um arquivo público e interativo da memória política do Brasil na
          última década. Organizamos notícias, imagens, áudios e vídeos por
          estado — e por âmbito nacional — para que o que aconteceu não se
          dissolva no feed.
        </p>
        <p className="font-[family-name:var(--font-display)] text-xl leading-snug text-[var(--fg)]">
          Não esqueceremos o que a extrema direita fez neste país.
        </p>
        <p>
          Este projeto não substitui a imprensa, a justiça ou a historiografia.
          É um memorial vivo: um mapa para localizar, revisitar e compartilhar
          evidências. Cada item aponta para uma fonte original; sempre que
          possível, também para uma cópia arquivada.
        </p>

        <h2 className="pt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          Critérios editoriais
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-[var(--fg)]">Fonte verificável:</strong>{" "}
            todo conteúdo precisa de link para a origem (reportagem, documento,
            vídeo publicado, acervo institucional).
          </li>
          <li>
            <strong className="text-[var(--fg)]">Contexto:</strong> títulos e
            descrições devem situar o fato no tempo e no lugar, sem fabricar
            conclusões sem lastro.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Escopo:</strong> priorizamos
            registros ligados a autoritarismo, desinformação, violência
            política, ataques a direitos e instituições, entre 2016 e 2026.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Moderação:</strong> sugestões
            passam por revisão (<code className="text-[var(--accent-soft)]">pending</code>{" "}
            → <code className="text-[var(--accent-soft)]">published</code>).
            Conteúdo sem fonte ou enganoso é rejeitado.
          </li>
        </ul>

        <h2 className="pt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          Como contribuir
        </h2>
        <p>
          Use o formulário de{" "}
          <Link
            href="/sugerir"
            className="text-[var(--accent-soft)] underline-offset-2 hover:underline"
          >
            sugestão
          </Link>
          . Inclua tipo, estado, data, título, link da fonte e uma descrição
          clara. Itens marcados como{" "}
          <em className="text-[var(--fg)]">[EXEMPLO]</em> no site são
          placeholders fictícios só para testar a interface.
        </p>
        <p>
          Desenvolvedoras e desenvolvedores: os dados vêm hoje de{" "}
          <code className="text-[var(--accent-soft)]">src/data/items.json</code>,
          acessados por{" "}
          <code className="text-[var(--accent-soft)]">lib/content.ts</code> — uma
          camada pronta para trocar por Supabase, Sheets ou Airtable sem
          refatorar a UI.
        </p>
      </div>

      <p className="mt-10">
        <Link
          href="/"
          className="text-sm text-[var(--fg-muted)] underline-offset-2 hover:text-[var(--fg)] hover:underline"
        >
          ← Voltar ao mapa
        </Link>
      </p>
    </article>
  );
}
