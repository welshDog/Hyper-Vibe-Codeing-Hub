# ADR 0001: Zod as Validation Source of Truth

## Status

accepted

## Context

We need:

- Runtime validation for untrusted inputs (JSON payloads, config, CI metadata).
- A single definition that also produces TypeScript types.
- A representation we can render in the explorer UI.

## Decision

Use Zod schemas as the single source of truth and infer TypeScript types from schemas.

## Alternatives Considered

- JSON Schema + AJV
- io-ts
- OpenAPI first

## Consequences

- Faster iteration in a TypeScript-first repo.
- Contracts can be enforced via canonical payloads + schema validation.
- Schema shape can be snapshotted to force deliberate review for breaking changes.

## Rollback

Adopt JSON Schema generation and update the explorer UI renderer to consume JSON Schema.

