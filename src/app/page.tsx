import type { Metadata } from "next";
import { Suspense } from "react";
import { ArchiveHome } from "@/components/ArchiveHome";
import { SiteFooter } from "@/components/SiteFooter";
import { loadContent } from "@/lib/load-content";
import { SITE_NAME, SITE_TAGLINE, buildPageMetadata } from "@/lib/site";
import { getStateName } from "@/lib/states";
import { CATEGORY_TAB_LABELS } from "@/lib/types";
import { parseArchiveParams } from "@/lib/url-state";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** ISR da página; o CSV da planilha é buscado sem cache do Next (ver load-content). */
export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const [params, payload] = await Promise.all([searchParams, loadContent()]);
  const state = parseArchiveParams(params);
  // Busca, tema e ordenação são recortes do mesmo conteúdo: não indexar.
  // Itens de fallback são placeholders fictícios: nunca indexar.
  const noindex =
    !!(state.q || state.tag || state.ordem !== "recentes") ||
    payload.source === "fallback";

  if (state.uf) {
    const name = getStateName(state.uf);
    const catLabel =
      state.cat && state.cat !== "todos"
        ? ` · ${CATEGORY_TAB_LABELS[state.cat]}`
        : "";
    const where = state.uf === "BR" ? "no Brasil (âmbito nacional)" : `em ${name}`;
    return buildPageMetadata({
      title: `${name}${catLabel}`,
      description: `Notícias, imagens, áudios e vídeos sobre a memória política ${where}. ${SITE_TAGLINE}`,
      // Abas de categoria apontam para a página do estado
      path: `/?uf=${state.uf}`,
      noindex,
    });
  }

  return buildPageMetadata({ title: "Não esqueceremos!", path: "/", noindex });
}

export default async function HomePage() {
  const payload = await loadContent();

  return (
    <>
      <h1 className="sr-only">
        {SITE_NAME}: mapa da memória política do Brasil por estado
      </h1>
      {/* Suspense só por causa do useSearchParams no client — sem skeleton/animação */}
      <Suspense fallback={null}>
        <ArchiveHome payload={payload} />
      </Suspense>
      <SiteFooter updatedAt={payload.updatedAt} source={payload.source} />
    </>
  );
}
