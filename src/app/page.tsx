import type { Metadata } from "next";
import { Suspense } from "react";
import { ArchiveHome } from "@/components/ArchiveHome";
import { SiteFooter } from "@/components/SiteFooter";
import { loadContent } from "@/lib/load-content";
import { getStateName, isValidUf } from "@/lib/states";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

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
      catRaw && catRaw in CATEGORY_LABELS
        ? ` · ${CATEGORY_LABELS[catRaw as Category]}`
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

function HomeFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-6">
      <div className="h-10 w-48 animate-pulse rounded-sm bg-[var(--bg-muted)]" />
      <div className="min-h-[60vh] flex-1 animate-pulse rounded-sm bg-[var(--bg-muted)]/60" />
      <p className="text-center text-sm text-[var(--fg-muted)]">
        Carregando arquivo…
      </p>
    </div>
  );
}

async function HomeContent() {
  const payload = await loadContent();
  return (
    <>
      <ArchiveHome payload={payload} />
      <SiteFooter updatedAt={payload.updatedAt} source={payload.source} />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
