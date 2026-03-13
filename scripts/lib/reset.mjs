import { rmSync, lstatSync, existsSync } from "node:fs";
import { resolveInsideRoot } from "./paths.mjs";

export function defaultTargets() {
  return ["dist", "coverage", "node_modules"];
}

export function planDeletions(repoRoot, targets) {
  return targets.map((t) => {
    const fullPath = resolveInsideRoot(repoRoot, t);
    return { target: t, fullPath };
  });
}

export function deletePath(fullPath, io = {}) {
  const exists = io.existsSync ?? existsSync;
  const lstat = io.lstatSync ?? lstatSync;
  const rm = io.rmSync ?? rmSync;

  if (!exists(fullPath)) return { deleted: false };
  const stat = lstat(fullPath);
  if (stat.isSymbolicLink()) {
    throw new Error(`Refusing to delete symlink: ${fullPath}`);
  }
  rm(fullPath, { recursive: true, force: true, maxRetries: 2, retryDelay: 50 });
  return { deleted: true };
}

export async function runReset({
  repoRoot,
  targets = defaultTargets(),
  confirm,
  logger = console,
  io,
} = {}) {
  const root = repoRoot ?? process.cwd();
  let planned;
  try {
    planned = planDeletions(root, targets);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(message);
    return 1;
  }
  const exists = io?.existsSync ?? existsSync;
  const toDelete = planned.filter((p) => exists(p.fullPath));

  if (toDelete.length === 0) {
    logger.log("Nothing to reset.");
    return 0;
  }

  const ok = await confirm?.({
    targets: toDelete.map((t) => t.target),
    paths: toDelete.map((t) => t.fullPath),
  });
  if (!ok) return 1;

  try {
    for (const p of toDelete) {
      deletePath(p.fullPath, io);
      logger.log(`DELETED: ${p.fullPath}`);
    }
    return 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(message);
    return 1;
  }
}
