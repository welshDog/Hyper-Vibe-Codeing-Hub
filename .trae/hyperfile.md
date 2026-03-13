# Hyperfile (Hub Bootstrap)

This is a “do-it-all” runbook you can point Trae/agents at.

## Fast Start

```bash
npm run hyper:ready
npm run dev
```

## What hyper:ready does

- Ensures required folders exist
- Ensures a local `.env` exists (copies from `.env.example` if missing)
- Installs dependencies (if needed)
- Runs quality gates: lint, typecheck, test:coverage, build

## Agent Command

Ask:

- “Run hyper ready and fix anything that fails.”

