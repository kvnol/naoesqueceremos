import { createHash } from "crypto";
import { z } from "zod";
import { STATES } from "./states";
import { clampText, normalizeKey, slugTag } from "./text";
import type { Category, ContentItem, UfCode } from "./types";
import { CATEGORIES } from "./types";
import { resolveMedia } from "./media";

const TITLE_MAX = 180;
const DESC_MAX = 2000;
const SOURCE_NAME_MAX = 120;
const CREDIT_MAX = 160;
const CONTRIBUTOR_MAX = 120;

const contentItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(TITLE_MAX + 1),
  description: z.string().min(1).max(DESC_MAX + 1),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  uf: z.string().length(2).or(z.literal("BR")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceName: z.string().min(1).max(SOURCE_NAME_MAX + 1),
  sourceUrl: z.string().url(),
  archiveUrl: z.string().url().optional(),
  mediaUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  credit: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["published", "pending", "rejected"]),
  contributor: z.string().optional(),
  createdAt: z.string().optional(),
});

type Row = Record<string, string>;

const HEADER_ALIASES = {
  createdAt: ["carimbo de data"],
  category: ["tipo de conteudo"],
  uf: ["estado"],
  date: ["data em que o fato"],
  title: ["titulo"],
  description: ["descricao"],
  sourceUrl: ["link da fonte original"],
  sourceName: ["nome da fonte"],
  mediaUrl: ["link para o conteudo de midia"],
  credit: ["credito"],
  tags: ["temas"],
  contributor: ["seu nome ou"],
  archiveUrl: ["link arquivado", "link_arquivado"],
  status: ["status"],
} as const;

type FieldKey = keyof typeof HEADER_ALIASES;

const NAME_TO_UF: Record<string, UfCode> = Object.fromEntries(
  STATES.flatMap((s) => {
    const keys = [normalizeKey(s.name), normalizeKey(s.uf)];
    if (s.uf === "BR") {
      keys.push(
        normalizeKey("Nacional (Brasil inteiro)"),
        normalizeKey("Brasil"),
        normalizeKey("Nacional"),
        normalizeKey("Brasil (nacional)"),
      );
    }
    return keys.map((k) => [k, s.uf] as const);
  }),
) as Record<string, UfCode>;

export function normalizeHeader(header: string): string {
  return normalizeKey(header);
}

export function findColumn(
  headers: string[],
  aliases: readonly string[],
): string | undefined {
  const normalized = headers.map((h) => ({
    raw: h,
    key: normalizeHeader(h),
  }));
  for (const alias of aliases) {
    const needle = normalizeKey(alias);
    const hit = normalized.find(
      (h) => h.key === needle || h.key.startsWith(needle) || h.key.includes(needle),
    );
    if (hit) return hit.raw;
  }
  return undefined;
}

export function buildColumnMap(headers: string[]): Partial<Record<FieldKey, string>> {
  const map: Partial<Record<FieldKey, string>> = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [
    FieldKey,
    readonly string[],
  ][]) {
    const col = findColumn(headers, aliases);
    if (col) map[field] = col;
  }
  return map;
}

export function cell(row: Row, column?: string): string {
  if (!column) return "";
  const value = row[column];
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

export function parseCategory(raw: string): Category | null {
  const key = normalizeKey(raw);
  if (!key) return null;

  // Sinônimos comuns do Forms / planilha
  if (
    key.startsWith("noticia") ||
    key === "noticias" ||
    key.startsWith("artigo") ||
    key.startsWith("reportagem") ||
    key.startsWith("materia") ||
    key === "texto"
  ) {
    return "noticia";
  }
  if (
    key.startsWith("imagem") ||
    key.startsWith("image") ||
    key.startsWith("foto") ||
    key === "fotografia"
  ) {
    return "imagem";
  }
  if (key.startsWith("audio") || key.includes("audio") || key.startsWith("podcast")) {
    return "audio";
  }
  if (key.startsWith("video") || key.includes("video")) {
    return "video";
  }
  return null;
}

export function parseUf(raw: string): UfCode | null {
  const key = normalizeKey(raw);
  if (!key) return null;
  if (NAME_TO_UF[key]) return NAME_TO_UF[key];
  // sigla direta
  const upper = raw.trim().toUpperCase();
  if (upper in NAME_TO_UF || STATES.some((s) => s.uf === upper)) {
    return upper as UfCode;
  }
  // fuzzy: contains
  for (const [name, uf] of Object.entries(NAME_TO_UF)) {
    if (key.includes(name) || name.includes(key)) return uf;
  }
  return null;
}

export function parseSheetDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    if (isValidYmd(+y, +m, +d)) return `${y}-${m}-${d}`;
    return null;
  }

  const br = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const d = Number(br[1]);
    const m = Number(br[2]);
    const y = Number(br[3]);
    if (!isValidYmd(y, m, d)) return null;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  // Sheets sometimes exports datetime
  const brDateTime = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/,
  );
  if (brDateTime) {
    const d = Number(brDateTime[1]);
    const m = Number(brDateTime[2]);
    const y = Number(brDateTime[3]);
    if (!isValidYmd(y, m, d)) return null;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  return null;
}

