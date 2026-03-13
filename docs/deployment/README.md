# Deployment

This repo ships a Vite-built static web app. Deployments typically publish `dist/`.

## Local Preview (production build)

```bash
npm run build
npm run preview
```

## Static Hosting (Generic)

1. Build: `npm run build`
2. Upload the `dist/` directory to your static host (S3, Netlify, Cloudflare Pages, etc.)

## GitHub Pages (Example)

This repo does not include a Pages workflow by default.

Typical approach:

1. Build the Vite app on CI
2. Publish `dist/` to GitHub Pages

If you want, add a workflow that:

- runs `npm ci`
- runs `npm run build`
- publishes `dist/`

## Environment Variables

This app avoids secrets by design.

If you add integrations later:

- keep secrets out of source control
- use `.env` locally
- use your platform’s secret store in CI

