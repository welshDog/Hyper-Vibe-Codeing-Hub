# ADR 0003: Hyper CLI for Quality Gates and Fast Recovery

## Status

accepted

## Context

Teams need a predictable definition of “green” and a safe way to recover from broken experiment states.

## Decision

Introduce a small CLI toolchain exposed as npm scripts:

- `hyper:doctor` preflight checks
- `hyper:ready` repo gates (lint/typecheck/tests/build)
- `hyper:reset` safe clean slate (dist/coverage/node_modules)

## Alternatives Considered

- Rely on CI only
- Makefiles / shell scripts without tests
- External task runner frameworks

## Consequences

- Local dev matches CI behavior.
- Faster onboarding: one command gives actionable failures.
- Safety: reset requires explicit confirmation (or `HYPER_YES=1` for automation).

## Rollback

Remove CLI scripts and rely on direct npm scripts + CI.

