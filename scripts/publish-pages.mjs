import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function readStdout(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: "utf8", shell: true });
  if (result.status !== 0) return "";
  return (result.stdout ?? "").trim();
}

function parseRepoNameFromRemoteUrl(url) {
  const cleaned = url.replace(/\.git$/, "");
  const parts = cleaned.split(/[/:]/).filter(Boolean);
  return parts.at(-1) ?? "";
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

function main() {
  const repoRoot = process.cwd();
  const remoteUrl = process.env.PAGES_REMOTE_URL ?? readStdout("git", ["config", "--get", "remote.origin.url"]);
  const repoName =
    process.env.PAGES_REPO_NAME ?? (remoteUrl ? parseRepoNameFromRemoteUrl(remoteUrl) : "");

  if (!repoName) {
    process.stderr.write(
      "Unable to determine repo name. Set PAGES_REPO_NAME (example: Hyper-Vibe-Codeing-Hub).\n",
    );
    process.exit(1);
  }

  const base = process.env.PAGES_BASE ?? `/${repoName}/`;
  run("npm", ["run", "build"], { env: { ...process.env, VITE_BASE: base } });

  const distDir = path.join(repoRoot, "dist");
  if (!fs.existsSync(distDir)) {
    process.stderr.write("Missing dist/. Build failed.\n");
    process.exit(1);
  }

  const workDir = path.join(repoRoot, ".tmp", "gh-pages");
  fs.mkdirSync(path.dirname(workDir), { recursive: true });

  if (fs.existsSync(workDir)) {
    run("git", ["worktree", "remove", "--force", workDir]);
  }

  const branchExists =
    readStdout("git", ["show-ref", "--verify", "--quiet", "refs/heads/gh-pages"]) === "";
  if (!branchExists) {
    run("git", ["branch", "gh-pages"]);
  }

  run("git", ["worktree", "add", workDir, "gh-pages"]);

  emptyDir(workDir);
  copyDir(distDir, workDir);

  const sha = readStdout("git", ["rev-parse", "--short", "HEAD"]);
  run("git", ["-C", workDir, "add", "-A"]);
  run("git", ["-C", workDir, "commit", "-m", `Deploy ${sha || "site"}`]);
  run("git", ["push", "origin", "gh-pages"]);
  run("git", ["worktree", "remove", "--force", workDir]);

  const pagesUrl = process.env.PAGES_URL ?? `https://<username>.github.io/${repoName}/`;
  process.stdout.write(`Published. If Pages is set to gh-pages branch, your site will be at: ${pagesUrl}\n`);
}

main();

