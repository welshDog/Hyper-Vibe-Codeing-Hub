# Hyper Vibe Coding Hub

Interactive schema explorer + typed data model for a full AI-assisted development workflow system (quality gates, CI pipeline, PRs, ADRs, experiments, metrics, env vars).

## Quickstart

```bash
npm install
npm run hyper:ready
npm run dev
```

## Commands

```bash
npm test
npm run test:coverage
npm run test:snapshots
npm run lint
npm run typecheck
npm run build
```

## Hyper CLI

```bash
npm run hyper:doctor
npm run hyper:ready
npm run hyper:reset
```

Non-interactive reset:

```bash
HYPER_YES=1 npm run hyper:reset
```

## Templates

- PR template: [.github/pull_request_template.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/.github/pull_request_template.md)
- ADR template: [template.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/adr/template.md)
- Experiment template: [template.md](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/docs/experiments/template.md)

## Where to edit

- Data model schemas: [hvc.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/model/hvc.ts)
- Schema registry + examples: [schemaRegistry.ts](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/schemaRegistry.ts)
- Explorer UI: [App.tsx](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/src/ui/App.tsx)
