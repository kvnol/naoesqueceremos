import type { Category, CategoryTab, SortOrder, UfCode } from "./types";
import { CATEGORIES, CATEGORY_TABS } from "./types";
import { isValidUf } from "./states";

export interface ArchiveUrlState {
  uf: UfCode | null;
  cat: CategoryTab | null;
  q: string | null;
  tag: string | null;
  ordem: SortOrder;
}

function isCategoryTab(value: string | null): value is CategoryTab {
  return !!value && (CATEGORY_TABS as string[]).includes(value);
}

function isSort(value: string | null): value is SortOrder {
  return value === "recentes" || value === "antigos";
}

export function parseArchiveParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ArchiveUrlState {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) {
      return params.get(key);
    }
    const raw = params[key];
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
  };

  const ufRaw = get("uf");
  const catRaw = get("cat");
  const q = get("q");
  const tag = get("tag");
  const ordemRaw = get("ordem");

  return {
    uf: isValidUf(ufRaw) ? ufRaw : null,
    cat: isCategoryTab(catRaw) ? catRaw : null,
    q: q?.trim() || null,
    tag: tag?.trim() || null,
    ordem: isSort(ordemRaw) ? ordemRaw : "recentes",
  };
}

/** Caminho canônico da página de um estado (ex.: "/estado/sp"). */
export function statePath(uf: UfCode): string {
  return `/estado/${uf.toLowerCase()}`;
}

/** Converte o slug da rota ("sp", "SP") em UF válida. */
export function ufFromSlug(slug: string | null | undefined): UfCode | null {
  const uf = slug?.toUpperCase() ?? null;
  return isValidUf(uf) ? uf : null;
}

/** Lê o estado do arquivo a partir de pathname (/estado/:uf) + query string. */
export function parseArchiveLocation(
  pathname: string,
  search: string,
): ArchiveUrlState {
  const match = /^\/estado\/([^/]+)\/?$/.exec(pathname);
  const uf = match ? ufFromSlug(decodeURIComponent(match[1])) : null;
  return { ...parseArchiveParams(new URLSearchParams(search)), uf };
}

/** Filtros da query string; a UF vai no caminho (ver statePath). */
export function buildArchiveSearchParams(
  state: Partial<ArchiveUrlState>,
): URLSearchParams {
  const next = new URLSearchParams();

  const setOrDelete = (key: string, value: string | null | undefined) => {
    if (!value) next.delete(key);
    else next.set(key, value);
  };

  if ("cat" in state) {
    if (!state.cat || state.cat === "todos") next.delete("cat");
    else setOrDelete("cat", state.cat);
  }
  if ("q" in state) setOrDelete("q", state.q ?? null);
  if ("tag" in state) setOrDelete("tag", state.tag ?? null);
  if ("ordem" in state) {
    if (!state.ordem || state.ordem === "recentes") next.delete("ordem");
    else next.set("ordem", state.ordem);
  }

  return next;
}

export function archiveStateToSharePath(state: ArchiveUrlState): string {
  if (!state.uf) return "/";
  const qs = buildArchiveSearchParams(state).toString();
  const path = statePath(state.uf);
  return qs ? `${path}?${qs}` : path;
}

export function isCategory(value: string | null | undefined): value is Category {
  return !!value && (CATEGORIES as string[]).includes(value);
}
