import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { ArchiveHome } from "@/components/ArchiveHome";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { loadContent } from "@/lib/load-content";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "G-VJKSWTDFJ6";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lembrancaspara2030.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lembranças para 2030",
    template: "%s — Lembranças para 2030",
  },
  description:
    "Arquivo público e interativo da memória política do Brasil na última década. Não esqueceremos o que a extrema direita fez neste país.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Lembranças para 2030",
    title: "Lembranças para 2030",
    description:
      "Não esqueceremos o que a extrema direita fez neste país. Arquivo de memória política organizado por estado.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lembranças para 2030",
    description:
      "Arquivo público da memória política do Brasil — 2016 a 2026.",
  },
  robots: { index: true, follow: true },
};

/** ISR; CSV da planilha sem cache Next (ver load-content). */
export const revalidate = 300;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const payload = await loadContent();

  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="relative h-full antialiased">
        <Header />
        {/* Mapa persistente sob todas as rotas */}
        <Suspense fallback={null}>
          <ArchiveHome payload={payload} />
        </Suspense>
        {/* Páginas (ex.: Sobre) como modal por cima */}
        <div className="relative z-40">{children}</div>
        <SiteFooter updatedAt={payload.updatedAt} source={payload.source} />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
