import { describe, expect, it } from "vitest";
import { categories, entityRegistry, getEntityByName } from "./schemaRegistry";

describe("schema registry", () => {
  it("has unique entity names", () => {
    const names = entityRegistry.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("getEntityByName returns the correct entity", () => {
    const first = entityRegistry[0];
    expect(first).toBeTruthy();
    const found = getEntityByName(first.name);
    expect(found?.name).toBe(first.name);
  });

  it("registry categories are consistent", () => {
    const allowed = new Set<string>(categories);
    for (const e of entityRegistry) {
      expect(allowed.has(e.category)).toBe(true);
    }
  });
});
