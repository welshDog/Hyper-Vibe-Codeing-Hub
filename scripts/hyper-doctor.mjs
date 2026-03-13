import process from "node:process";
import { runDoctor } from "./lib/doctor.mjs";

async function main() {
  const { ok, report } = await runDoctor({ repoRoot: process.cwd(), color: true });
  process.stdout.write(report + "\n");
  process.exit(ok ? 0 : 1);
}

main().catch(() => process.exit(1));

