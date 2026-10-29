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
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
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
