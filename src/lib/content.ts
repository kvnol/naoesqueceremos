import itemsData from "@/data/items.json";
import type {
  Category,
  CategoryCounts,
  ContentItem,
  ItemFilters,
  SortOrder,
  UfCode,
} from "./types";
import { CATEGORIES } from "./types";

/**
 * Camada de abstração de conteúdo.
 * Hoje lê `data/items.json`. Troque o corpo destas funções por
 * Supabase / Sheets / Airtable sem alterar a UI.
 */
const ALL_ITEMS = itemsData as ContentItem[];

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
    const needle = filters.tag.toLowerCase();
    if (!(item.tags ?? []).some((t) => t.toLowerCase() === needle)) return false;
  }

  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    if (q) {
      const haystack = [
        item.title,
        item.description,
        item.sourceName,
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
  }

  return true;
}

function sortItems(items: ContentItem[], sort: SortOrder = "recentes"): ContentItem[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const diff = (parseDate(a.date) ?? 0) - (parseDate(b.date) ?? 0);
    return sort === "antigos" ? diff : -diff;
  });
  return sorted;
}

export function getItems(filters: ItemFilters = {}): ContentItem[] {
  const filtered = ALL_ITEMS.filter((item) => matchesFilters(item, filters));
  return sortItems(filtered, filters.sort ?? "recentes");
}

export function getItemById(id: string): ContentItem | undefined {
  return ALL_ITEMS.find((item) => item.id === id && item.status === "published");
}

export function getTotalCount(filters: Omit<ItemFilters, "uf" | "category"> = {}): number {
  return getItems(filters).length;
}

export function getCountsByUf(
  filters: Omit<ItemFilters, "uf"> = {},
): Record<UfCode, number> {
  const items = getItems(filters);
  const counts = {} as Record<UfCode, number>;
  for (const item of items) {
    counts[item.uf] = (counts[item.uf] ?? 0) + 1;
  }
  return counts;
}

export function getCategoryCounts(
  filters: Omit<ItemFilters, "category"> = {},
): CategoryCounts {
  const items = getItems(filters);
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
  filters: Omit<ItemFilters, "from" | "to"> = {},
  yearStart = 2016,
  yearEnd = 2026,
): { year: number; count: number }[] {
  const items = getItems(filters);
  const map = new Map<number, number>();
  for (let y = yearStart; y <= yearEnd; y += 1) map.set(y, 0);
  for (const item of items) {
    const year = Number(item.date.slice(0, 4));
    if (map.has(year)) map.set(year, (map.get(year) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([year, count]) => ({ year, count }));
}

export function getAllTags(filters: ItemFilters = {}): string[] {
  const set = new Set<string>();
  for (const item of getItems(filters)) {
    for (const tag of item.tags ?? []) set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getMaxUfCount(filters: Omit<ItemFilters, "uf"> = {}): number {
  const counts = getCountsByUf(filters);
  return Math.max(0, ...Object.values(counts));
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
