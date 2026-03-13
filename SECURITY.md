# Security Policy

## Supported Versions

This project is pre-1.0. Security fixes are applied to the `main` branch.

## Reporting a Vulnerability

Please do not open public issues for security problems.

Send a private report with:

- A description of the vulnerability
- Impact and exploitability notes
- Steps to reproduce (proof-of-concept if available)
- Affected versions/commit if known

Contact:

- Create a private advisory via GitHub Security Advisories (preferred), or
- Email: `security@EXAMPLE.invalid` (replace with a real address before publishing the repo)

## Disclosure Process

- Acknowledge receipt within 72 hours.
- Provide a remediation plan or timeline.
- Coordinate a fix and disclosure date.

## Best Practices Used Here

- Secrets are never committed; `.env` is ignored; `.env.example` documents required keys.
- Contract and gate checks run in CI.
- Reset scripts refuse unsafe deletes (outside root, symlinks).

