import type { Metadata } from "next";
import { ArchiveHome } from "@/components/ArchiveHome";
import { SiteFooter } from "@/components/SiteFooter";
import { StateIndex } from "@/components/StateIndex";
import { loadContent } from "@/lib/load-content";
import { HOME_TITLE, SITE_NAME, buildPageMetadata } from "@/lib/site";

/** ISR: a página e o CSV em cache são regenerados a cada 5 min (ver load-content). */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const payload = await loadContent();
  return buildPageMetadata({
    title: HOME_TITLE,
    path: "/",
    // Itens de fallback são placeholders fictícios: nunca indexar.
    noindex: payload.source === "fallback",
  });
}

export default async function HomePage() {
  const payload = await loadContent();

  return (
    <>
      <h1 className="sr-only">
        {SITE_NAME}: mapa da memória política do Brasil por estado
      </h1>
      <ArchiveHome payload={payload} initialUf={null} />
      <StateIndex items={payload.items} />
      <SiteFooter updatedAt={payload.updatedAt} source={payload.source} />
    </>
  );
}
