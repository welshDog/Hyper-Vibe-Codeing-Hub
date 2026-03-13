# ADR 0002: Vitest for Unit Tests and Contract Snapshots

## Status

accepted

## Context

We need a fast test runner that:

- Works with Vite + React
- Supports coverage thresholds
- Supports snapshot tests for contract shapes

## Decision

Use Vitest for unit testing and contract snapshot enforcement.

## Alternatives Considered

- Jest
- Mocha + Chai

## Consequences

- Test runs integrate tightly with the Vite toolchain.
- Snapshot tests enforce deliberate schema evolution.

## Rollback

Switch to Jest and migrate snapshots and coverage configuration.

