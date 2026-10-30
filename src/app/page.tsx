import type { Metadata } from "next";
import { Suspense } from "react";
import { ArchiveHome } from "@/components/ArchiveHome";
import { SiteFooter } from "@/components/SiteFooter";
import { loadContent } from "@/lib/load-content";
import { getStateName, isValidUf } from "@/lib/states";
import { CATEGORY_TAB_LABELS, type CategoryTab } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** ISR da página; o CSV da planilha é buscado sem cache do Next (ver load-content). */
export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const ufRaw = Array.isArray(params.uf) ? params.uf[0] : params.uf;
  const catRaw = Array.isArray(params.cat) ? params.cat[0] : params.cat;

  if (ufRaw && isValidUf(ufRaw)) {
    const name = getStateName(ufRaw);
    const catLabel =
      catRaw && catRaw in CATEGORY_TAB_LABELS
        ? ` · ${CATEGORY_TAB_LABELS[catRaw as CategoryTab]}`
        : "";
    const title = `${name}${catLabel}`;
    return {
      title,
      openGraph: {
        title: `Lembranças para 2030 — ${name}`,
        description: `Registros de memória política em ${name}. Não esqueceremos o que a extrema direita fez neste país.`,
      },
    };
  }

  return {
    title: "Não esqueceremos! | Lembranças para 2030",
  };
}

export default async function HomePage() {
  const payload = await loadContent();

  return (
    <>
      {/* Suspense só por causa do useSearchParams no client — sem skeleton/animação */}
      <Suspense fallback={null}>
        <ArchiveHome payload={payload} />
      </Suspense>
      <SiteFooter updatedAt={payload.updatedAt} source={payload.source} />
    </>
  );
}
