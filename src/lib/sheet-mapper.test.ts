import { describe, expect, it } from "vitest";
import {
  buildColumnMap,
  mapRowToItem,
  mapRowsToItems,
  normalizeHeader,
  parseCategory,
  parseSheetDate,
  parseTags,
  parseUf,
  sanitizeUrl,
  stableItemId,
} from "./sheet-mapper";

describe("normalizeHeader", () => {
  it("remove acentos e pontuação", () => {
    expect(normalizeHeader("Tipo de conteúdo")).toBe("tipo de conteudo");
    expect(normalizeHeader("Data em que o fato ocorreu")).toContain(
      "data em que o fato",
    );
  });
});

describe("parseCategory", () => {
  it("converte rótulos do Forms", () => {
    expect(parseCategory("Notícia")).toBe("noticia");
    expect(parseCategory("Artigo")).toBe("noticia");
    expect(parseCategory("Imagem")).toBe("imagem");
    expect(parseCategory("Áudio")).toBe("audio");
    expect(parseCategory("Vídeo")).toBe("video");
  });
});

describe("parseUf", () => {
  it("converte nomes e nacional", () => {
    expect(parseUf("São Paulo")).toBe("SP");
    expect(parseUf("Distrito Federal")).toBe("DF");
    expect(parseUf("Nacional (Brasil inteiro)")).toBe("BR");
    expect(parseUf("sp")).toBe("SP");
  });
});

describe("parseSheetDate", () => {
  it("aceita DD/MM/YYYY e ISO", () => {
    expect(parseSheetDate("28/10/2018")).toBe("2018-10-28");
    expect(parseSheetDate("2018-10-28")).toBe("2018-10-28");
    expect(parseSheetDate("31/02/2020")).toBeNull();
  });
});

describe("parseTags", () => {
  it("separa por vírgula e normaliza", () => {
    expect(parseTags("Democracia, Meio Ambiente")).toEqual([
      "democracia",
      "meio ambiente",
    ]);
  });
});

describe("sanitizeUrl", () => {
  it("bloqueia javascript:", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeUrl("https://example.com/x")).toBe("https://example.com/x");
  });
});

describe("stableItemId", () => {
  it("é estável para os mesmos campos", () => {
    const a = stableItemId({
      sourceUrl: "https://example.com/a",
      date: "2020-01-01",
      title: "Título",
    });
    const b = stableItemId({
      sourceUrl: "https://example.com/a",
      date: "2020-01-01",
      title: "Título",
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^sheet-[a-f0-9]{12}$/);
  });
});

describe("mapRowToItem", () => {
  const headers = [
    "Carimbo de data/hora",
    "Tipo de conteúdo",
    "Estado",
    "Data em que o fato ocorreu",
    "Título",
    "Descrição / contexto",
    "Link da fonte original",
    "Nome da fonte",
    "Link para o conteúdo de mídia",
    "Crédito da mídia",
    "Temas",
    "Seu nome ou apelido (opcional)",
    "link_arquivado",
    "status",
  ];

  const columnMap = buildColumnMap(headers);

  it("mapeia uma linha válida", () => {
    const row = Object.fromEntries(
      headers.map((h) => [h, ""]),
    ) as Record<string, string>;
    row["Tipo de conteúdo"] = "Notícia";
    row["Estado"] = "São Paulo";
    row["Data em que o fato ocorreu"] = "28/10/2018";
    row["Título"] = "Ataque à imprensa";
    row["Descrição / contexto"] = "Registro de hostilidade contra jornalistas.";
    row["Link da fonte original"] = "https://example.com/noticia";
    row["Nome da fonte"] = "Jornal Exemplo";
    row["Temas"] = "democracia, violência";
    row["status"] = "published";
    row["Seu nome ou apelido (opcional)"] = "Ana";

    const { item, error } = mapRowToItem(row, columnMap, 2);
    expect(error).toBeUndefined();
    expect(item?.uf).toBe("SP");
    expect(item?.category).toBe("noticia");
    expect(item?.date).toBe("2018-10-28");
    expect(item?.contributor).toBe("Ana");
    expect(item?.tags).toEqual(["democracia", "violencia"]);
  });

  it("descarta data inválida", () => {
    const row = Object.fromEntries(
      headers.map((h) => [h, ""]),
    ) as Record<string, string>;
    row["Tipo de conteúdo"] = "Notícia";
    row["Estado"] = "SP";
    row["Data em que o fato ocorreu"] = "não é data";
    row["Título"] = "X";
    row["Descrição / contexto"] = "Descrição longa o suficiente.";
    row["Link da fonte original"] = "https://example.com";

    const { item, error } = mapRowToItem(row, columnMap, 3);
    expect(item).toBeUndefined();
    expect(error).toMatch(/data inválida/);
  });
});

describe("mapRowsToItems", () => {
  it("ignora linhas ruins sem quebrar", () => {
    const { items, warnings } = mapRowsToItems([
      {
        "Tipo de conteúdo": "Vídeo",
        Estado: "Rio de Janeiro",
        "Data em que o fato ocorreu": "08/01/2021",
        Título: "Vídeo válido de teste",
        "Descrição / contexto": "Contexto do vídeo de teste na planilha.",
        "Link da fonte original": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "Nome da fonte": "Canal",
        "Link para o conteúdo de mídia":
          "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        status: "published",
      },
      {
        "Tipo de conteúdo": "????",
        Estado: "SP",
        "Data em que o fato ocorreu": "01/01/2020",
        Título: "Ruim",
        "Descrição / contexto": "Sem tipo válido nesta linha de teste.",
        "Link da fonte original": "https://example.com",
      },
    ]);
    expect(items).toHaveLength(1);
    expect(warnings.length).toBeGreaterThan(0);
  });
});
