import { z } from "zod";
import { CATEGORIES, THEME_TAGS } from "./types";
import { STATES } from "./states";

const ufValues = STATES.map((s) => s.uf) as [string, ...string[]];
const categoryValues = CATEGORIES as unknown as [string, ...string[]];
const tagValues = THEME_TAGS as unknown as [string, ...string[]];

export const suggestionSchema = z.object({
  category: z.enum(categoryValues, {
    message: "Selecione o tipo de conteúdo",
  }),
  uf: z.enum(ufValues, { message: "Selecione um estado" }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida"),
  title: z
    .string()
    .min(8, "Título muito curto")
    .max(180, "Título muito longo"),
  sourceUrl: z.string().url("Informe um link válido da fonte"),
  description: z
    .string()
    .min(20, "Descreva o conteúdo com mais detalhes")
    .max(2000, "Descrição muito longa"),
  email: z.union([z.literal(""), z.string().email("E-mail inválido")]),
  tags: z.array(z.enum(tagValues)).optional(),
});

export type SuggestionInput = z.infer<typeof suggestionSchema>;

export interface SuggestionResult {
  ok: boolean;
  id?: string;
  message: string;
}

/**
 * Mock pronto para conectar a um backend (Supabase, Sheets, e-mail, etc.).
 */
export async function submitSuggestion(
  input: SuggestionInput,
): Promise<SuggestionResult> {
  const parsed = suggestionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  const id = `sug-${Date.now()}`;
  if (typeof console !== "undefined") {
    console.info("[submitSuggestion] mock recebida", { id, ...parsed.data });
  }

  return {
    ok: true,
    id,
    message:
      "Sugestão registrada localmente (mock). Em breve conectaremos a um backend.",
  };
}
