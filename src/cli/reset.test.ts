import { describe, expect, it } from "vitest";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function tmpDir() {
  return path.join(os.tmpdir(), `hvc-reset-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

describe("hyper:reset", () => {
  it("returns success when there is nothing to delete", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });

    const mod = await import("../../scripts/lib/reset.mjs");
    const code = await mod.runReset({
      repoRoot: root,
      confirm: async () => {
        throw new Error("confirm should not be called");
      },
      logger: console,
    });

    expect(code).toBe(0);
  });

  it("cancels without deleting anything", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, ".gitignore"), "dist/\n", "utf8");

    const mod = await import("../../scripts/lib/reset.mjs");
    const logs: string[] = [];
    const code = await mod.runReset({
      repoRoot: root,
      confirm: async () => false,
      logger: {
        log: (m: string) => logs.push(m),
        error: (m: string) => logs.push(`ERR:${m}`),
      },
    });

    expect(code).toBe(1);
    expect(() => readFileSync(path.join(root, ".gitignore"), "utf8")).not.toThrow();
  });

  it("deletes only the target directories and logs each deletion", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    mkdirSync(path.join(root, "coverage"), { recursive: true });
    mkdirSync(path.join(root, "node_modules"), { recursive: true });
    writeFileSync(path.join(root, ".gitignore"), "dist/\n", "utf8");
    writeFileSync(path.join(root, "keep.txt"), "ok", "utf8");

    const mod = await import("../../scripts/lib/reset.mjs");
    const logs: string[] = [];
    const code = await mod.runReset({
      repoRoot: root,
      confirm: async () => true,
      logger: {
        log: (m: string) => logs.push(m),
        error: (m: string) => logs.push(`ERR:${m}`),
      },
    });

    expect(code).toBe(0);
    expect(() => readFileSync(path.join(root, ".gitignore"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(root, "keep.txt"), "utf8")).not.toThrow();
    expect(logs.filter((l) => l.startsWith("DELETED:")).length).toBeGreaterThanOrEqual(3);
  });

  it("fails safely when a target escapes the repo root", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    const mod = await import("../../scripts/lib/reset.mjs");
    const code = await mod.runReset({
      repoRoot: root,
      targets: [".."],
      confirm: async () => true,
      logger: console,
    });
    expect(code).toBe(1);
  });

  it("refuses to delete symlinks", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    const fakeIo = {
      existsSync: () => true,
      lstatSync: () => ({ isSymbolicLink: () => true }),
      rmSync: () => undefined,
    };

    const mod = await import("../../scripts/lib/reset.mjs");
    const code = await mod.runReset({
      repoRoot: root,
      targets: ["dist"],
      confirm: async () => true,
      logger: { log: () => undefined, error: () => undefined },
      io: fakeIo,
    });
    expect(code).toBe(1);
  });
});
