# Tutorial: Add a New Entity

## Goal

Add a new contract entity so it shows up in the explorer UI and is enforced by contract tests.

## Steps

### 1) Create or update a schema

Add a new Zod schema in:

- [hvc.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/model/hvc.ts)

Prefer:

- strict objects where appropriate
- explicit literals for invariants (example: `criticalLintMax` locked to `0`)

### 2) Register it

Add an entry to the registry:

- [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)

You need:

- `name`: stable identifier
- `category`: user-facing grouping
- `description`: short docs string
- `schema`: your Zod schema
- `example`: a valid example payload

### 3) Add canonical JSON contract

Create:

- `schemas/entities/<EntityName>.json`

The filename must match the registry name exactly.

### 4) Validate + snapshot

Run:

```bash
npm run test:snapshots
```

If the schema shape changed intentionally:

```bash
npm run test:snapshots -- -u
```

