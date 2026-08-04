# Deploying to Vercel

This monorepo deploys as **three separate Vercel projects** (one per app), all pointing at
the same GitHub repo with different **Root Directories**. Each app has its own
[`vercel.json`](apps/shell/vercel.json) with build config, headers, and rewrites.

Deploy the **remotes first** (weather + wordle), then the **shell** last, because the
shell needs the remotes' production URLs.

## Recommended: Git-connected projects (continuous deployment)

For each app, create a Vercel project from the same repo:

### 1. Weather remote (React)

- **Import** `Jakobimatagi/kobi-ai-pf` in the Vercel dashboard → **Add New… → Project**.
- **Project Name:** `kobi-ai-pf-weather`
- **Root Directory:** `apps/mfe-weather`
- Framework / build / output are read from `apps/mfe-weather/vercel.json` (Vite → `dist`).
- Deploy. Note the production URL, e.g. `https://kobi-ai-pf-weather.vercel.app`.

### 2. Wordle remote (Angular)

- **Add New… → Project**, same repo.
- **Project Name:** `kobi-ai-pf-wordle`
- **Root Directory:** `apps/mfe-wordle`
- Config from `apps/mfe-wordle/vercel.json` (Angular → `dist/mfe-wordle/browser`).
- Deploy. Note the URL, e.g. `https://kobi-ai-pf-wordle.vercel.app`.

### 3. Shell (Vue host)

- **Add New… → Project**, same repo.
- **Project Name:** `kobi-ai-pf`
- **Root Directory:** `apps/shell`
- **Environment Variables** (Production + Preview) — set these to the URLs from steps 1 & 2:
  | Name | Value |
  | --- | --- |
  | `VITE_WEATHER_REMOTE_URL` | `https://kobi-ai-pf-weather.vercel.app/remoteEntry.js` |
  | `VITE_WORDLE_URL` | `https://kobi-ai-pf-wordle.vercel.app` |
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

# Weather remote
vercel --cwd apps/mfe-weather --prod

# Wordle remote
vercel --cwd apps/mfe-wordle --prod

# Shell — pass the remote URLs from the two deploys above
vercel --cwd apps/shell --prod \
  -e VITE_WEATHER_REMOTE_URL=https://kobi-ai-pf-weather.vercel.app/remoteEntry.js \
  -e VITE_WORDLE_URL=https://kobi-ai-pf-wordle.vercel.app
```

## How the cross-app wiring works in production

- **Weather (Module Federation):** the shell imports the weather remote's `remoteEntry.js`
  cross-origin. That requires CORS — `apps/mfe-weather/vercel.json` sets
  `Access-Control-Allow-Origin: *` on all responses so the import (and its chunk imports)
  succeed from the shell's origin.
- **Wordle (iframe):** the shell embeds the Angular app by URL. No CORS needed — it's a
  full document load. The Wordle app talks to Supabase directly (that edge function is
  already CORS-enabled).

## Notes

- **Node:** use Node 22+ (Vercel's default is fine; Angular 22 needs ≥ 20.19).
- **pnpm:** Vercel honors the pinned `packageManager` (`pnpm@9.15.9`) via Corepack and
  installs the workspace from the repo root automatically.
