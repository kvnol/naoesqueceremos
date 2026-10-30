import type { MouseEvent } from "react";

/** Ctrl/Cmd/Shift/clique do meio: deixa o navegador abrir o link normalmente. */
export function isModifiedClick(e: MouseEvent): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}
