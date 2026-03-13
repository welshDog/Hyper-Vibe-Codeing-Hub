import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function tmpDir() {
  return path.join(os.tmpdir(), `hvc-pages-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

type SpawnCall = { cmd: string; args: string[] };

type SpawnResult = { status: number; stdout?: string; stderr?: string };
type SpawnHandler = (cmd: string, args: string[]) => SpawnResult | null | undefined;

function makeSpawnMock(handlers: SpawnHandler[]) {
  const calls: SpawnCall[] = [];
  const spawnSync = (cmd: string, args: string[], options: unknown) => {
    void options;
    calls.push({ cmd, args });
    for (const h of handlers) {
      const r = h(cmd, args);
      if (r) return r;
    }
    return { status: 0, stdout: "", stderr: "" } satisfies SpawnResult;
  };
  return { spawnSync, calls };
}

describe("pages publish", () => {
  it("parses owner from GitHub HTTPS and SSH remotes", async () => {
    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    expect(
      mod.parseOwnerFromRemoteUrl("https://github.com/welshDog/Hyper-Vibe-Codeing-Hub.git"),
    ).toBe("welshDog");
    expect(mod.parseOwnerFromRemoteUrl("git@github.com:welshDog/Hyper-Vibe-Codeing-Hub.git")).toBe(
      "welshDog",
    );
    expect(mod.parseOwnerFromRemoteUrl("https://example.com/other/repo.git")).toBe("");
  });

  it("parses repo name from remote url and handles empty input", async () => {
    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    expect(
      mod.parseRepoNameFromRemoteUrl("https://github.com/welshDog/Hyper-Vibe-Codeing-Hub.git"),
    ).toBe("Hyper-Vibe-Codeing-Hub");
    expect(mod.parseRepoNameFromRemoteUrl("")).toBe("");
  });

  it("uses orphan fallback with correct git args (no commit-ish)", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");

    const { spawnSync, calls } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return { status: 0, stdout: "https://github.com/a/b.git\n", stderr: "" };
        if (cmd === "git" && args[0] === "show-ref") return { status: 0, stdout: "", stderr: "" };
        if (
          cmd === "git" &&
          args[0] === "worktree" &&
          args[1] === "add" &&
          args[2] === path.join(root, ".tmp", "gh-pages")
        )
          return { status: 1, stdout: "", stderr: "fail\n" };
        if (
          cmd === "git" &&
          args[0] === "worktree" &&
          args[1] === "add" &&
          args.includes("--orphan")
        )
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "status")
          return { status: 0, stdout: "", stderr: "" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1" };
    publishPages({
      repoRoot: root,
      env,
      logger: { log: () => undefined },
    });

    const orphanCall = calls.find(
      (c) =>
        c.cmd === "git" &&
        c.args[0] === "worktree" &&
        c.args[1] === "add" &&
        c.args.includes("--orphan"),
    );
    expect(orphanCall?.args).toEqual([
      "worktree",
      "add",
      "--orphan",
      "-B",
      "gh-pages",
      path.join(root, ".tmp", "gh-pages"),
    ]);
  });

  it("throws a helpful error when repo name cannot be determined", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");

    const { spawnSync } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config") return { status: 1, stdout: "", stderr: "" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1" };
    expect(() =>
      publishPages({
        repoRoot: root,
        env,
        logger: console,
      }),
    ).toThrow(/PAGES_REPO_NAME/);
  });

  it("returns pushed=false when there are no changes to publish", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");

    const { spawnSync } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return {
            status: 0,
            stdout: "https://github.com/welshDog/Hyper-Vibe-Codeing-Hub.git\n",
            stderr: "",
          };
        if (cmd === "git" && args[0] === "show-ref") return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "worktree" && args[1] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "status")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "worktree" && args[1] === "remove")
          return { status: 0, stdout: "", stderr: "" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1" };
    const result = publishPages({ repoRoot: root, env, logger: { log: () => undefined } });
    expect(result.pushed).toBe(false);
    expect(result.url).toContain("https://welshDog.github.io/Hyper-Vibe-Codeing-Hub/");
  });

  it("skips push when PAGES_DRY_RUN=1 and returns pushed=false", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");

    const { spawnSync, calls } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return {
            status: 0,
            stdout: "https://github.com/welshDog/Hyper-Vibe-Codeing-Hub.git\n",
            stderr: "",
          };
        if (cmd === "git" && args[0] === "show-ref") return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "worktree" && args[1] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "status")
          return { status: 0, stdout: "M index.html\n", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "commit")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "worktree" && args[1] === "remove")
          return { status: 0, stdout: "", stderr: "" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1", PAGES_DRY_RUN: "1" };
    const result = publishPages({ repoRoot: root, env, logger: { log: () => undefined } });
    expect(result.pushed).toBe(false);
    expect(calls.some((c) => c.cmd === "git" && c.args[0] === "push")).toBe(false);
  });

  it("publishes and pushes when there are changes and not a dry run", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist", "assets"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");
    writeFileSync(path.join(root, "dist", "assets", "app.js"), "x", "utf8");

    const workDir = path.join(root, ".tmp", "gh-pages");
    mkdirSync(workDir, { recursive: true });
    writeFileSync(path.join(workDir, "old.txt"), "old", "utf8");

    const { spawnSync, calls } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return {
            status: 0,
            stdout: "https://github.com/welshDog/Hyper-Vibe-Codeing-Hub.git\n",
            stderr: "",
          };
        if (cmd === "git" && args[0] === "show-ref") return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "worktree" && args[1] === "remove")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "worktree" && args[1] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "status")
          return { status: 0, stdout: "M index.html\n", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "commit")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "push") return { status: 0, stdout: "", stderr: "" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1" };
    const result = publishPages({ repoRoot: root, env, logger: { log: () => undefined } });
    expect(result.pushed).toBe(true);
    expect(calls.some((c) => c.cmd === "git" && c.args[0] === "push")).toBe(true);
  });

  it("throws a helpful error when commit fails (missing git identity)", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");

    const { spawnSync } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return {
            status: 0,
            stdout: "https://github.com/welshDog/Hyper-Vibe-Codeing-Hub.git\n",
            stderr: "",
          };
        if (cmd === "git" && args[0] === "show-ref") return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "worktree" && args[1] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "add")
          return { status: 0, stdout: "", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "status")
          return { status: 0, stdout: "M index.html\n", stderr: "" };
        if (cmd === "git" && args[0] === "-C" && args[2] === "commit")
          return { status: 1, stdout: "", stderr: "Author identity unknown" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1" };
    expect(() => publishPages({ repoRoot: root, env, logger: console })).toThrow(
      /configure git identity/,
    );
  });

  it("throws when dist/ is missing", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });

    const { spawnSync } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return { status: 0, stdout: "https://github.com/a/b.git\n", stderr: "" };
        if (cmd === "git" && args[0] === "show-ref") return { status: 0, stdout: "", stderr: "" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1" };
    expect(() => publishPages({ repoRoot: root, env, logger: console })).toThrow(/Missing dist/);
  });

  it("throws when npm build fails (PAGES_SKIP_BUILD not set)", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");

    const { spawnSync } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return { status: 0, stdout: "https://github.com/a/b.git\n", stderr: "" };
        if (cmd === "npm" && args[0] === "run" && args[1] === "build")
          return { status: 1, stdout: "", stderr: "" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    expect(() => publishPages({ repoRoot: root, env: {}, logger: console })).toThrow(/npm failed/);
  });

  it("throws when both worktree add and orphan fallback fail", async () => {
    const root = tmpDir();
    mkdirSync(root, { recursive: true });
    mkdirSync(path.join(root, "dist"), { recursive: true });
    writeFileSync(path.join(root, "dist", "index.html"), "<html></html>", "utf8");

    const { spawnSync } = makeSpawnMock([
      (cmd, args) => {
        if (cmd === "git" && args[0] === "config")
          return { status: 0, stdout: "https://github.com/a/b.git\n", stderr: "" };
        if (cmd === "git" && args[0] === "show-ref") return { status: 0, stdout: "", stderr: "" };
        if (
          cmd === "git" &&
          args[0] === "worktree" &&
          args[1] === "add" &&
          !args.includes("--orphan")
        )
          return { status: 1, stdout: "", stderr: "worktree add failed" };
        if (
          cmd === "git" &&
          args[0] === "worktree" &&
          args[1] === "add" &&
          args.includes("--orphan")
        )
          return { status: 1, stdout: "", stderr: "orphan failed" };
        return null;
      },
    ]);

    const mod = await import("../../scripts/lib/pagesPublish.mjs");
    const { publishPages } = mod.createPublisher({ spawnSync });
    const env: Record<string, string> = { PAGES_SKIP_BUILD: "1" };
    expect(() => publishPages({ repoRoot: root, env, logger: console })).toThrow(
      /Failed to create worktree/,
    );
  });
});
