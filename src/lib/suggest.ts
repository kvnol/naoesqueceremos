import { getStateName, isValidUf } from "./states";
import type { Category, UfCode } from "./types";

const CATEGORY_FORM_LABELS: Record<Category, string> = {
  noticia: "Notícia",
  imagem: "Imagem",
  audio: "Áudio",
  video: "Vídeo",
};

export interface SuggestParams {
  uf?: UfCode | string | null;
  categoria?: Category | null;
}

/**
 * Monta a URL do Google Forms, com pré-preenchimento opcional.
 * Retorna null se NEXT_PUBLIC_SUGGEST_FORM_URL não estiver definida.
 */
export function getSuggestUrl(params: SuggestParams = {}): string | null {
  const base = process.env.NEXT_PUBLIC_SUGGEST_FORM_URL?.trim();
  if (!base) return null;

  const parts: string[] = ["usp=pp_url"];

  const ufEntry = process.env.NEXT_PUBLIC_FORM_ENTRY_UF?.trim();
  if (ufEntry && params.uf) {
    const uf = params.uf;
    const label = isValidUf(uf)
      ? uf === "BR"
        ? "Nacional (Brasil inteiro)"
        : getStateName(uf)
      : String(uf);
    parts.push(
      `${ufEntry}=${encodeURIComponent(label)}`,
    );
  }

  const tipoEntry = process.env.NEXT_PUBLIC_FORM_ENTRY_TIPO?.trim();
  if (tipoEntry && params.categoria) {
    const label = CATEGORY_FORM_LABELS[params.categoria] ?? params.categoria;
    parts.push(
      `${tipoEntry}=${encodeURIComponent(label)}`,
    );
  }

  // Sem entries configurados / sem params → abre o form limpo
  if (parts.length === 1 && !ufEntry && !tipoEntry) {
    return base;
  }
  if (parts.length === 1) {
    return base;
  }

  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}${parts.join("&")}`;
}

export function hasSuggestForm(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUGGEST_FORM_URL?.trim());
}
