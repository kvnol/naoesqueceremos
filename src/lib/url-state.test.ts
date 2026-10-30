import { describe, expect, it } from "vitest";
import {
  archiveStateToSharePath,
  parseArchiveLocation,
  statePath,
  ufFromSlug,
} from "./url-state";

describe("ufFromSlug", () => {
  it("aceita minúsculas e maiúsculas", () => {
    expect(ufFromSlug("sp")).toBe("SP");
    expect(ufFromSlug("BR")).toBe("BR");
  });

  it("rejeita slugs inválidos", () => {
    expect(ufFromSlug("xx")).toBeNull();
    expect(ufFromSlug("")).toBeNull();
    expect(ufFromSlug(undefined)).toBeNull();
  });
});

describe("parseArchiveLocation", () => {
  it("lê a UF do caminho e os filtros da query", () => {
    expect(parseArchiveLocation("/estado/rj", "?cat=video&q=milicia")).toEqual({
      uf: "RJ",
      cat: "video",
      q: "milicia",
      tag: null,
      ordem: "recentes",
    });
  });

  it("ignora uf na query e caminhos fora de /estado", () => {
    expect(parseArchiveLocation("/", "?uf=SP").uf).toBeNull();
    expect(parseArchiveLocation("/sobre", "").uf).toBeNull();
  });
});

describe("archiveStateToSharePath", () => {
  it("gera caminho do estado com filtros", () => {
    expect(
      archiveStateToSharePath({
        uf: "SP",
        cat: "todos",
        q: null,
        tag: "saúde",
        ordem: "antigos",
      }),
    ).toBe(`${statePath("SP")}?tag=sa%C3%BAde&ordem=antigos`);
  });

  it("volta para a home sem UF", () => {
    expect(
      archiveStateToSharePath({
        uf: null,
        cat: "video",
        q: "x",
        tag: null,
        ordem: "recentes",
      }),
    ).toBe("/");
  });
});
