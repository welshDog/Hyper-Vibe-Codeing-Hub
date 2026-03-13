import { createPublisher } from "./lib/pagesPublish.mjs";

function main() {
  try {
    const { publishPages } = createPublisher();
    const result = publishPages({ repoRoot: process.cwd(), env: process.env, logger: console });
    if (result.url) process.stdout.write(`Live URL: ${result.url}\n`);
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(message + "\n");
    process.exit(1);
  }
}

main();
