# Performance Benchmarks

These benchmarks document typical developer-loop timings and provide a repeatable measurement method.

## What Matters

- Time-to-green for `hyper:ready`
- Build time (`npm run build`)
- Contract suite time (`npm run test:snapshots`)

## How to Measure

Run each command multiple times and capture median (P50) and tail latency (P95).

```bash
npm run hyper:ready
npm run build
npm run test:snapshots
```

Record:

- OS + CPU + RAM
- Node version
- Disk type (SSD/HDD)

## Baseline Targets (Guidance)

- `hyper:ready`: under 2 minutes on a typical dev laptop
- `build`: under 2 minutes
- coverage: >= 80% (global thresholds)

## Comparison Notes

Contract stability approaches:

- Zod schema + canonical JSON samples + snapshots (this repo)
- JSON Schema generation + AJV validation
- OpenAPI + code generation

Tradeoffs:

- Zod is fast to iterate in TypeScript-heavy repos.
- OpenAPI is best if you already have an HTTP API boundary.

