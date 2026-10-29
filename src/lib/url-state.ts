import type { Category, SortOrder, UfCode } from "./types";
import { CATEGORIES } from "./types";
import { isValidUf } from "./states";

export interface ArchiveUrlState {
  uf: UfCode | null;
  cat: Category | null;
  de: string | null;
  ate: string | null;
  q: string | null;
  tag: string | null;
  ordem: SortOrder;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isCategory(value: string | null): value is Category {
  return !!value && (CATEGORIES as string[]).includes(value);
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
  const de = get("de");
  const ate = get("ate");
  const q = get("q");
  const tag = get("tag");
  const ordemRaw = get("ordem");

  return {
    uf: isValidUf(ufRaw) ? ufRaw : null,
    cat: isCategory(catRaw) ? catRaw : null,
    de: de && DATE_RE.test(de) ? de : null,
    ate: ate && DATE_RE.test(ate) ? ate : null,
    q: q?.trim() || null,
    tag: tag?.trim() || null,
    ordem: isSort(ordemRaw) ? ordemRaw : "recentes",
  };
}

export function buildArchiveSearchParams(
  state: Partial<ArchiveUrlState>,
  base?: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(base?.toString());

  const setOrDelete = (key: string, value: string | null | undefined) => {
    if (!value) next.delete(key);
    else next.set(key, value);
  };

  if ("uf" in state) setOrDelete("uf", state.uf ?? null);
  if ("cat" in state) setOrDelete("cat", state.cat ?? null);
  if ("de" in state) setOrDelete("de", state.de ?? null);
  if ("ate" in state) setOrDelete("ate", state.ate ?? null);
  if ("q" in state) setOrDelete("q", state.q ?? null);
  if ("tag" in state) setOrDelete("tag", state.tag ?? null);
  if ("ordem" in state) {
    if (!state.ordem || state.ordem === "recentes") next.delete("ordem");
    else next.set("ordem", state.ordem);
  }

  return next;
}

export function archiveStateToSharePath(state: ArchiveUrlState): string {
  const params = buildArchiveSearchParams(state);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
