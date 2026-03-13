import React from "react";
import type { SchemaNode } from "./schemaDescribe";
import { schemaSummary } from "./schemaDescribe";

type Props = {
  node: SchemaNode;
  depth?: number;
  name?: string;
};

export function SchemaTree({ node, depth = 0, name }: Props) {
  const pad = { paddingLeft: depth * 14 };
  const headerStyle: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "baseline",
    ...pad,
  };

  if (node.kind === "object") {
    return (
      <div>
        <div style={headerStyle}>
          <span aria-label="Property Name" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {name ? `${name}:` : ""}
          </span>
          <span aria-label="Property Type" style={{ color: "#0f766e", fontWeight: 600 }}>{schemaSummary(node)}</span>
        </div>
        <div>
          {node.properties.map((p) => (
            <SchemaTree
              key={p.key}
              node={p.value}
              depth={depth + 1}
              name={`${p.key}${p.optional ? "?" : ""}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (node.kind === "union") {
    return (
      <div>
        <div style={headerStyle}>
          <span aria-label="Union Name" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {name ? `${name}:` : ""}
          </span>
          <span aria-label="Union Type" style={{ color: "#7c3aed", fontWeight: 600 }}>{schemaSummary(node)}</span>
        </div>
        <div>
          {node.options.map((o, idx) => (
            <SchemaTree key={idx} node={o} depth={depth + 1} name={`option_${idx + 1}`} />
          ))}
        </div>
      </div>
    );
  }

  if (node.kind === "discriminatedUnion") {
    return (
      <div>
        <div style={headerStyle}>
          <span aria-label="Discriminated Union Name" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {name ? `${name}:` : ""}
          </span>
          <span aria-label="Discriminated Union Type" style={{ color: "#7c3aed", fontWeight: 600 }}>{schemaSummary(node)}</span>
        </div>
        <div>
          {node.options.map((o, idx) => (
            <SchemaTree key={idx} node={o} depth={depth + 1} name={`variant_${idx + 1}`} />
          ))}
        </div>
      </div>
    );
  }

  if (node.kind === "array") {
    return <SchemaTree node={node.item} depth={depth} name={name ? `${name}[]` : "array"} />;
  }

  if (node.kind === "optional" || node.kind === "nullable" || node.kind === "default" || node.kind === "effects") {
    return <SchemaTree node={node.inner} depth={depth} name={name} />;
  }

  return (
    <div style={headerStyle}>
      <span aria-label="Schema Name" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
        {name ? `${name}:` : ""}
      </span>
      <span aria-label="Schema Summary" style={{ color: "#0f172a" }}>{schemaSummary(node)}</span>
    </div>
  );
}

