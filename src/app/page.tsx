import type { Metadata } from "next";
import { Suspense } from "react";
import { ArchiveHome } from "@/components/ArchiveHome";
import { getStateName, isValidUf } from "@/lib/states";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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
    title: "Mapa do Brasil",
  };
}

function HomeFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 items-center justify-center px-4 py-20 text-[var(--fg-muted)]">
      Carregando arquivo…
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <ArchiveHome />
    </Suspense>
  );
}
