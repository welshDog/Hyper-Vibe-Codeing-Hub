import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureDir(relativePath) {
  const dirPath = path.join(repoRoot, relativePath);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function ensureEnv() {
  const envPath = path.join(repoRoot, ".env");
  if (existsSync(envPath)) return;

  const examplePath = path.join(repoRoot, ".env.example");
  if (existsSync(examplePath)) {
    const example = readFileSync(examplePath, "utf8");
    writeFileSync(envPath, example, "utf8");
    return;
  }

  writeFileSync(envPath, "", "utf8");
}

function ensureDeps() {
  const nodeModules = path.join(repoRoot, "node_modules");
  if (existsSync(nodeModules)) return;
  run("npm", ["install"]);
}

function main() {
  run("node", ["scripts/hyper-doctor.mjs"]);
  ensureDir(".github/workflows");
  ensureDir("docs/adr");
  ensureDir("docs/experiments");
  ensureDir("src/model");
  ensureDir("src/ui");
  ensureDir("src/test");
  ensureDir(".trae/rules");
  ensureEnv();
  ensureDeps();
  run("npm", ["run", "lint"]);
  run("npm", ["run", "typecheck"]);
  run("npm", ["run", "test:coverage"]);
  run("npm", ["run", "build"]);
}

main();
