# Deploying to Vercel

This monorepo deploys as **three separate Vercel projects** (one per app), all pointing at
the same GitHub repo with different **Root Directories**. Each app has its own
[`vercel.json`](apps/shell/vercel.json) with build config, headers, and rewrites.

Deploy the **remotes first** (React + Angular MFEs), then the **shell** last, because the
shell needs the remotes' production URLs.

## Recommended: Git-connected projects (continuous deployment)

For each app, create a Vercel project from the same repo:

### 1. React MFE

- **Import** `Jakobimatagi/kobi-ai-pf` in the Vercel dashboard → **Add New… → Project**.
- **Project Name:** `kobi-ai-pf-mfe-react`
- **Root Directory:** `apps/mfe-react`
- Framework / build / output are read from `apps/mfe-react/vercel.json` (Vite → `dist`).
- Deploy. Note the production URL, e.g. `https://kobi-ai-pf-mfe-react.vercel.app`.

### 2. Angular MFE

- **Add New… → Project**, same repo.
- **Project Name:** `kobi-ai-pf-mfe-angular`
- **Root Directory:** `apps/mfe-angular`
- Config from `apps/mfe-angular/vercel.json` (Angular → `dist/mfe-angular/browser`).
- Deploy. Note the URL, e.g. `https://kobi-ai-pf-mfe-angular.vercel.app`.

### 3. Shell (Vue host)

- **Add New… → Project**, same repo.
- **Project Name:** `kobi-ai-pf-shell`
- **Root Directory:** `apps/shell`
- **Environment Variables** (Production + Preview) — set these to the URLs from steps 1 & 2:
  | Name | Value |
  | --- | --- |
  | `VITE_REACT_REMOTE_URL` | `https://kobi-ai-pf-mfe-react.vercel.app/remoteEntry.js` |
  | `VITE_ANGULAR_URL` | `https://kobi-ai-pf-mfe-angular.vercel.app` |
- Deploy. This is the public portfolio URL.

> The shell already ships with those exact URLs as **defaults** (see
> [`apps/shell/vite.config.ts`](apps/shell/vite.config.ts) and
> [`apps/shell/src/mfe/config.ts`](apps/shell/src/mfe/config.ts)). If you name the
> projects as above, the env vars are optional. Set them explicitly if your URLs differ.

After this, every push to `main` auto-deploys all three.

## Alternative: Vercel CLI

```bash
npm i -g vercel@latest
vercel login

# React MFE
vercel --cwd apps/mfe-react --prod

# Angular MFE
vercel --cwd apps/mfe-angular --prod

# Shell — pass the remote URLs from the two deploys above
vercel --cwd apps/shell --prod \
  -e VITE_REACT_REMOTE_URL=https://kobi-ai-pf-mfe-react.vercel.app/remoteEntry.js \
  -e VITE_ANGULAR_URL=https://kobi-ai-pf-mfe-angular.vercel.app
```

## How the cross-app wiring works in production

- **React MFE (Module Federation):** the shell imports the React remote's `remoteEntry.js`
  cross-origin. That requires CORS — `apps/mfe-react/vercel.json` sets
  `Access-Control-Allow-Origin: *` on all responses so the import (and its chunk imports)
  succeed from the shell's origin.
- **Angular MFE (iframe):** the shell embeds the Angular app by URL. No CORS needed — it's
  a full document load. The Angular app talks to Supabase directly (that edge function is
  already CORS-enabled).

## Notes

- **Node:** use Node 22+ (Vercel's default is fine; Angular 22 needs ≥ 20.19).
- **pnpm:** Vercel honors the pinned `packageManager` (`pnpm@9.15.9`) via Corepack and
  installs the workspace from the repo root automatically.
