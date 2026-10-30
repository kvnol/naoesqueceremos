import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveHome } from "@/components/ArchiveHome";
import { SiteFooter } from "@/components/SiteFooter";
import { StateIndex } from "@/components/StateIndex";
import { getItems } from "@/lib/content";
import { pluralize } from "@/lib/format";
import { loadContent } from "@/lib/load-content";
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  buildPageMetadata,
  stateTitle,
} from "@/lib/site";
import { STATES, getStateName } from "@/lib/states";
import type { UfCode } from "@/lib/types";
import { statePath, ufFromSlug } from "@/lib/url-state";

type Params = Promise<{ uf: string }>;

/** ISR: a página e o CSV em cache são regenerados a cada 5 min (ver load-content). */
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return STATES.map((s) => ({ uf: s.uf.toLowerCase() }));
}

function placeLabel(uf: UfCode): string {
  return uf === "BR" ? "no Brasil (âmbito nacional)" : `em ${getStateName(uf)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const uf = ufFromSlug((await params).uf);
  if (!uf) return {};
  const payload = await loadContent();
  const total = getItems(payload.items, { uf }).length;

  return buildPageMetadata({
    title: stateTitle(uf),
    description: `${pluralize(total, "registro", "registros")} de memória política ${placeLabel(uf)}: notícias, imagens, áudios e vídeos com fonte verificável. ${SITE_TAGLINE}`,
    path: statePath(uf),
    image: `${statePath(uf)}/opengraph-image`,
    noindex: payload.source === "fallback",
  });
}

export default async function StatePage({ params }: { params: Params }) {
  const uf = ufFromSlug((await params).uf);
  if (!uf) notFound();

  const payload = await loadContent();
  const items = getItems(payload.items, { uf });
  const name = getStateName(uf);
  const url = `${SITE_URL}${statePath(uf)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: `${name} — ${SITE_NAME}`,
        inLanguage: "pt-BR",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        ...(uf !== "BR" && {
          about: { "@type": "State", name, containedInPlace: "Brasil" },
        }),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.slice(0, 50).map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "CreativeWork",
              name: item.title,
              description: item.description,
              datePublished: item.date,
              url: item.sourceUrl,
              ...(item.sourceName && {
                publisher: { "@type": "Organization", name: item.sourceName },
              }),
            },
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">
        Memória política {placeLabel(uf)}: {pluralize(items.length, "registro", "registros")}
      </h1>
      <ArchiveHome payload={payload} initialUf={uf} />
      <StateIndex items={payload.items} currentUf={uf} />
      <SiteFooter updatedAt={payload.updatedAt} source={payload.source} />
    </>
  );
}
