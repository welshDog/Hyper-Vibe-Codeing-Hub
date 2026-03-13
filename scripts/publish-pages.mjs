import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: false, ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function runNpm(args, options = {}) {
  const result = spawnSync("npm", args, { stdio: "inherit", shell: true, ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function gitResult(args, options = {}) {
  return spawnSync("git", args, { encoding: "utf8", shell: false, ...options });
}

function gitStdout(args, options = {}) {
  const result = gitResult(args, options);
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

function safeRemoveWorktree(workDir) {
  const result = gitResult(["worktree", "remove", "--force", workDir]);
  if (result.status === 0) return;
  fs.rmSync(workDir, { recursive: true, force: true });
}

function main() {
  const repoRoot = process.cwd();
  const remoteUrl =
    process.env.PAGES_REMOTE_URL ?? gitStdout(["config", "--get", "remote.origin.url"]);
  const repoName =
    process.env.PAGES_REPO_NAME ?? (remoteUrl ? parseRepoNameFromRemoteUrl(remoteUrl) : "");

  if (!repoName) {
    process.stderr.write(
      "Unable to determine repo name. Set PAGES_REPO_NAME (example: Hyper-Vibe-Codeing-Hub).\n",
    );
    process.exit(1);
  }

  const base = process.env.PAGES_BASE ?? `/${repoName}/`;
  runNpm(["run", "build"], { env: { ...process.env, VITE_BASE: base } });

  const distDir = path.join(repoRoot, "dist");
  if (!fs.existsSync(distDir)) {
    process.stderr.write("Missing dist/. Build failed.\n");
    process.exit(1);
  }

  const workDir = path.join(repoRoot, ".tmp", "gh-pages");
  fs.mkdirSync(path.dirname(workDir), { recursive: true });

  if (fs.existsSync(workDir)) {
    safeRemoveWorktree(workDir);
  }

  const branchExists =
    gitResult(["show-ref", "--verify", "--quiet", "refs/heads/gh-pages"]).status === 0;
  if (!branchExists) {
    run("git", ["branch", "gh-pages"]);
  }

  const addResult = gitResult(["worktree", "add", workDir, "gh-pages"]);
  if (addResult.status !== 0) {
    const orphan = gitResult(["worktree", "add", "--orphan", "gh-pages", workDir]);
    if (orphan.status !== 0) {
      process.stderr.write(orphan.stderr ?? "");
      process.exit(orphan.status ?? 1);
    }
  }

  emptyDir(workDir);
  copyDir(distDir, workDir);
  fs.writeFileSync(path.join(workDir, ".nojekyll"), "", "utf8");

  const sha = gitStdout(["rev-parse", "--short", "HEAD"]);
  run("git", ["-C", workDir, "add", "-A"]);
  const changed = gitStdout(["-C", workDir, "status", "--porcelain"]);
  if (!changed) {
    process.stdout.write("No changes to publish (site output identical).\n");
    safeRemoveWorktree(workDir);
    return;
  }

  const commit = gitResult(["-C", workDir, "commit", "-m", `Deploy ${sha || "site"}`]);
  if (commit.status !== 0) {
    process.stderr.write(commit.stderr ?? "");
    process.stderr.write(
      '\nIf this is your first deploy, configure git identity:\n  git config --global user.name "Your Name"\n  git config --global user.email "you@example.com"\n',
    );
    process.exit(commit.status ?? 1);
  }

  const dryRun = process.env.PAGES_DRY_RUN === "1";
  if (dryRun) {
    process.stdout.write("Dry run enabled (PAGES_DRY_RUN=1). Skipping push.\n");
  } else {
    run("git", ["push", "origin", "gh-pages"]);
  }
  safeRemoveWorktree(workDir);

  const pagesUrl = process.env.PAGES_URL ?? `https://<username>.github.io/${repoName}/`;
  process.stdout.write(
    `Published. If Pages is set to gh-pages branch, your site will be at: ${pagesUrl}\n`,
  );
}

main();
