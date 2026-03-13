# Hyper Vibe Coding Hub

Schema-first workflow hub for teams: a typed data model + an interactive explorer UI + “Hyper” CLI gates that keep your repo healthy by default.

This repository is designed to be used as a **separate Trae workspace/profile** (“SchemaHub”) so agents index the schema/contracts context without polluting your main product repo.

[![Deploy](https://github.com/welshDog/Hyper-Vibe-Codeing-Hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/welshDog/Hyper-Vibe-Codeing-Hub/actions/workflows/deploy.yml)
[![Lighthouse](https://github.com/welshDog/Hyper-Vibe-Codeing-Hub/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/welshDog/Hyper-Vibe-Codeing-Hub/actions/workflows/lighthouse.yml)

## 🚀 Live Demo

https://welshDog.github.io/Hyper-Vibe-Codeing-Hub/

If GitHub Actions is disabled on your account, you can still deploy via the `gh-pages` branch:

- `npm run pages:publish` (see [docs/deployment/README.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/deployment/README.md))

## Highlights

- Schema registry is the single source of truth (Zod + TypeScript).
- Contract suite: canonical JSON samples + schema validation + schema-shape snapshots + pre-commit enforcement.
- “Hyper CLI”: one-command readiness + reset + environment doctor.
- CI runs the same gates as local dev.

## Screenshots

Add screenshots to `docs/images/`:

- `docs/images/schema-explorer.png` (main explorer view)
- `docs/images/validation.png` (example validation output)

![Schema Explorer](docs/images/schema-explorer.png)

## Navigation

- Getting started: [docs/getting-started.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/getting-started.md)
- CLI reference: [docs/cli.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/cli.md)
- Contract “API” reference (entities + payloads): [docs/api.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/api.md)
- Schemas + contracts: [docs/schemas.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/schemas.md)
- Architecture: [docs/architecture/overview.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/architecture/overview.md)
- Deployment: [docs/deployment/README.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/deployment/README.md)
- Performance notes: [docs/performance/benchmarks.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/performance/benchmarks.md)
- Security: [SECURITY.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/SECURITY.md)
- Contributing: [CONTRIBUTING.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/CONTRIBUTING.md)
- Changelog: [CHANGELOG.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/CHANGELOG.md)

## Quickstart

```bash
npm install
npm run hyper:ready
npm run dev
```

Open the app:

- http://localhost:5173/

## Typical Usage

### Explore schemas

1. Start dev server: `npm run dev`
2. Use the left sidebar to pick an entity (Project, CI pipeline, PR, ADR, etc.)
3. Edit the Example JSON payload and click “Validate JSON”

### Add a new entity (schema-first)

1. Add/extend a Zod schema: [hvc.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/model/hvc.ts)
2. Register it with an example: [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)
3. Add canonical contract JSON: `schemas/entities/<EntityName>.json`
4. Run contract suite: `npm run test:snapshots`

## Commands

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

### Hyper CLI

```bash
npm run hyper:doctor
npm run hyper:ready
npm run hyper:reset
```

Non-interactive reset:

```bash
HYPER_YES=1 npm run hyper:reset
```

Snapshot contracts:

```bash
npm run test:snapshots
npm run test:snapshots -- -u
```

## Governance

- PR template: [.github/pull_request_template.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/.github/pull_request_template.md)
- ADR template: [docs/adr/template.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/adr/template.md)
- Experiment template: [docs/experiments/template.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/experiments/template.md)

## Where to edit

- Data model schemas: [hvc.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/model/hvc.ts)
- Schema registry + examples: [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)
- Explorer UI: [App.tsx](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/ui/App.tsx)

---

Made with ❤️ and GitHub Pages.
