import { NextResponse, type NextRequest } from "next/server";
import {
  buildArchiveSearchParams,
  parseArchiveParams,
  statePath,
} from "@/lib/url-state";

/**
 * Redirecionamentos permanentes para as URLs canônicas dos estados:
 * - links antigos `/?uf=SP&cat=video` → `/estado/sp?cat=video`
 * - `/estado/SP` → `/estado/sp`
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/") {
    const state = parseArchiveParams(searchParams);
    if (!state.uf) return NextResponse.next();
    return redirectTo(request, statePath(state.uf), buildArchiveSearchParams(state));
  }

  const slug = pathname.split("/")[2] ?? "";
  if (slug !== slug.toLowerCase()) {
    return redirectTo(request, `/estado/${slug.toLowerCase()}`, searchParams);
  }

  return NextResponse.next();
}

function redirectTo(request: NextRequest, path: string, params: URLSearchParams) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = params.toString();
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/", "/estado/:uf"],
};
