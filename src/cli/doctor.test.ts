import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";

function tmpDir() {
  return path.join(os.tmpdir(), `hvc-doctor-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

describe("hyper:doctor", () => {
  it("fails when engines.node is missing", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "x" }), "utf8");
    writeFileSync(path.join(root, ".env.example"), "FOO=bar\n", "utf8");
    writeFileSync(path.join(root, ".env"), "FOO=ok\n", "utf8");

    const mod = await import("../../scripts/lib/doctor.mjs");
    const result = await mod.runDoctor({
      repoRoot: root,
      nodeVersion: "v99.0.0",
      ports: [],
      color: false,
      env: {},
    });

    expect(result.ok).toBe(false);
    expect(result.report).toContain('Add "engines.node"');
  });

  it("detects a free port using the real checker", async () => {
    const mod = await import("../../scripts/lib/doctor.mjs");
    const free = await mod.isPortFree(0);
    expect(typeof free).toBe("boolean");
  });

  it("handles unknown color names", async () => {
    const mod = await import("../../scripts/lib/doctor.mjs");
    const colored = mod.colorize(true, "not-a-color", "X");
    expect(colored).toContain("X");
  });

  it("passes node + env checks when requirements are met", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ engines: { node: ">=20.0.0" } }),
      "utf8",
    );
    writeFileSync(path.join(root, ".env.example"), "A=1\nB=2\n", "utf8");
    writeFileSync(path.join(root, ".env"), "A=ok\nB=ok\n", "utf8");

    const mod = await import("../../scripts/lib/doctor.mjs");
    const result = await mod.runDoctor({
      repoRoot: root,
      nodeVersion: "v20.0.0",
      ports: [],
      diskFreeBytes: 2 * 1024 * 1024 * 1024,
      color: false,
      env: {},
    });

    const checks = result.checks as Array<{ id: string; ok: boolean; hint: string }>;
    const node = checks.find((c) => c.id === "node");
    const envCheck = checks.find((c) => c.id === "env");
    expect(node?.ok).toBe(true);
    expect(envCheck?.ok).toBe(true);
  });

  it("fails when a required env var is missing or empty", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ engines: { node: ">=20.0.0" } }),
      "utf8",
    );
    writeFileSync(path.join(root, ".env.example"), "NEEDED=1\n", "utf8");
    writeFileSync(path.join(root, ".env"), "NEEDED=\n", "utf8");

    const mod = await import("../../scripts/lib/doctor.mjs");
    const result = await mod.runDoctor({
      repoRoot: root,
      nodeVersion: "v20.0.0",
      ports: [],
      diskFreeBytes: 2 * 1024 * 1024 * 1024,
      color: false,
      env: {},
    });

    expect(result.ok).toBe(false);
    const checks = result.checks as Array<{ id: string; ok: boolean; hint: string }>;
    const envCheck = checks.find((c) => c.id === "env");
    expect(envCheck?.ok).toBe(false);
    expect(envCheck?.hint).toContain("NEEDED");
  });

  it("fails when disk space is below 1 GB", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ engines: { node: ">=20.0.0" } }),
      "utf8",
    );
    writeFileSync(path.join(root, ".env.example"), "", "utf8");

    const mod = await import("../../scripts/lib/doctor.mjs");
    const result = await mod.runDoctor({
      repoRoot: root,
      nodeVersion: "v20.0.0",
      ports: [],
      diskFreeBytes: 512 * 1024 * 1024,
      color: false,
      env: {},
    });

    const checks = result.checks as Array<{ id: string; ok: boolean }>;
    expect(checks.find((c) => c.id === "disk")?.ok).toBe(false);
  });

  it("reports disk space as unknown when it cannot be determined", async () => {
    const mod = await import("../../scripts/lib/doctor.mjs");
    const result = await mod.runDoctor({
      repoRoot: path.join(tmpDir(), "does-not-exist"),
      nodeVersion: "v20.0.0",
      ports: [],
      color: false,
      env: {},
    });
    expect(result.report).toContain("Disk space (unknown)");
  });

  it("fails when a port is busy unless allowed", async () => {
    const server = net.createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const address = server.address();
    if (address === null || typeof address === "string")
      throw new Error("Unexpected server address");
    const port = address.port;

    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ engines: { node: ">=20.0.0" } }),
      "utf8",
    );
    writeFileSync(path.join(root, ".env.example"), "", "utf8");

    const mod = await import("../../scripts/lib/doctor.mjs");
    const busy = await mod.runDoctor({
      repoRoot: root,
      nodeVersion: "v20.0.0",
      ports: [port],
      diskFreeBytes: 2 * 1024 * 1024 * 1024,
      color: false,
      env: {},
      portChecker: async () => false,
    });
    expect(busy.ok).toBe(false);

    const allowed = await mod.runDoctor({
      repoRoot: root,
      nodeVersion: "v20.0.0",
      ports: [port],
      diskFreeBytes: 2 * 1024 * 1024 * 1024,
      color: false,
      env: { HYPER_ALLOW_PORTS: String(port) },
      portChecker: async () => false,
    });
    expect(allowed.ok).toBe(true);

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
