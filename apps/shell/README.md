# @kobi/shell — Vue host

The **Vue 3** shell that ties the portfolio together. It's the **Module Federation
host** and the app users actually load. Part of the [kobi-ai-pf](../../README.md) monorepo.

- **Framework:** Vue 3.5 (`<script setup>`) + Vue Router + Vite 8
- **Styling:** Tailwind CSS v4
- **Port (dev):** 5000

## What it does

- Renders the nav, home page, and layout.
- **`/weather`** — lazy-loads the React weather remote over **Module Federation** and
  mounts it inline into the shell's DOM ([`RemoteMount.vue`](src/components/RemoteMount.vue)).
- **`/wordle`** — embeds the Angular remote via **iframe** ([`WordleView.vue`](src/views/WordleView.vue))
  for full runtime/style isolation.

Both remotes expose a framework-agnostic `mount(el)` contract; the shell only ever hands
over a DOM node.

## Remote wiring

Remote URLs are environment-driven (see [.env.example](.env.example)):

| Variable | Purpose | Default (prod) |
| --- | --- | --- |
| `VITE_WEATHER_REMOTE_URL` | React remote `remoteEntry.js` (build-time, in [vite.config.ts](vite.config.ts)) | `https://kobi-ai-pf-weather.vercel.app/remoteEntry.js` |
| `VITE_WORDLE_URL` | Angular iframe origin (runtime, in [src/mfe/config.ts](src/mfe/config.ts)) | `https://kobi-ai-pf-wordle.vercel.app` |

In dev both default to `localhost:5001` / `localhost:5002`.

## Develop

```bash
pnpm --filter @kobi/shell dev      # this app only → :5000
# or from the repo root, run everything together:
pnpm dev
```

Loading `/weather` requires the weather remote to be reachable (run `pnpm dev` at the root,
which serves it a built artifact on :5001).

## Build & deploy

```bash
pnpm --filter @kobi/shell build    # → dist/
```

Deployed on Vercel as a Vite SPA ([vercel.json](vercel.json) adds the `index.html`
rewrite for client-side routing). See [DEPLOYMENT.md](../../DEPLOYMENT.md).
