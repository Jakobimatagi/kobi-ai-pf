# @kobi/mfe-react — React micro-frontend

A self-contained **React app** that hosts many components, exposed as a **Module
Federation remote** and mounted inline (as a whole app) by the [Vue shell](../shell).
Part of the [kobi-ai-pf](../../README.md) monorepo.

- **Framework:** React 19 + React Router + Vite 8
- **Components:** MUI (Material UI) 9
- **Styling:** Tailwind CSS v4
- **Port (dev):** 5001

## Structure

- [`src/App.tsx`](src/App.tsx) — the mini-app shell: MUI theme, an in-memory router, and
  the top nav.
- [`src/registry.tsx`](src/registry.tsx) — the **component registry**. Add one entry
  (path, label, description, element) and it appears in the nav, the home grid, and the
  routes — no shell changes needed.
- [`src/pages/Home.tsx`](src/pages/Home.tsx) — overview grid of the hosted components.
- [`src/features/`](src/features) — one folder per component.
- [`src/mount.tsx`](src/mount.tsx) — the federation entry: a framework-agnostic
  `mount(el)` / `unmount(el)` pair that renders the whole app.

An **in-memory router** is used so the React app's internal navigation never fights the
Vue shell's URL.

### Components

| Component | What it does |
| --- | --- |
| **Weather** | Live 7-day forecast from the [Open-Meteo](https://open-meteo.com) API (no key) — city autocomplete, current conditions, daily grid. |

### Add a component

1. Create `src/features/<name>/<Name>.tsx`.
2. Add an entry to `src/registry.tsx`.

That's it — nav, home card, and route update automatically.

## Federation

Exposes `./App` → [`src/mount.tsx`](src/mount.tsx). Tailwind CSS is inlined into the JS
bundle (`vite-plugin-css-injected-by-js`) so styles auto-inject when the remote is mounted
in the host.

## Develop / build

```bash
pnpm --filter @kobi/mfe-react dev        # standalone, hot reload → :5001
pnpm --filter @kobi/mfe-react mf:serve   # built artifact for the shell → :5001
pnpm --filter @kobi/mfe-react build      # → dist/ (remoteEntry.js + chunks)
```

Deployed on Vercel as a static Vite build; [vercel.json](vercel.json) adds CORS headers so
the shell can import `remoteEntry.js` cross-origin. See [DEPLOYMENT.md](../../DEPLOYMENT.md).
