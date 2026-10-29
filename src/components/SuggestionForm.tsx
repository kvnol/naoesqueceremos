"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  submitSuggestion,
  suggestionSchema,
  type SuggestionInput,
} from "@/lib/suggestions";
import { STATES } from "@/lib/states";
import { CATEGORIES, CATEGORY_LABELS, THEME_TAGS } from "@/lib/types";
import { cn } from "@/lib/cn";

interface SuggestionFormProps {
  defaultUf?: string;
}

export function SuggestionForm({ defaultUf }: SuggestionFormProps) {
  const [result, setResult] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuggestionInput>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      category: "noticia",
      uf: (defaultUf as SuggestionInput["uf"]) || "BR",
      date: "",
      title: "",
      sourceUrl: "",
      description: "",
      email: "",
      tags: [],
    },
  });

  async function onSubmit(data: SuggestionInput) {
    setResult(null);
    const res = await submitSuggestion(data);
    setResult(res.message);
    if (res.ok) reset({ ...data, title: "", sourceUrl: "", description: "", email: "" });
  }

  const field =
    "w-full rounded-sm border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)]";
  const label = "flex flex-col gap-1.5 text-sm text-[var(--fg-muted)]";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-xl flex-col gap-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Tipo
          <select className={field} {...register("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="text-xs text-[var(--danger)]">
              {errors.category.message}
            </span>
          )}
        </label>

        <label className={label}>
          Estado / âmbito
          <select className={field} {...register("uf")}>
            {STATES.map((s) => (
              <option key={s.uf} value={s.uf}>
                {s.name} ({s.uf})
              </option>
            ))}
          </select>
          {errors.uf && (
            <span className="text-xs text-[var(--danger)]">
              {errors.uf.message}
            </span>
          )}
        </label>
      </div>

      <label className={label}>
        Data do evento / publicação
        <input type="date" className={field} {...register("date")} />
        {errors.date && (
          <span className="text-xs text-[var(--danger)]">
            {errors.date.message}
          </span>
        )}
      </label>

      <label className={label}>
        Título
        <input
          type="text"
          className={field}
          placeholder="Resumo curto e descritivo"
          {...register("title")}
        />
        {errors.title && (
          <span className="text-xs text-[var(--danger)]">
            {errors.title.message}
          </span>
        )}
      </label>

      <label className={label}>
        Link da fonte (obrigatório)
        <input
          type="url"
          className={field}
          placeholder="https://"
          {...register("sourceUrl")}
        />
        {errors.sourceUrl && (
          <span className="text-xs text-[var(--danger)]">
            {errors.sourceUrl.message}
          </span>
        )}
      </label>

      <label className={label}>
        Descrição
        <textarea
          rows={5}
          className={cn(field, "resize-y")}
          placeholder="Contexto, o que aconteceu, por que importa lembrar"
          {...register("description")}
        />
        {errors.description && (
          <span className="text-xs text-[var(--danger)]">
            {errors.description.message}
          </span>
        )}
      </label>

      <fieldset>
        <legend className="mb-2 text-sm text-[var(--fg-muted)]">
          Temas (opcional)
        </legend>
        <div className="flex flex-wrap gap-2">
          {THEME_TAGS.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-1.5 rounded-sm border border-[var(--line)] px-2 py-1 text-xs text-[var(--fg-subtle)]"
            >
              <input type="checkbox" value={tag} {...register("tags")} />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={label}>
        E-mail (opcional)
        <input
          type="email"
          className={field}
          placeholder="para retorno sobre a sugestão"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-[var(--danger)]">
            {errors.email.message}
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-sm border border-[var(--accent)] bg-[var(--accent)]/20 px-4 py-2.5 text-sm font-medium text-[var(--accent-soft)] transition-colors hover:bg-[var(--accent)]/30 disabled:opacity-50"
      >
        {isSubmitting ? "Enviando…" : "Enviar sugestão"}
      </button>

      {result && (
        <p
          role="status"
          className="rounded-sm border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-2 text-sm text-[var(--fg-muted)]"
        >
          {result}
        </p>
      )}
    </form>
  );
}