function isValidYmd(y: number, m: number, d: number): boolean {
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function parseTags(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[,;|]/)
    .map((t) => slugTag(t))
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);
}

export function isSafeHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeUrl(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (!isSafeHttpUrl(value)) return undefined;
  return value;
}

export function stableItemId(parts: {
  sourceUrl: string;
  date: string;
  title: string;
}): string {
  const hash = createHash("sha1")
    .update(`${parts.sourceUrl}|${parts.date}|${parts.title}`)
    .digest("hex")
    .slice(0, 12);
  return `sheet-${hash}`;
}

export function mapRowToItem(
  row: Row,
  columnMap: Partial<Record<FieldKey, string>>,
  rowIndex: number,
): { item?: ContentItem; error?: string } {
  const title = clampText(cell(row, columnMap.title), TITLE_MAX);
  const description = clampText(cell(row, columnMap.description), DESC_MAX);
  const category = parseCategory(cell(row, columnMap.category));
  const uf = parseUf(cell(row, columnMap.uf));
  const date = parseSheetDate(cell(row, columnMap.date));
  const sourceUrl = sanitizeUrl(cell(row, columnMap.sourceUrl));
  const sourceName =
    clampText(cell(row, columnMap.sourceName), SOURCE_NAME_MAX) ||
    "Fonte não informada";

  const rawCategory = cell(row, columnMap.category);
  const rawUf = cell(row, columnMap.uf);
  const rawDate = cell(row, columnMap.date);

  if (!title) return { error: `linha ${rowIndex}: título vazio` };
  if (!description) return { error: `linha ${rowIndex}: descrição vazia` };
  if (!category) {
    return {
      error: `linha ${rowIndex}: tipo de conteúdo inválido (${JSON.stringify(rawCategory)}). Use Notícia, Imagem, Áudio ou Vídeo`,
    };
  }
  if (!uf) {
    return {
      error: `linha ${rowIndex}: estado inválido (${JSON.stringify(rawUf)})`,
    };
  }
  if (!date) {
    return {
      error: `linha ${rowIndex}: data inválida (${JSON.stringify(rawDate)})`,
    };
  }
  if (!sourceUrl) {
    return { error: `linha ${rowIndex}: link da fonte original inválido` };
  }

  const statusRaw = normalizeKey(cell(row, columnMap.status));
  const status =
    !statusRaw || statusRaw.startsWith("published") || statusRaw === "publicado"
      ? "published"
      : statusRaw.startsWith("pending") || statusRaw === "pendente"
        ? "pending"
        : statusRaw.startsWith("rejected") || statusRaw === "rejeitado"
          ? "rejected"
          : "published";

  if (status !== "published") {
    return { error: `linha ${rowIndex}: status ${status} (ignorado)` };
  }

  const mediaRaw = sanitizeUrl(cell(row, columnMap.mediaUrl));
  const media = resolveMedia(category, mediaRaw);
  const archiveUrl = sanitizeUrl(cell(row, columnMap.archiveUrl));
  const credit = clampText(cell(row, columnMap.credit), CREDIT_MAX) || undefined;
  const contributor =
    clampText(cell(row, columnMap.contributor), CONTRIBUTOR_MAX) || undefined;
  const tags = parseTags(cell(row, columnMap.tags));
  const createdAtRaw = cell(row, columnMap.createdAt);
  const createdAt = createdAtRaw || undefined;

  const candidate: ContentItem = {
    id: stableItemId({ sourceUrl, date, title }),
    title,
    description,
    category,
    uf,
    date,
    sourceName,
    sourceUrl,
    status: "published",
    ...(archiveUrl ? { archiveUrl } : {}),
    ...(media.mediaUrl ? { mediaUrl: media.mediaUrl } : {}),
    ...(media.thumbnailUrl ? { thumbnailUrl: media.thumbnailUrl } : {}),
    ...(credit ? { credit } : {}),
    ...(tags.length ? { tags } : {}),
    ...(contributor ? { contributor } : {}),
    ...(createdAt ? { createdAt } : {}),
  };

  const parsed = contentItemSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      error: `linha ${rowIndex}: validação falhou — ${parsed.error.issues[0]?.message}`,
    };
  }

  return { item: candidate };
}

export function mapRowsToItems(rows: Row[]): {
  items: ContentItem[];
  warnings: string[];
} {
  if (rows.length === 0) return { items: [], warnings: [] };

  const headers = Object.keys(rows[0] ?? {});
  const columnMap = buildColumnMap(headers);
  const warnings: string[] = [];
  const items: ContentItem[] = [];

  rows.forEach((row, index) => {
    const { item, error } = mapRowToItem(row, columnMap, index + 2);
    if (item) items.push(item);
    else if (error) warnings.push(error);
  });

  return { items, warnings };
}
