import "server-only";

import Papa from "papaparse";
import fallbackItems from "@/data/items.json";
import { mapRowsToItems } from "./sheet-mapper";
import type { ContentItem, ContentPayload } from "./types";

type CsvRow = Record<string, string>;

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

async function fetchSheetCsv(url: string): Promise<string> {
  const res = await fetch(url, {
    next: { revalidate: 300, tags: ["sheet-items"] },
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
 */
export async function loadContent(): Promise<ContentPayload> {
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

    return {
      items: published,
      updatedAt: new Date().toISOString(),
      source: "sheet",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return loadFallback(`erro ao buscar/planilhar CSV: ${message}`);
  }
}
