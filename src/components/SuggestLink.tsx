import { getSuggestUrl, type SuggestParams } from "@/lib/suggest";
import { cn } from "@/lib/cn";

interface SuggestLinkProps extends SuggestParams {
  children: React.ReactNode;
  className?: string;
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
      {...rest}
    >
      {children}
    </a>
  );
}
