# Getting Started

## What This Repo Is

Hyper Vibe Coding Hub is a schema-first workflow hub:

- A typed data model (Zod schemas + inferred TypeScript types)
- A schema registry with canonical examples
- A UI that lets you explore and validate example payloads
- A CLI toolchain that enforces quality gates and contract stability

## Prerequisites

- Node.js >= 20 (enforced via `package.json.engines`)
- npm

## Install & Run

```bash
npm install
npm run hyper:ready
npm run dev
```

Open:

- http://localhost:5173/

## Recommended Workflow

1. Run `npm run hyper:doctor` whenever your environment changes.
2. Use `npm run hyper:ready` before opening a PR.
3. If you hit a broken experiment state: `npm run hyper:reset` (use `HYPER_YES=1` for scripts).
4. Keep contracts stable with `npm run test:snapshots`.

## Troubleshooting

- Port conflicts: stop the process using the port, or allow a port explicitly with:
  - `HYPER_ALLOW_PORTS=3000,8080,9229 npm run hyper:doctor`
- Snapshot drift: if intentional, update with:
  - `npm run test:snapshots -- -u`

