import type { Metadata } from "next";
import { PageModal } from "@/components/PageModal";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Como o Lembranças para 2030 trata dados de navegação e o Google Analytics 4.",
};

export default function PrivacidadePage() {
  return (
    <PageModal title="Privacidade">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--fg)] sm:text-4xl">
        Política de privacidade
      </h1>

      <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[var(--fg-muted)]">
        <p>
          O site <strong className="text-[var(--fg)]">Lembranças para 2030</strong>{" "}
          é um arquivo público. Não pedimos cadastro nem coletamos nome, e-mail
          ou outros dados pessoais pelos formulários embutidos no mapa (a
          sugestão de conteúdo abre um Google Forms externo).
        </p>

        <h2 className="pt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          O que coletamos
        </h2>
        <p>
          Se você <strong className="text-[var(--fg)]">aceitar</strong> o banner
          de consentimento, usamos o{" "}
          <strong className="text-[var(--fg)]">Google Analytics 4</strong> para
          estatísticas agregadas de uso: páginas vistas, estados do mapa
          abertos, abas consultadas, cliques em fontes e no botão Sugerir. Os
          eventos não incluem título de matérias, URLs completas de fontes nem
          dados de identificação pessoal.
        </p>
        <p>
          Sem consentimento, o Consent Mode do Google mantém{" "}
          <code className="text-[var(--accent)]">analytics_storage</code>{" "}
          bloqueado: não gravamos cookies de medição para analytics.
        </p>

        <h2 className="pt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          Cookies e escolha
        </h2>
        <p>
          A preferência (aceitar ou recusar) fica salva no{" "}
          <code className="text-[var(--accent)]">localStorage</code> do seu
          navegador (<code className="text-[var(--accent)]">ga_consent</code>),
          só neste dispositivo. Você pode limpar os dados do site nas
          configurações do navegador para ver o banner de novo.
        </p>

        <h2 className="pt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          Terceiros
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-[var(--fg)]">Google Analytics</strong> —
            medição de audiência (somente com consentimento).
          </li>
          <li>
            <strong className="text-[var(--fg)]">Google Forms</strong> — ao
            sugerir conteúdo, os dados do formulário são tratados pela Google
            conforme a política deles.
          </li>
          <li>
            Incorporações de mídia (YouTube, X/Twitter, Instagram) podem
            carregar scripts próprios quando você ativa o player.
          </li>
        </ul>

        <h2 className="pt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--fg)]">
          Contato
        </h2>
        <p>
          Dúvidas sobre privacidade:{" "}
          <a
            href="https://instagram.com/kvnol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            @kvnol
          </a>
          .
        </p>
      </div>
    </PageModal>
  );
}
