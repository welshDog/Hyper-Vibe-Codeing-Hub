import { describe, expect, it } from "vitest";
import { z } from "zod";
import { describeSchema, schemaSummary } from "./schemaDescribe";

describe("schemaDescribe", () => {
  it("describes primitives and literals", () => {
    expect(describeSchema(z.string()).kind).toBe("string");
    expect(describeSchema(z.number()).kind).toBe("number");
    const lit = describeSchema(z.literal(123));
    expect(lit.kind).toBe("literal");
    expect(schemaSummary(lit)).toBe("literal(123)");
  });

  it("describes objects, arrays, unions, and optional", () => {
    const schema = z
      .object({
        id: z.string(),
        count: z.number().optional(),
      })
      .strict();
    const obj = describeSchema(schema);
    expect(obj.kind).toBe("object");

    const arr = describeSchema(z.array(z.string()));
    expect(arr.kind).toBe("array");

    const un = describeSchema(z.union([z.string(), z.number()]));
    expect(un.kind).toBe("union");

    const opt = describeSchema(z.string().optional());
    expect(opt.kind).toBe("optional");
  });

  it("describes tuples, records, intersections, defaults, and effects", () => {
    const tuple = describeSchema(z.tuple([z.string(), z.number()]));
    expect(tuple.kind).toBe("tuple");

    const record = describeSchema(z.record(z.string(), z.number()));
    expect(record.kind).toBe("record");

    const intersection = describeSchema(z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() })));
    expect(intersection.kind).toBe("intersection");

    const def = describeSchema(z.string().default("x"));
    expect(def.kind).toBe("default");

    const eff = describeSchema(z.string().transform((v) => v));
    expect(eff.kind).toBe("effects");
  });

  it("describes discriminated unions and native enums", () => {
    const du = describeSchema(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), value: z.string() }),
        z.object({ type: z.literal("b"), value: z.number() }),
      ]),
    );
    expect(du.kind).toBe("discriminatedUnion");

    enum Color {
      Red = "red",
      Blue = "blue",
    }
    const ne = describeSchema(z.nativeEnum(Color));
    expect(ne.kind).toBe("enum");
  });
});
