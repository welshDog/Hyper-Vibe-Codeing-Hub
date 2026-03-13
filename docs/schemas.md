# Schemas & Contracts

## Source of Truth

The canonical source of truth is the Zod schema layer:

- Schemas: [hvc.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/model/hvc.ts)
- Registry: [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)

The registry provides:

- Name (public contract identifier)
- Category (for UI grouping)
- Description (docs + onboarding)
- Example payload (used by UI and tests)
- Zod schema (runtime validation + inferred TS types)

## Contract Folder

`schemas/` contains canonical JSON samples and contract enforcement:

- `schemas/entities/*.json` – one canonical sample per entity
- `schemas/contracts.test.ts` – validates samples and snapshots schema shape

Docs: [schemas/README.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/schemas/README.md)

## How Contracts Are Enforced

1. Each entity must have a canonical JSON file named exactly:
   - `schemas/entities/<EntityName>.json`
2. Tests validate that canonical sample parses with the entity’s Zod schema.
3. Tests snapshot the schema “shape” so shape changes create deliberate review points.

Run:

```bash
npm run test:snapshots
```

Update snapshots intentionally:

```bash
npm run test:snapshots -- -u
```

## Pre-commit Hook

Enable:

```bash
git config --local core.hooksPath .githooks
```

Then contract drift fails before commit.

