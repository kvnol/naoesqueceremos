import type { UfCode } from "./types";

export interface StateInfo {
  uf: UfCode;
  name: string;
  region: "N" | "NE" | "CO" | "SE" | "S" | "BR";
}

export const STATES: StateInfo[] = [
  { uf: "AC", name: "Acre", region: "N" },
  { uf: "AL", name: "Alagoas", region: "NE" },
  { uf: "AP", name: "Amapá", region: "N" },
  { uf: "AM", name: "Amazonas", region: "N" },
  { uf: "BA", name: "Bahia", region: "NE" },
  { uf: "CE", name: "Ceará", region: "NE" },
  { uf: "DF", name: "Distrito Federal", region: "CO" },
  { uf: "ES", name: "Espírito Santo", region: "SE" },
  { uf: "GO", name: "Goiás", region: "CO" },
  { uf: "MA", name: "Maranhão", region: "NE" },
  { uf: "MT", name: "Mato Grosso", region: "CO" },
  { uf: "MS", name: "Mato Grosso do Sul", region: "CO" },
  { uf: "MG", name: "Minas Gerais", region: "SE" },
  { uf: "PA", name: "Pará", region: "N" },
  { uf: "PB", name: "Paraíba", region: "NE" },
  { uf: "PR", name: "Paraná", region: "S" },
  { uf: "PE", name: "Pernambuco", region: "NE" },
  { uf: "PI", name: "Piauí", region: "NE" },
  { uf: "RJ", name: "Rio de Janeiro", region: "SE" },
  { uf: "RN", name: "Rio Grande do Norte", region: "NE" },
  { uf: "RS", name: "Rio Grande do Sul", region: "S" },
  { uf: "RO", name: "Rondônia", region: "N" },
  { uf: "RR", name: "Roraima", region: "N" },
  { uf: "SC", name: "Santa Catarina", region: "S" },
  { uf: "SP", name: "São Paulo", region: "SE" },
  { uf: "SE", name: "Sergipe", region: "NE" },
  { uf: "TO", name: "Tocantins", region: "N" },
  { uf: "BR", name: "Brasil (nacional)", region: "BR" },
];

export const STATE_MAP = Object.fromEntries(
  STATES.map((s) => [s.uf, s]),
) as Record<UfCode, StateInfo>;

export const MAP_UFS = STATES.filter((s) => s.uf !== "BR").map((s) => s.uf);

export function getStateName(uf: UfCode): string {
  return STATE_MAP[uf]?.name ?? uf;
}

export function isValidUf(value: string | null | undefined): value is UfCode {
  return !!value && value in STATE_MAP;
}
