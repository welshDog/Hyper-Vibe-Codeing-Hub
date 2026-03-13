# Contributing

## Scope

This repo is a schema-first workflow hub. Contributions should prioritize:

- Contract stability
- Fast dev loops
- Clear documentation

## Development Setup

```bash
npm install
npm run hyper:ready
npm run dev
```

## Coding Standards

- TypeScript: prefer explicit types at module boundaries.
- Validation: use Zod for runtime validation and infer types from schemas.
- No secrets: never commit tokens/keys; use `.env` locally and secret stores in CI.
- Keep loops green: run `npm run hyper:ready` before pushing.

## Contract Rules

- Every entity in the schema registry must have a canonical JSON sample:
  - `schemas/entities/<EntityName>.json`
- Contract suite must be green:
  - `npm run test:snapshots`

If you intentionally change contract shape:

```bash
npm run test:snapshots -- -u
```

Explain snapshot updates in the PR description.

## Pull Requests

- Use the PR template: [.github/pull_request_template.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/.github/pull_request_template.md)
- Include verification commands in the PR body.
- Add or update ADRs for major architectural changes.

## Git Hooks (Optional, Recommended)

Enable pre-commit contract enforcement:

```bash
git config --local core.hooksPath .githooks
```

