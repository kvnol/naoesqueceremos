export type Category = "noticia" | "imagem" | "audio" | "video";

export type UfCode =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO"
  | "BR";

export type ItemStatus = "published" | "pending" | "rejected";

export type SortOrder = "recentes" | "antigos";

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  uf: UfCode;
  date: string;
  sourceName: string;
  sourceUrl: string;
  archiveUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  credit?: string;
  tags?: string[];
  status: ItemStatus;
}

export interface ItemFilters {
  uf?: UfCode;
  category?: Category;
  from?: string;
  to?: string;
  query?: string;
  tag?: string;
  sort?: SortOrder;
  status?: ItemStatus;
}

export interface CategoryCounts {
  noticia: number;
  imagem: number;
  audio: number;
  video: number;
  total: number;
}

export const CATEGORIES: Category[] = ["noticia", "imagem", "audio", "video"];

export const CATEGORY_LABELS: Record<Category, string> = {
  noticia: "Notícias",
  imagem: "Imagens",
  audio: "Áudios",
  video: "Vídeos",
};

export const CATEGORY_PARAM: Record<Category, string> = {
  noticia: "noticia",
  imagem: "imagem",
  audio: "audio",
  video: "video",
};

export const THEME_TAGS = [
  "desinformação",
  "meio ambiente",
  "saúde",
  "democracia",
  "violência",
  "educação",
  "direitos humanos",
] as const;

export type ThemeTag = (typeof THEME_TAGS)[number];
