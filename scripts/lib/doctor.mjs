import fs from "node:fs";
import path from "node:path";
import net from "node:net";

function parseDotenv(contents) {
  const lines = contents.split(/\r?\n/);
  const map = new Map();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    map.set(key, value);
  }
  return map;
}

export function loadEnvFiles(repoRoot) {
  const examplePath = path.join(repoRoot, ".env.example");
  const envPath = path.join(repoRoot, ".env");

  const required = new Set();
  if (fs.existsSync(examplePath)) {
    const m = parseDotenv(fs.readFileSync(examplePath, "utf8"));
    for (const k of m.keys()) required.add(k);
  }

  const envFromFile = new Map();
  if (fs.existsSync(envPath)) {
    const m = parseDotenv(fs.readFileSync(envPath, "utf8"));
    for (const [k, v] of m.entries()) envFromFile.set(k, v);
  }

  return { required: [...required], envFromFile };
}

export function parseMinNode(enginesNode) {
  if (typeof enginesNode !== "string") return null;
  const m = enginesNode.match(/>=\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!m) return null;
  const major = Number(m[1] ?? 0);
  const minor = Number(m[2] ?? 0);
  const patch = Number(m[3] ?? 0);
  return { major, minor, patch };
}

export function parseNodeVersion(nodeVersion) {
  const v = nodeVersion.startsWith("v") ? nodeVersion.slice(1) : nodeVersion;
  const [maj, min, pat] = v.split(".").map((s) => Number(s));
  return { major: maj ?? 0, minor: min ?? 0, patch: pat ?? 0 };
}

export function isVersionGte(a, b) {
  if (a.major !== b.major) return a.major > b.major;
  if (a.minor !== b.minor) return a.minor > b.minor;
  return a.patch >= b.patch;
}

export async function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

export function formatBytes(bytes) {
  const gb = 1024 * 1024 * 1024;
  return `${(bytes / gb).toFixed(2)} GB`;
}

export function colorize(enabled, color, text) {
  if (!enabled) return text;
  const codes = { red: 31, green: 32, yellow: 33, gray: 90, cyan: 36 };
  const code = codes[color] ?? 0;
  return `\u001b[${code}m${text}\u001b[0m`;
}

export async function runDoctor({
  repoRoot,
  nodeVersion = process.version,
  env = process.env,
  ports = [3000, 8080, 9229],
  allowPorts = [],
  diskFreeBytes,
  portChecker,
  color = true,
} = {}) {
  const root = repoRoot ?? process.cwd();

  const packageJsonPath = path.join(root, "package.json");
  let enginesNode = null;
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    enginesNode = pkg?.engines?.node ?? null;
  }

  const minNode = parseMinNode(enginesNode);
  const current = parseNodeVersion(nodeVersion);

  const checks = [];
  if (minNode) {
    const ok = isVersionGte(current, minNode);
    checks.push({
      id: "node",
      label: `Node version (${nodeVersion} >= ${enginesNode})`,
      ok,
      hint: ok
        ? ""
        : `Install Node ${minNode.major}.${minNode.minor}.${minNode.patch}+ (matches package.json engines).`,
    });
  } else {
    checks.push({
      id: "node",
      label: `Node version (${nodeVersion})`,
      ok: false,
      hint: `Add "engines.node" to package.json (example: ">=20.0.0").`,
    });
  }

  let freeBytes = typeof diskFreeBytes === "number" ? diskFreeBytes : null;
  if (freeBytes === null) {
    try {
      const stat = fs.statfsSync(root);
      freeBytes = Number(stat.bavail) * Number(stat.bsize);
    } catch {
      freeBytes = null;
    }
  }
  const diskOk = freeBytes !== null && freeBytes >= 1024 * 1024 * 1024;
  checks.push({
    id: "disk",
    label:
      freeBytes === null
        ? "Disk space (unknown)"
        : `Disk space free (${formatBytes(freeBytes)} >= 1.00 GB)`,
    ok: diskOk,
    hint: diskOk ? "" : "Free up disk space (>= 1 GB) on the drive containing the project.",
  });

  const { required, envFromFile } = loadEnvFiles(root);
  const missing = [];
  for (const key of required) {
    const value = env[key] ?? envFromFile.get(key);
    if (typeof value !== "string" || value.trim() === "") missing.push(key);
  }
  checks.push({
    id: "env",
    label: `Required env vars (${required.length})`,
    ok: missing.length === 0,
    hint: missing.length === 0 ? "" : `Define these in .env or your shell: ${missing.join(", ")}`,
  });

  const allow = new Set(
    [
      ...allowPorts,
      ...String(env.HYPER_ALLOW_PORTS ?? "")
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n)),
    ].filter((n) => Number.isFinite(n)),
  );

  for (const port of ports) {
    if (allow.has(port)) {
      checks.push({
        id: `port:${port}`,
        label: `Port ${port} (allowed)`,
        ok: true,
        hint: "",
      });
      continue;
    }
    const free = await (portChecker ? portChecker(port) : isPortFree(port));
    checks.push({
      id: `port:${port}`,
      label: `Port ${port} is free`,
      ok: free,
      hint: free
        ? ""
        : `Stop the process using port ${port}, or set HYPER_ALLOW_PORTS=${port} to bypass.`,
    });
  }

  const pass = colorize(color, "green", "PASS");
  const fail = colorize(color, "red", "FAIL");
  const dim = (t) => colorize(color, "gray", t);

  const lines = [];
  lines.push(colorize(color, "cyan", "hyper:doctor"));
  for (const c of checks) {
    lines.push(`${c.ok ? pass : fail} ${c.label}${c.ok ? "" : `\n  ${dim(c.hint)}`}`);
  }
  const allOk = checks.every((c) => c.ok);
  lines.push(allOk ? pass : fail);
  return { ok: allOk, checks, report: lines.join("\n") };
}
