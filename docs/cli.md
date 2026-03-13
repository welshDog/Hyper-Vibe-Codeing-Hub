# CLI Reference

The Hyper CLI is exposed as npm scripts.

## hyper:doctor

Validates your local environment before running gates.

```bash
npm run hyper:doctor
```

Checks:

- Node.js version satisfies `package.json.engines.node`
- Disk space is at least 1 GB (project drive)
- Required env vars are set (keys read from `.env.example`)
- Default ports are free (3000, 8080, 9229) unless allowed via `HYPER_ALLOW_PORTS`

Environment variables:

- `HYPER_ALLOW_PORTS=3000,8080` allowlisted ports for the port check

## hyper:ready

One-command “green” gate for local dev and PRs.

```bash
npm run hyper:ready
```

Runs:

- `hyper:doctor`
- `lint`
- `typecheck`
- `test:coverage`
- `build`

## hyper:reset

Safely removes build and dependency artifacts after failed experiments.

Targets:

- `dist/`
- `coverage/`
- `node_modules/`

```bash
npm run hyper:reset
```

Non-interactive mode:

```bash
HYPER_YES=1 npm run hyper:reset
```

Behavior:

- If `HYPER_YES=1` → skips prompt
- Else if interactive TTY → prompts
- Else → refuses to run and exits with code 1

Exit codes:

- 0 on success
- 1 on cancellation or error

