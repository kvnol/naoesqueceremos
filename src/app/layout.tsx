import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-[var(--line)] px-4 py-3 text-center text-xs text-[var(--fg-subtle)] sm:px-6">
          Lembranças para 2030 · arquivo colaborativo · todo conteúdo exige fonte
          verificável
        </footer>
      </body>
    </html>
  );
}
