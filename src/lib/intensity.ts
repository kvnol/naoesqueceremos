/**
 * Interpola a intensidade de preenchimento do mapa
 * a partir da contagem de itens (0 → vazio, max → âmbar/vermelho).
 */
export function countToFill(count: number, max: number): string {
  if (count <= 0 || max <= 0) return "var(--map-empty)";
  const t = Math.min(1, Math.sqrt(count / max));
  // de #2a1814 → #c45c26
  const r = Math.round(42 + (196 - 42) * t);
  const g = Math.round(24 + (92 - 24) * t);
  const b = Math.round(20 + (38 - 20) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
