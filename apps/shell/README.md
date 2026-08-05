# @kobi/shell — Vue host

The **Vue 3** shell that ties the portfolio together. It's the **Module Federation
host** and the app users actually load. Part of the [kobi-ai-pf](../../README.md) monorepo.

- **Framework:** Vue 3.5 (`<script setup>`) + Vue Router + Vite 8
- **Styling:** Tailwind CSS v4
- **Port (dev):** 5000

## What it does

- Renders the nav, home page, and layout.
- **`/react`** — lazy-loads the whole React MFE over **Module Federation** and mounts it
  inline into the shell's DOM ([`ReactView.vue`](src/views/ReactView.vue) via
  [`RemoteMount.vue`](src/components/RemoteMount.vue)). The React app handles its own
  internal navigation.
- **`/angular`** — embeds the whole Angular MFE via **iframe**
  ([`AngularView.vue`](src/views/AngularView.vue)) for full runtime/style isolation.

The React MFE exposes a framework-agnostic `mount(el)` contract; the shell only ever hands
over a DOM node. The Angular MFE is loaded by URL.

## Remote wiring

Remote URLs are environment-driven (see [.env.example](.env.example)):

| Variable | Purpose | Default (prod) |
| --- | --- | --- |
| `VITE_REACT_REMOTE_URL` | React MFE `remoteEntry.js` (build-time, in [vite.config.ts](vite.config.ts)) | `https://kobi-ai-pf-mfe-react.vercel.app/remoteEntry.js` |
| `VITE_ANGULAR_URL` | Angular MFE iframe origin (runtime, in [src/mfe/config.ts](src/mfe/config.ts)) | `https://kobi-ai-pf-mfe-angular.vercel.app` |

In dev both default to `localhost:5001` / `localhost:5002`.

## Develop

```bash
pnpm --filter @kobi/shell dev      # this app only → :5000
# or from the repo root, run everything together:
pnpm dev
```

Loading `/react` requires the React MFE to be reachable (run `pnpm dev` at the root,
which serves it a built artifact on :5001).

## Build & deploy

```bash
pnpm --filter @kobi/shell build    # → dist/
```

Deployed on Vercel as a Vite SPA ([vercel.json](vercel.json) adds the `index.html`
rewrite for client-side routing). See [DEPLOYMENT.md](../../DEPLOYMENT.md).
