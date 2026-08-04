# @kobi/mfe-weather — React weather remote

A **weather forecast** micro-frontend, exposed as a **Module Federation remote** and
mounted inline by the [Vue shell](../shell). Part of the
[kobi-ai-pf](../../README.md) monorepo.

- **Framework:** React 19 + Vite 8
- **Components:** MUI (Material UI) 9
- **Styling:** Tailwind CSS v4
- **Data:** [Open-Meteo](https://open-meteo.com) (free, no API key)
- **Port (dev):** 5001

## The component

City autocomplete + quick-pick chips, current conditions (temp, feels-like, wind,
humidity), and a 7-day forecast grid with WMO weather-code icons. Geocoding and forecast
both come from Open-Meteo. See [`src/weather/`](src/weather).

## Federation contract

Exposes `./WeatherApp` → [`src/mount.tsx`](src/mount.tsx), a framework-agnostic
`mount(el)` / `unmount(el)` pair. The host calls `mount(el)` and React takes over that
DOM subtree.

```ts
// vite.config.ts
federation({
  name: 'mfe_weather',
  filename: 'remoteEntry.js',
  exposes: { './WeatherApp': './src/mount.tsx' },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
});
```

Tailwind CSS is inlined into the JS bundle (`vite-plugin-css-injected-by-js`) so styles
auto-inject when the remote is mounted in the host — there's no separate stylesheet for
the host to load.

## Develop

```bash
pnpm --filter @kobi/mfe-weather dev        # standalone, hot reload → :5001
```

Open http://localhost:5001 to work on it in isolation.

## Serve for the shell / build

When consumed by the shell it's served as a **built artifact** — the Vite dev server's
React-refresh preamble errors when a React remote is mounted in a non-React host:

```bash
pnpm --filter @kobi/mfe-weather mf:serve   # vite build && vite preview → :5001
pnpm --filter @kobi/mfe-weather build      # → dist/ (remoteEntry.js + chunks)
```

## Deploy

Deployed on Vercel as a static Vite build. [vercel.json](vercel.json) adds
`Access-Control-Allow-Origin` headers so the shell can import `remoteEntry.js`
cross-origin. See [DEPLOYMENT.md](../../DEPLOYMENT.md).
