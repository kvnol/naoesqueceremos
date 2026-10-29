import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

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

  revalidateTag("sheet-items", "max");
  revalidatePath("/");
  revalidatePath("/sobre");

  return NextResponse.json({
    ok: true,
    revalidated: true,
    at: new Date().toISOString(),
  });
}
