import { describe, expect, it } from "vitest";
import os from "node:os";
import path from "node:path";

describe("paths", () => {
  it("resolves paths inside the repo root", async () => {
    const mod = await import("../../scripts/lib/paths.mjs");
    const root = path.join(os.tmpdir(), "hvc-paths-root");
    const resolved = mod.resolveInsideRoot(root, "dist");
    expect(resolved).toContain(path.join(root, "dist"));
  });

  it("rejects paths that escape the repo root", async () => {
    const mod = await import("../../scripts/lib/paths.mjs");
    const root = path.join(os.tmpdir(), "hvc-paths-root");
    expect(() => mod.resolveInsideRoot(root, "..")).toThrow();
  });

  it("allows resolving the repo root itself", async () => {
    const mod = await import("../../scripts/lib/paths.mjs");
    const root = path.join(os.tmpdir(), "hvc-paths-root");
    const resolved = mod.resolveInsideRoot(root, ".");
    expect(resolved).toContain(root);
  });
});
