import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("não deixa o conteúdo fechar a tag script", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
  });

  it("continua sendo JSON válido com o mesmo conteúdo", () => {
    const data = { name: "a < b & c > d", list: [String.fromCharCode(0x2028)] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
