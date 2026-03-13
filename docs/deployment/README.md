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

This repo includes a zero-cost GitHub Pages pipeline:

- [deploy.yml](file:///c:/Users/Lyndz/Documents/trae_projects/Hyper%20Vibe%20Codeing%20Hub/.github/workflows/deploy.yml)

One-time repo setup:

1. GitHub → Settings → Pages
2. Build and deployment → Source: GitHub Actions

Notes for Vite base path:

- Pages serves at `/<repo-name>/`
- The workflow builds with `VITE_BASE=/<repo-name>/` to make asset paths work correctly

Optional custom domain:

- Copy `public/CNAME.example` to `public/CNAME` and replace with your domain
- Configure DNS and set the domain in GitHub Pages settings

## Environment Variables

This app avoids secrets by design.

If you add integrations later:

- keep secrets out of source control
- use `.env` locally
- use your platform’s secret store in CI
