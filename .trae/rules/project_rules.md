# Hyper Vibe Coding Hub (Trae Rules)

## One-Command Readiness

Run this before coding:

```bash
npm run hyper:ready
```

Definition of ready:

- Lint passes
- Typecheck passes
- Tests pass with coverage thresholds
- Build passes

## AI Safety

- Never paste secrets/tokens/keys into chat.
- Do not add logging that prints environment variables.
- Secret env vars are modeled by reference only (credential store handle), never stored as values in source.

## Default Commands

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

## Agent Runbook

If asked to "make it ready", run `npm run hyper:ready` and fix any failures.

