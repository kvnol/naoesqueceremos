import type {
  Category,
  CategoryCounts,
  ContentItem,
  ItemFilters,
  SortOrder,
  UfCode,
} from "./types";
import { CATEGORIES } from "./types";
import { normalizeKey } from "./text";

function parseDate(value?: string): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function matchesFilters(item: ContentItem, filters: ItemFilters = {}): boolean {
  const status = filters.status ?? "published";
  if (item.status !== status) return false;

  if (filters.uf && item.uf !== filters.uf) return false;
  if (filters.category && item.category !== filters.category) return false;

  const from = parseDate(filters.from);
  const to = parseDate(filters.to);
  const itemDate = parseDate(item.date) ?? 0;
  if (from !== null && itemDate < from) return false;
  if (to !== null && itemDate > to + 24 * 60 * 60 * 1000 - 1) return false;

  if (filters.tag) {
    const needle = normalizeKey(filters.tag);
    if (!(item.tags ?? []).some((t) => normalizeKey(t) === needle)) return false;
  }

  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    if (q) {
      const haystack = [
        item.title,
        item.description,
        item.sourceName,
        item.contributor ?? "",
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
  }

  return true;
}

function sortItems(
  items: ContentItem[],
  sort: SortOrder = "recentes",
): ContentItem[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const diff = (parseDate(a.date) ?? 0) - (parseDate(b.date) ?? 0);
    if (diff !== 0) return sort === "antigos" ? diff : -diff;
    const created =
      (parseDate(a.createdAt) ?? 0) - (parseDate(b.createdAt) ?? 0);
    return sort === "antigos" ? created : -created;
  });
  return sorted;
}

/**
 * Filtra e ordena uma lista já carregada.
 * Mantém a mesma assinatura conceitual de getItems(filters).
 */
export function getItems(
  allItems: ContentItem[],
  filters: ItemFilters = {},
): ContentItem[] {
  const filtered = allItems.filter((item) => matchesFilters(item, filters));
  return sortItems(filtered, filters.sort ?? "recentes");
}

export function getTotalCount(
  allItems: ContentItem[],
  filters: Omit<ItemFilters, "uf" | "category"> = {},
): number {
  return getItems(allItems, filters).length;
}

export function getCountsByUf(
  allItems: ContentItem[],
  filters: Omit<ItemFilters, "uf"> = {},
): Partial<Record<UfCode, number>> {
  const items = getItems(allItems, filters);
  const counts: Partial<Record<UfCode, number>> = {};
  for (const item of items) {
    counts[item.uf] = (counts[item.uf] ?? 0) + 1;
  }
  return counts;
}

export function getCategoryCounts(
  allItems: ContentItem[],
  filters: Omit<ItemFilters, "category"> = {},
): CategoryCounts {
  const items = getItems(allItems, filters);
  const counts: CategoryCounts = {
    noticia: 0,
    imagem: 0,
    audio: 0,
    video: 0,
    total: items.length,
  };
  for (const item of items) {
    counts[item.category] += 1;
  }
  return counts;
}

export function getYearHistogram(
  allItems: ContentItem[],
  filters: Omit<ItemFilters, "from" | "to"> = {},
): { year: number; count: number }[] {
  const items = getItems(allItems, filters);
  if (items.length === 0) return [];

  const map = new Map<number, number>();
  for (const item of items) {
    const year = Number(item.date.slice(0, 4));
    if (!Number.isFinite(year)) continue;
    map.set(year, (map.get(year) ?? 0) + 1);
  }

  // Preenche anos vazios entre o mínimo e o máximo presentes
  const years = Array.from(map.keys()).sort((a, b) => a - b);
  const start = years[0];
  const end = years[years.length - 1];
  const result: { year: number; count: number }[] = [];
  for (let y = start; y <= end; y += 1) {
    result.push({ year: y, count: map.get(y) ?? 0 });
  }
  return result;
}

export function getAvailableYears(allItems: ContentItem[]): number[] {
  const set = new Set<number>();
  for (const item of allItems) {
    if (item.status !== "published") continue;
    const year = Number(item.date.slice(0, 4));
    if (Number.isFinite(year)) set.add(year);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function getAllTags(
  allItems: ContentItem[],
  filters: ItemFilters = {},
): string[] {
  const set = new Set<string>();
  for (const item of getItems(allItems, filters)) {
    for (const tag of item.tags ?? []) set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function emptyCategoryCounts(): CategoryCounts {
  return { noticia: 0, imagem: 0, audio: 0, video: 0, total: 0 };
}

export function countByCategory(
  items: ContentItem[],
): Record<Category, number> {
  const result = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
    Category,
    number
  >;
  for (const item of items) result[item.category] += 1;
  return result;
}
