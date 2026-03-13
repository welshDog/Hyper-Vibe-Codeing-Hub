# Tutorial: Evolve a Contract Safely

## Goal

Change a schema or payload format without breaking consumers unexpectedly.

## Contract Change Checklist

1. Update the Zod schema in [hvc.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/model/hvc.ts)
2. Update the registry example in [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)
3. Update the canonical JSON in `schemas/entities/<EntityName>.json`
4. Run `npm run test:snapshots`
5. If the schema shape changed intentionally, update snapshots:

```bash
npm run test:snapshots -- -u
```

6. Add a changelog entry: [CHANGELOG.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/CHANGELOG.md)

## Review Notes

- Snapshot updates should be rare and always explained in the PR description.
- Prefer additive, backwards-compatible changes when possible.

