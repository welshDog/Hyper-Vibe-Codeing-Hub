import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SchemaTree } from "./SchemaTree";
import type { SchemaNode } from "./schemaDescribe";

describe("SchemaTree", () => {
  it("renders object properties", () => {
    const node: SchemaNode = {
      kind: "object",
      properties: [
        { key: "id", optional: false, value: { kind: "string" } },
        { key: "count", optional: true, value: { kind: "number" } },
      ],
    };
    render(<SchemaTree node={node} name="Thing" />);
    expect(screen.getByText("Thing:")).toBeInTheDocument();
    expect(screen.getByText("id:")).toBeInTheDocument();
    expect(screen.getByText("count?:")).toBeInTheDocument();
  });

  it("renders unions and discriminated unions", () => {
    const unionNode: SchemaNode = {
      kind: "union",
      options: [{ kind: "string" }, { kind: "number" }],
    };
    render(<SchemaTree node={unionNode} name="Value" />);
    expect(screen.getByText("Value:")).toBeInTheDocument();
    expect(screen.getByText("option_1:")).toBeInTheDocument();
    expect(screen.getByText("option_2:")).toBeInTheDocument();

    const duNode: SchemaNode = {
      kind: "discriminatedUnion",
      discriminator: "type",
      options: [
        {
          kind: "object",
          properties: [{ key: "type", optional: false, value: { kind: "literal", value: "a" } }],
        },
        {
          kind: "object",
          properties: [{ key: "type", optional: false, value: { kind: "literal", value: "b" } }],
        },
      ],
    };
    render(<SchemaTree node={duNode} name="Event" />);
    expect(screen.getByText("Event:")).toBeInTheDocument();
    expect(screen.getByText("variant_1:")).toBeInTheDocument();
    expect(screen.getByText("variant_2:")).toBeInTheDocument();
  });

  it("renders arrays and wrappers", () => {
    const node: SchemaNode = {
      kind: "array",
      item: { kind: "optional", inner: { kind: "string" } },
    };
    render(<SchemaTree node={node} name="tags" />);
    expect(screen.getByText("tags[]:")).toBeInTheDocument();
  });

  it("renders without a name label", () => {
    render(<SchemaTree node={{ kind: "string" }} />);
    expect(screen.getByText("string")).toBeInTheDocument();
  });
});
