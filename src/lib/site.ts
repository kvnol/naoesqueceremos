import type { Metadata } from "next";

export const SITE_NAME = "Lembranças para 2030";

export const SITE_TAGLINE =
  "Não esqueceremos o que a extrema direita fez neste país.";

export const SITE_DESCRIPTION =
  "Arquivo público e interativo da memória política do Brasil na última década, organizado por estado. Não esqueceremos o que a extrema direita fez neste país.";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  // Domínio de produção exposto pela Vercel em build e runtime
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "https://naoesqueceremos.vercel.app";
}

export const SITE_URL = resolveSiteUrl();

interface PageMetadataInput {
  /** Título da página sem o nome do site; omitido na home. */
  title?: string;
  description?: string;
  /** Caminho canônico relativo (ex.: "/sobre", "/?uf=SP"). */
  path: string;
  noindex?: boolean;
}

/**
 * Monta o Metadata completo de uma página.
 * O Next faz merge raso entre segmentos: `openGraph` e `twitter` definidos
 * aqui substituem os do layout, então precisam vir inteiros.
 */
export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  noindex = false,
}: PageMetadataInput): Metadata {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  // Páginas que definem openGraph próprio não herdam o opengraph-image da raiz
  const images = [
    {
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
    },
  ];

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}
