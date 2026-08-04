# @kobi/mfe-angular — Angular micro-frontend

A self-contained **Angular app** that hosts many components, embedded by the
[Vue shell](../shell) via **iframe** for full runtime/style isolation. Part of the
[kobi-ai-pf](../../README.md) monorepo.

- **Framework:** Angular 22 (standalone components + signals + Router)
- **Components:** Angular Material
- **Styling:** Tailwind CSS v4 (PostCSS)
- **Backend:** Supabase (for the Wordle word of the day)
- **Port (dev):** 5002

## Structure

- [`src/app/app.ts`](src/app/app.ts) — the mini-app shell: top nav + `<router-outlet>`.
- [`src/app/registry.ts`](src/app/registry.ts) — the **component registry**. Add one
  entry (path, label, description, `loadComponent`) and it appears in the nav, the home
  grid, and the routes.
- [`src/app/app.routes.ts`](src/app/app.routes.ts) — routes derived from the registry.
- [`src/app/home/`](src/app/home) — overview grid of the hosted components.

Routing uses **hash location** so deep links work inside the iframe without server-side
rewrites.

### Components

| Component | What it does |
| --- | --- |
| **Wordle** | Daily word game. Word of the day comes from a Supabase edge function (`daily-word`), with a deterministic offline fallback. Full guess evaluation, on-screen + physical keyboard, Angular signals. |

### Add a component

1. Create `src/app/<name>/<name>.ts`.
2. Add an entry to `src/app/registry.ts`.

Nav, home card, and lazy route update automatically.

## Backend (Supabase)

| Piece | Role |
| --- | --- |
| `wordle_words` table | Answer pool, RLS: public read only |
| `get_daily_word()` SQL fn | Deterministic pick by day offset from an anchor date |
| `daily-word` edge function | Returns `{ word, date }` as JSON, CORS-enabled |

Config (public anon key) lives in [`src/environments/environment.ts`](src/environments/environment.ts).

## Develop / build

```bash
pnpm --filter @kobi/mfe-angular start    # ng serve → :5002
pnpm --filter @kobi/mfe-angular build    # → dist/mfe-angular/browser
```

Deployed on Vercel as a static Angular build ([vercel.json](vercel.json)). See
[DEPLOYMENT.md](../../DEPLOYMENT.md).
