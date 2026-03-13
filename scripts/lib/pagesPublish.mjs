import fs from "node:fs";
import path from "node:path";
import { spawnSync as nodeSpawnSync } from "node:child_process";

export function parseRepoNameFromRemoteUrl(url) {
  const cleaned = url.replace(/\.git$/, "");
  const parts = cleaned.split(/[/:]/).filter(Boolean);
  return parts.at(-1) ?? "";
}

export function parseOwnerFromRemoteUrl(url) {
  const cleaned = url.replace(/\.git$/, "");
  const githubMatch = cleaned.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  if (githubMatch) return githubMatch[1] ?? "";
  const sshMatch = cleaned.match(/^git@github\.com:([^/]+)\/([^/]+)$/);
  if (sshMatch) return sshMatch[1] ?? "";
  return "";
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

function formatCmd(cmd, args) {
  return `${cmd} ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(" ")}`;
}

export function createPublisher({ spawnSync = nodeSpawnSync } = {}) {
  const gitResult = (args, options = {}) =>
    spawnSync("git", args, { encoding: "utf8", shell: false, ...options });

  const gitStdout = (args, options = {}) => {
    const result = gitResult(args, options);
    if (result.status !== 0) return "";
    return (result.stdout ?? "").trim();
  };

  const npmRun = (args, options = {}) => {
    const result = spawnSync("npm", args, { stdio: "inherit", shell: true, ...options });
    if (result.status !== 0) {
      throw new Error(`npm failed: npm ${args.join(" ")}`);
    }
  };

  const runGit = (args, options = {}) => {
    const result = gitResult(args, options);
    if (result.status !== 0) {
      const stderr = (result.stderr ?? "").trim();
      throw new Error(`${formatCmd("git", args)}\n${stderr}`);
    }
    return result;
  };

  const safeRemoveWorktree = (workDir) => {
    const result = gitResult(["worktree", "remove", "--force", workDir]);
    if (result.status === 0) return;
    fs.rmSync(workDir, { recursive: true, force: true });
  };

  const addWorktree = (workDir, branchName) => {
    const add = gitResult(["worktree", "add", workDir, branchName]);
    if (add.status === 0) return;

    const stderr = (add.stderr ?? "").trim();
    const orphan = gitResult(["worktree", "add", "--orphan", "-B", branchName, workDir]);
    if (orphan.status === 0) return;

    const orphanErr = (orphan.stderr ?? "").trim();
    throw new Error(
      `Failed to create worktree.\n${stderr}\n${orphanErr}\n` +
        `Try:\n- git worktree list\n- remove the folder ${workDir}\n`,
    );
  };

  const publishPages = ({
    repoRoot = process.cwd(),
    env = process.env,
    logger = console,
  } = {}) => {
    const remoteUrl = env.PAGES_REMOTE_URL ?? gitStdout(["config", "--get", "remote.origin.url"]);
    const repoName = env.PAGES_REPO_NAME ?? (remoteUrl ? parseRepoNameFromRemoteUrl(remoteUrl) : "");
    const owner = parseOwnerFromRemoteUrl(remoteUrl);

    if (!repoName) {
      throw new Error(
        "Unable to determine repo name. Set PAGES_REPO_NAME (example: Hyper-Vibe-Codeing-Hub).",
      );
    }

    const base = env.PAGES_BASE ?? `/${repoName}/`;
    if (env.PAGES_SKIP_BUILD !== "1") {
      npmRun(["run", "build"], { cwd: repoRoot, env: { ...env, VITE_BASE: base } });
    }

    const distDir = path.join(repoRoot, "dist");
    if (!fs.existsSync(distDir)) {
      throw new Error("Missing dist/. Run npm run build first.");
    }

    const workDir = path.join(repoRoot, ".tmp", "gh-pages");
    fs.mkdirSync(path.dirname(workDir), { recursive: true });

    if (fs.existsSync(workDir)) {
      safeRemoveWorktree(workDir);
    }

    const branchName = "gh-pages";
    const branchExists = gitResult(["show-ref", "--verify", "--quiet", `refs/heads/${branchName}`]).status === 0;
    if (!branchExists) {
      const branch = gitResult(["branch", branchName]);
      if (branch.status !== 0) {
        throw new Error((branch.stderr ?? "").trim() || "Failed to create gh-pages branch.");
      }
    }

    addWorktree(workDir, branchName);

    emptyDir(workDir);
    copyDir(distDir, workDir);
    fs.writeFileSync(path.join(workDir, ".nojekyll"), "", "utf8");

    const sha = gitStdout(["rev-parse", "--short", "HEAD"]);
    runGit(["-C", workDir, "add", "-A"]);

    const changed = gitStdout(["-C", workDir, "status", "--porcelain"]);
    if (!changed) {
      logger.log("No changes to publish (site output identical).");
      safeRemoveWorktree(workDir);
      return { pushed: false, url: owner ? `https://${owner}.github.io/${repoName}/` : "" };
    }

    const commit = gitResult(["-C", workDir, "commit", "-m", `Deploy ${sha || "site"}`]);
    if (commit.status !== 0) {
      const stderr = (commit.stderr ?? "").trim();
      throw new Error(
        `${stderr}\n` +
          `If this is your first deploy, configure git identity:\n` +
          `  git config --global user.name "Your Name"\n` +
          `  git config --global user.email "you@example.com"\n`,
      );
    }

    const dryRun = env.PAGES_DRY_RUN === "1";
    if (dryRun) {
      logger.log("Dry run enabled (PAGES_DRY_RUN=1). Skipping push.");
      safeRemoveWorktree(workDir);
      return { pushed: false, url: owner ? `https://${owner}.github.io/${repoName}/` : "" };
    }

    runGit(["push", "origin", branchName], { cwd: repoRoot });
    safeRemoveWorktree(workDir);

    return { pushed: true, url: owner ? `https://${owner}.github.io/${repoName}/` : "" };
  };

  return { publishPages, gitResult, gitStdout };
}

