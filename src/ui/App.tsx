import React, { useMemo, useState } from "react";
import { z } from "zod";
import { categories, entityRegistry, getEntityByName } from "../schemaRegistry";
import { describeSchema } from "./schemaDescribe";
import { SchemaTree } from "./SchemaTree";

function safeJsonStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function validateJson(schema: z.ZodTypeAny, text: string) {
  const parsed = JSON.parse(text) as unknown;
  return schema.safeParse(parsed);
}

export function App() {
  const first = entityRegistry[0]?.name ?? "";
  const [selectedName, setSelectedName] = useState<string>(first);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState<string>("");
  const selected = getEntityByName(selectedName) ?? entityRegistry[0];
  const [jsonText, setJsonText] = useState<string>(() =>
    selected ? safeJsonStringify(selected.example) : "{}",
  );
  const [validation, setValidation] = useState<{ ok: boolean; message: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entityRegistry.filter((e) => {
      if (category !== "All" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const schemaNode = useMemo(() => (selected ? describeSchema(selected.schema) : null), [selected]);

  function onSelect(name: string) {
    const e = getEntityByName(name);
    setSelectedName(name);
    setValidation(null);
    if (e) setJsonText(safeJsonStringify(e.example));
  }

  function onValidate() {
    if (!selected) return;
    try {
      const result = validateJson(selected.schema, jsonText);
      if (result.success) {
        setValidation({ ok: true, message: "Valid" });
        return;
      }
      setValidation({
        ok: false,
        message: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"),
      });
    } catch {
      setValidation({ ok: false, message: "Invalid JSON" });
    }
  }

  const container: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    height: "100vh",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#0f172a",
  };

  const sidebar: React.CSSProperties = {
    borderRight: "1px solid #e2e8f0",
    padding: 14,
    overflow: "auto",
  };

  const main: React.CSSProperties = {
    padding: 18,
    overflow: "auto",
  };

  const pill: React.CSSProperties = {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#334155",
  };

  return (
    <div style={container}>
      <aside style={sidebar}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Schema Explorer</div>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#475569" }}>Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Project, CI, ADR..."
              aria-label="Search"
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                outline: "none",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#475569" }}>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                outline: "none",
                background: "white",
              }}
            >
              <option value="All">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={pill}>{filtered.length} entities</span>
            <span style={{ ...pill, background: "#ecfeff", color: "#155e75" }}>Zod + TS</span>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((e) => {
            const selected = e.name === selectedName;
            return (
              <button
                key={e.name}
                onClick={() => onSelect(e.name)}
                style={{
                  textAlign: "left",
                  padding: "10px 10px",
                  borderRadius: 12,
                  border: selected ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                  background: selected ? "#f0f9ff" : "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div aria-label="Entity Name" style={{ fontWeight: 650 }}>
                    {e.name}
                  </div>
                  <span aria-label="Category" style={pill}>
                    {e.category}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{e.description}</div>
              </button>
            );
          })}
        </div>
      </aside>

      <main style={main}>
        {!selected ? (
          <div style={{ color: "#475569" }}>No entity selected.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div aria-label="Selected Entity" style={{ fontSize: 22, fontWeight: 800 }}>
                  {selected.name}
                </div>
                <div style={{ color: "#475569" }}>{selected.description}</div>
              </div>
              <span
                aria-label="Category"
                style={{ ...pill, background: "#fefce8", color: "#854d0e" }}
              >
                {selected.category}
              </span>
            </div>

            <section>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Schema</div>
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 12,
                  background: "#ffffff",
                }}
              >
                <div aria-label="Schema Tree" style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {schemaNode ? <SchemaTree node={schemaNode} name={selected.name} /> : null}
                </div>
              </div>
            </section>

            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Example / Validate</div>
                  <button
                    aria-label="Validate JSON"
                    onClick={onValidate}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Validate JSON
                  </button>
                </div>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  aria-label="Example JSON"
                  spellCheck={false}
                  style={{
                    width: "100%",
                    height: 360,
                    marginTop: 8,
                    padding: 10,
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12,
                    lineHeight: 1.4,
                    outline: "none",
                  }}
                />
                <div aria-label="Validation Result" style={{ marginTop: 8 }}>
                  {validation ? (
                    <div
                      style={{
                        marginTop: 8,
                        whiteSpace: "pre-wrap",
                        padding: 10,
                        borderRadius: 14,
                        border: `1px solid ${validation.ok ? "#16a34a" : "#dc2626"}`,
                        background: validation.ok ? "#f0fdf4" : "#fef2f2",
                        color: validation.ok ? "#14532d" : "#7f1d1d",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 12,
                      }}
                    >
                      {validation.message}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Notes</div>
                <div style={{ marginTop: 8, color: "#334155", lineHeight: 1.55 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li>
                      Quality gates are encoded as types where it matters (critical lint max is
                      always{" "}
                      <span
                        aria-label="Minimum Lint Score"
                        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                      >
                        0
                      </span>
                      ).
                    </li>
                    <li>
                      AI artifacts require{" "}
                      <span
                        aria-label="No Secrets Confirmed"
                        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                      >
                        noSecretsConfirmed: true
                      </span>{" "}
                      for merge-ready payloads.
                    </li>
                    <li>
                      Secret environment variables never include values; they reference a credential
                      store handle.
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
