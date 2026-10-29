import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { loadContent, SHEET_CACHE_TAG } from "@/lib/load-content";

/**
 * Força atualização imediata do cache após aprovar um item na planilha.
 *
 * Uso:
 *   curl -X POST "https://seu-dominio/api/revalidate" \
 *     -H "Authorization: Bearer $REVALIDATE_SECRET"
 *
 * ou:
 *   curl -X POST "https://seu-dominio/api/revalidate?secret=$REVALIDATE_SECRET"
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "REVALIDATE_SECRET não configurado" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");

  if (bearer !== secret && querySecret !== secret) {
    return NextResponse.json({ ok: false, message: "Não autorizado" }, { status: 401 });
  }

  // Invalida cache do Next e regenera rotas
  revalidateTag(SHEET_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/api/items");

  // Busca fresca agora (com cache-bust) para diagnosticar a planilha
  const payload = await loadContent();

  return NextResponse.json({
    ok: true,
    revalidated: true,
    at: new Date().toISOString(),
    source: payload.source,
    itemCount: payload.items.length,
    items: payload.items.map((i) => ({
      id: i.id,
      uf: i.uf,
      category: i.category,
      title: i.title,
      date: i.date,
    })),
    hint:
      payload.source === "fallback"
        ? "SHEET_CSV_URL ausente ou falhou o fetch — usando items.json"
        : payload.items.length === 0
          ? "CSV veio vazio ou todas as linhas foram descartadas (veja logs do servidor)"
          : "Se faltam itens, confira se estão na aba publicada e se o Google já propagou o CSV (às vezes demora alguns minutos; File → Share → Publish to web).",
  });
}
