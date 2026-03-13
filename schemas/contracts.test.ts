import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { entityRegistry } from "../src/schemaRegistry";
import { describeSchema } from "../src/ui/schemaDescribe";

function loadJson(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
}

describe("schemas/contracts", () => {
  it("has a canonical JSON file for every entity", () => {
    const dir = path.join(process.cwd(), "schemas", "entities");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const names = new Set(files.map((f) => f.replace(/\.json$/, "")));
    for (const e of entityRegistry) {
      expect(names.has(e.name)).toBe(true);
    }
  });

  it("validates each canonical payload and snapshots schema shape", () => {
    const dir = path.join(process.cwd(), "schemas", "entities");

    for (const e of entityRegistry) {
      const samplePath = path.join(dir, `${e.name}.json`);
      const sample = loadJson(samplePath);
      const parsed = e.schema.safeParse(sample);
      expect(parsed.success).toBe(true);

      const shape = describeSchema(e.schema);
      expect(shape).toMatchSnapshot(e.name);
    }
  });
});

