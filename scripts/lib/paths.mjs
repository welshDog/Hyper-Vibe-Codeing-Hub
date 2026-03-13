import path from "node:path";

export function resolveInsideRoot(repoRoot, relativePath) {
  const root = path.resolve(repoRoot);
  const resolved = path.resolve(root, relativePath);
  const normalizedRoot = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved === root) return resolved;
  if (!resolved.startsWith(normalizedRoot)) {
    throw new Error(`Refusing to access path outside repo root: ${relativePath}`);
  }
  return resolved;
}

