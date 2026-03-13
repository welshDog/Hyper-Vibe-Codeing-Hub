import { z } from "zod";

export type SchemaNode =
  | { kind: "string" | "number" | "boolean" | "date" | "unknown" | "any" | "never"; label?: string }
  | { kind: "literal"; value: unknown; label?: string }
  | { kind: "enum"; values: string[]; label?: string }
  | { kind: "array"; item: SchemaNode; label?: string }
  | { kind: "tuple"; items: SchemaNode[]; label?: string }
  | { kind: "record"; key: SchemaNode; value: SchemaNode; label?: string }
  | {
      kind: "object";
      properties: { key: string; value: SchemaNode; optional: boolean }[];
      label?: string;
    }
  | { kind: "union"; options: SchemaNode[]; label?: string }
  | { kind: "intersection"; left: SchemaNode; right: SchemaNode; label?: string }
  | { kind: "discriminatedUnion"; discriminator: string; options: SchemaNode[]; label?: string }
  | { kind: "optional"; inner: SchemaNode; label?: string }
  | { kind: "nullable"; inner: SchemaNode; label?: string }
  | { kind: "default"; inner: SchemaNode; label?: string }
  | { kind: "effects"; inner: SchemaNode; label?: string };

export function describeSchema(schema: z.ZodTypeAny): SchemaNode {
  const t = (schema as z.ZodTypeAny)._def?.typeName as string | undefined;

  if (t === z.ZodFirstPartyTypeKind.ZodString) return { kind: "string" };
  if (t === z.ZodFirstPartyTypeKind.ZodNumber) return { kind: "number" };
  if (t === z.ZodFirstPartyTypeKind.ZodBoolean) return { kind: "boolean" };
  if (t === z.ZodFirstPartyTypeKind.ZodDate) return { kind: "date" };
  if (t === z.ZodFirstPartyTypeKind.ZodAny) return { kind: "any" };
  if (t === z.ZodFirstPartyTypeKind.ZodNever) return { kind: "never" };
  if (t === z.ZodFirstPartyTypeKind.ZodUnknown) return { kind: "unknown" };

  if (t === z.ZodFirstPartyTypeKind.ZodLiteral) {
    return { kind: "literal", value: (schema as z.ZodLiteral<unknown>)._def.value };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodEnum) {
    return { kind: "enum", values: [...(schema as z.ZodEnum<[string, ...string[]]>)._def.values] };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodNativeEnum) {
    const values = Object.values(
      (schema as unknown as { _def: { values: Record<string, unknown> } })._def.values,
    ).filter((v) => typeof v === "string") as string[];
    return { kind: "enum", values: [...new Set(values)] };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodArray) {
    const item = (schema as z.ZodArray<z.ZodTypeAny>)._def.type;
    return { kind: "array", item: describeSchema(item) };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodTuple) {
    const items = (schema as unknown as { _def: { items: z.ZodTypeAny[] } })._def.items;
    return { kind: "tuple", items: items.map(describeSchema) };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodRecord) {
    const def = (schema as z.ZodRecord<z.ZodTypeAny, z.ZodTypeAny>)._def;
    return {
      kind: "record",
      key: describeSchema(def.keyType),
      value: describeSchema(def.valueType),
    };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodObject) {
    const obj = schema as z.AnyZodObject;
    const shape = obj.shape as Record<string, z.ZodTypeAny>;
    const properties = Object.entries(shape).map(([key, value]) => {
      const isOptional = value.isOptional();
      return { key, value: describeSchema(value), optional: isOptional };
    });
    properties.sort((a, b) => a.key.localeCompare(b.key));
    return { kind: "object", properties };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodUnion) {
    const options = (schema as unknown as { _def: { options: z.ZodTypeAny[] } })._def.options;
    return { kind: "union", options: options.map(describeSchema) };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion) {
    const du = schema as unknown as { discriminator: string; options: Map<string, z.ZodTypeAny> };
    const options = Array.from(du.options.values()).map((s) => describeSchema(s));
    return { kind: "discriminatedUnion", discriminator: du.discriminator, options };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodIntersection) {
    const i = schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>;
    return {
      kind: "intersection",
      left: describeSchema(i._def.left),
      right: describeSchema(i._def.right),
    };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodOptional) {
    const inner = (schema as z.ZodOptional<z.ZodTypeAny>)._def.innerType;
    return { kind: "optional", inner: describeSchema(inner) };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodNullable) {
    const inner = (schema as z.ZodNullable<z.ZodTypeAny>)._def.innerType;
    return { kind: "nullable", inner: describeSchema(inner) };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodDefault) {
    const inner = (schema as z.ZodDefault<z.ZodTypeAny>)._def.innerType;
    return { kind: "default", inner: describeSchema(inner) };
  }

  if (t === z.ZodFirstPartyTypeKind.ZodEffects) {
    const inner = (schema as z.ZodEffects<z.ZodTypeAny>)._def.schema;
    return { kind: "effects", inner: describeSchema(inner) };
  }

  return { kind: "unknown" };
}

export function schemaSummary(node: SchemaNode): string {
  switch (node.kind) {
    case "string":
    case "number":
    case "boolean":
    case "date":
    case "any":
    case "never":
    case "unknown":
      return node.kind;
    case "literal":
      return `literal(${JSON.stringify(node.value)})`;
    case "enum":
      return `enum(${node.values.join(" | ")})`;
    case "array":
      return `${schemaSummary(node.item)}[]`;
    case "tuple":
      return `[${node.items.map(schemaSummary).join(", ")}]`;
    case "record":
      return `record<${schemaSummary(node.key)}, ${schemaSummary(node.value)}>`;
    case "object":
      return "object";
    case "union":
      return node.options.map(schemaSummary).join(" | ");
    case "intersection":
      return `${schemaSummary(node.left)} & ${schemaSummary(node.right)}`;
    case "discriminatedUnion":
      return `discriminatedUnion(${node.discriminator})`;
    case "optional":
      return `${schemaSummary(node.inner)} | undefined`;
    case "nullable":
      return `${schemaSummary(node.inner)} | null`;
    case "default":
    case "effects":
      return schemaSummary(node.inner);
  }
}
