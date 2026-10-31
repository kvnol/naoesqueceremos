import type { Metadata } from "next";
import { SuggestLink } from "@/components/SuggestLink";
import { PageModal } from "@/components/PageModal";

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
    <PageModal title="Manifesto">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--fg)] sm:text-4xl">
        Sobre o arquivo
      </h1>

      <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[var(--fg-muted)]">
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

        <h2 className="pt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          Critérios editoriais
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-[var(--fg)]">Fonte verificável:</strong>{" "}
            todo conteúdo precisa de link para a origem. Sem fonte, a sugestão
            não é publicada.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Contexto:</strong> títulos e
            descrições devem situar o fato no tempo e no lugar.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Escopo:</strong> priorizamos
            registros ligados a autoritarismo, desinformação, violência
            política, ataques a direitos e instituições.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Moderação:</strong> sugestões
            entram como pendentes e só aparecem depois de revisão editorial.
          </li>
        </ul>

        <h2 className="pt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          Como contribuir
        </h2>
        <p>
          Use o formulário de sugestão. Inclua tipo, estado, data, título, link
          da fonte e uma descrição clara.
        </p>
        <p>
          <SuggestLink
            location="sobre"
            className="rounded-sm border border-[var(--line)] px-2.5 py-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
          >
            Abrir formulário de sugestão
          </SuggestLink>
        </p>
      </div>
    </PageModal>
  );
}
