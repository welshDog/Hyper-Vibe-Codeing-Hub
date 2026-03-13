# Contract “API” Reference

This project is a local web app + contract suite. There are no network endpoints by default.

Instead, “API” refers to the **public contract surface** exposed via:

- Entity names (registry)
- Canonical JSON payloads (`schemas/entities/*.json`)
- Zod schemas (validation + TS inference)

## Entities

Entities are defined in the registry:

- [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)

Each entity has:

- `name`: public contract identifier (also the canonical JSON file name)
- `category`: grouping label for the explorer UI
- `description`: user-facing docs string
- `schema`: Zod schema for validation
- `example`: example payload for UI defaults

## Canonical Samples

Canonical samples live here:

- [schemas/entities](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/schemas/entities)

Rules:

- File name must match entity name exactly: `Project.json`, `PullRequest.json`, etc.
- Samples must validate against the schema.

## Validation & Error Format

Validation is powered by Zod. Consumers should use:

- `schema.safeParse(value)` for a `{ success, data | error }` result
- Zod issues include a `path` and `message` per failure

The explorer UI displays failures as:

- `path.join(".") + ": " + message` per issue

## Versioning

Contract changes should follow:

- Update Zod schema + registry
- Update canonical JSON samples
- Update snapshots (only if intentional): `npm run test:snapshots -- -u`
- Add a changelog entry: [CHANGELOG.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/CHANGELOG.md)

