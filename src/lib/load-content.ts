import "server-only";

import { cache } from "react";
import Papa from "papaparse";
import fallbackItems from "@/data/items.json";
import { mapRowsToItems } from "./sheet-mapper";
import type { ContentItem, ContentPayload } from "./types";

type CsvRow = Record<string, string>;

export const SHEET_CACHE_TAG = "sheet-items";

function loadFallback(reason: string): ContentPayload {
  console.warn(`[content] usando fallback items.json — ${reason}`);
  return {
    items: (fallbackItems as ContentItem[]).filter(
      (i) => i.status === "published",
    ),
    updatedAt: null,
    source: "fallback",
  };
}

/** Intervalo de atualização (s) das páginas e do CSV em cache. */
export const CONTENT_REVALIDATE_SECONDS = 300;

/**
 * Evita cache agressivo do CDN do Google na URL /pub.
 * O bust muda a cada minuto (e não a cada request) para que as páginas
 * geradas no mesmo intervalo — build e ISR — reaproveitem um único download.
 */
function withCacheBust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_ts=${Math.floor(Date.now() / 60_000)}`;
}

async function fetchSheetCsv(url: string): Promise<string> {
  const res = await fetch(withCacheBust(url), {
    // Cacheado (não no-store) para as páginas poderem ser estáticas com ISR.
    next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [SHEET_CACHE_TAG] },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao buscar CSV`);
  }
  return res.text();
}

function parseCsv(csvText: string): CsvRow[] {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length) {
    console.warn(
      "[content] avisos do PapaParse:",
      parsed.errors.slice(0, 5).map((e) => e.message),
    );
  }

  return (parsed.data ?? []).filter((row) =>
    Object.values(row).some((v) => String(v ?? "").trim()),
  );
}

/**
 * Carrega itens publicados da planilha (CSV) ou do fallback local.
 * Somente servidor — a URL da planilha não vai para o client.
 * Memoizado por request (o cache-bust impede a memoização do fetch),
 * para generateMetadata e a página não baixarem o CSV duas vezes.
 */
export const loadContent = cache(async (): Promise<ContentPayload> => {
  const url = process.env.SHEET_CSV_URL?.trim();
  if (!url) {
    return loadFallback("SHEET_CSV_URL ausente");
  }

  try {
    const csvText = await fetchSheetCsv(url);
    const rows = parseCsv(csvText);
    const { items, warnings } = mapRowsToItems(rows);

    for (const warning of warnings.slice(0, 20)) {
      console.warn(`[content] ${warning}`);
    }
    if (warnings.length > 20) {
      console.warn(
        `[content] …e mais ${warnings.length - 20} linhas descartadas`,
      );
    }

    const published = items.filter((i) => i.status === "published");

    console.info(
      `[content] sheet ok: ${rows.length} linha(s) CSV → ${published.length} publicado(s)`,
    );

    return {
      items: published,
      updatedAt: new Date().toISOString(),
      source: "sheet",
    };
  } catch (err) {
    // Deixa o Next marcar a rota como dinâmica (não engolir como "planilha falhou")
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Dynamic server usage")) {
      throw err;
    }
    return loadFallback(`erro ao buscar/planilhar CSV: ${message}`);
  }
});
