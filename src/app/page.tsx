import type { Metadata } from "next";
import { getStateName, isValidUf } from "@/lib/states";
import { CATEGORY_TAB_LABELS, type CategoryTab } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * A home é o próprio mapa (montado no layout).
 * Esta rota só ajusta metadata a partir da query.
 */
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
    return {
      title: `${name}${catLabel}`,
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

export default function HomePage() {
  return null;
}
