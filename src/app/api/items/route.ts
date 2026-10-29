import { NextResponse } from "next/server";
import { loadContent } from "@/lib/load-content";

/**
 * Expõe os itens já tipados para o client, sem revelar SHEET_CSV_URL.
 */
export async function GET() {
  try {
    const payload = await loadContent();
    return NextResponse.json(payload, {
      headers: {
        // Conteúdo já vem fresco do loadContent (no-store + cache-bust).
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/items]", err);
    return NextResponse.json(
      {
        items: [],
        updatedAt: null,
        source: "fallback",
        error: "Não foi possível carregar o arquivo.",
      },
      { status: 500 },
    );
  }
}
