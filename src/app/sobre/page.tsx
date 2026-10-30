import type { Metadata } from "next";
import Link from "next/link";
import { SuggestLink } from "@/components/SuggestLink";
import { SiteFooter } from "@/components/SiteFooter";

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
    <>
      <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-[14px] uppercase tracking-[0.2em] text-[var(--accent-soft)]">
          Manifesto
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--fg)]">
          Sobre o arquivo
        </h1>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--fg-muted)]">
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
              vídeo publicado, acervo institucional). Sem fonte, a sugestão não
              é publicada.
            </li>
            <li>
              <strong className="text-[var(--fg)]">Contexto:</strong> títulos e
              descrições devem situar o fato no tempo e no lugar, sem fabricar
              conclusões sem lastro.
            </li>
            <li>
              <strong className="text-[var(--fg)]">Escopo:</strong> priorizamos
              registros ligados a autoritarismo, desinformação, violência
              política, ataques a direitos e instituições.
            </li>
            <li>
              <strong className="text-[var(--fg)]">Moderação:</strong> sugestões
              enviadas pelo formulário entram como pendentes e só aparecem no
              site depois de revisão editorial (status{" "}
              <code className="text-[var(--accent-soft)]">published</code> na
              aba publicados da planilha).
            </li>
          </ul>

          <h2 className="pt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
            Como contribuir
          </h2>
          <p>
            Use o formulário de sugestão (Google Forms). Inclua tipo, estado,
            data, título, link da fonte e uma descrição clara. A equipe revisa
            cada envio antes de publicar.
          </p>
          <p>
            <SuggestLink className="inline-flex rounded-sm border border-[var(--accent)]/60 bg-[var(--accent)]/15 px-3 py-2 text-sm text-[var(--accent-soft)] transition-colors hover:bg-[var(--accent)]/25">
              Abrir formulário de sugestão
            </SuggestLink>
          </p>
          <p className="text-sm">
            Itens marcados como{" "}
            <em className="text-[var(--fg)]">[EXEMPLO]</em> no site (quando o
            fallback local estiver ativo) são placeholders fictícios só para
            testar a interface.
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
      <SiteFooter />
    </>
  );
}
