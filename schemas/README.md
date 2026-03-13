# Schemas (Contracts)

This folder holds canonical JSON payloads and contract snapshots.

## What’s here

- `schemas/entities/*.json` — canonical payloads for each public entity contract
- `schemas/contracts.test.ts` — validates each payload against the Zod schema and snapshots the schema shape

## Updating contracts intentionally

If you intentionally change a schema shape, update snapshots:

```bash
npm run test:snapshots -- -u
```

If you intentionally change canonical JSON samples, edit the corresponding file in `schemas/entities/` and rerun:

```bash
npm run test:snapshots -- -u
```

## Pre-commit enforcement

Enable the hook:

```bash
git config --local core.hooksPath .githooks
```

Then commits will fail if contract snapshots drift.

Notes:

- Ensure `.githooks/pre-commit` is executable on your OS.
- If your Git is older than 2.9, `core.hooksPath` is ignored.
- If you already use a global `core.hooksPath`, you may need to unset it or chain hooks.
