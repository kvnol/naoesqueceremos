"use client";

import { getSuggestUrl, type SuggestParams } from "@/lib/suggest";
import { trackClickSuggest, type SuggestLocation } from "@/lib/analytics";
import { cn } from "@/lib/cn";

interface SuggestLinkProps extends SuggestParams {
  children: React.ReactNode;
  className?: string;
  location: SuggestLocation;
  /** Texto acessível se children for só ícone */
  "aria-label"?: string;
}

/**
 * Link para o Google Forms. Não renderiza nada se a URL não estiver configurada.
 */
export function SuggestLink({
  children,
  className,
  uf,
  categoria,
  location,
  ...rest
}: SuggestLinkProps) {
  const href = getSuggestUrl({ uf, categoria });
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
      onClick={() => trackClickSuggest(location, uf)}
      {...rest}
    >
      {children}
    </a>
  );
}
