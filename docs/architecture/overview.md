# Architecture Overview

## Goals

- Make schemas the single source of truth for validation + types.
- Make contracts reviewable and stable (canonical samples + snapshots).
- Keep the developer loop fast (doctor → gates → build).

## Components

- **Model layer**
  - Zod schemas and type inference: [hvc.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/model/hvc.ts)
- **Registry layer**
  - Named entities + descriptions + examples: [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)
- **Explorer UI**
  - Entity browse/search + validate JSON against schema: [App.tsx](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/ui/App.tsx)
- **Hyper CLI**
  - Readiness gates and diagnostics: [scripts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/scripts)
- **Contracts**
  - Canonical JSON samples and schema-shape snapshots: [schemas](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/schemas)

## Quality Gates

The repo’s definition of “ready” is enforced by:

- `npm run hyper:doctor`
- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage`
- `npm run build`

## CI

CI runs the same gates:

- [ci.yml](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/.github/workflows/ci.yml)

