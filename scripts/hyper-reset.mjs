import readline from "node:readline";
import process from "node:process";
import { runReset } from "./lib/reset.mjs";

function isYesFlagEnabled(value) {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "y";
}

function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

async function main() {
  const yes = isYesFlagEnabled(process.env.HYPER_YES);
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  if (!yes && !interactive) {
    process.stderr.write(
      "hyper:reset refused to run non-interactively. Use HYPER_YES=1 to confirm deletes.\n",
    );
    process.exit(1);
  }

  const exitCode = await runReset({
    repoRoot: process.cwd(),
    confirm: async ({ paths }) => {
      process.stdout.write("hyper:reset will delete:\n");
      for (const p of paths) process.stdout.write(`- ${p}\n`);
      return yes ? true : askYesNo(`Proceed? (y/N) `);
    },
    logger: console,
  });
  process.exit(exitCode);
}

main().catch(() => process.exit(1));
