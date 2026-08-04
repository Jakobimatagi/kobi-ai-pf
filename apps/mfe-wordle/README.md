# @kobi/mfe-wordle — Angular Wordle remote

A **daily Wordle** micro-frontend, embedded by the [Vue shell](../shell) via **iframe**
for full runtime/style isolation. Part of the [kobi-ai-pf](../../README.md) monorepo.

- **Framework:** Angular 22 (standalone components + signals)
- **Components:** Angular Material
- **Styling:** Tailwind CSS v4 (PostCSS)
- **Backend:** Supabase (word of the day)
- **Port (dev):** 5002

## The game

Six guesses, five-letter word. Full Wordle scoring — correct / present / absent with
proper duplicate-letter handling ([`src/app/wordle/game.ts`](src/app/wordle/game.ts)) —
on-screen **and** physical keyboard, win/lose states, all driven by Angular signals.

## Word of the day (Supabase)

[`WordService`](src/app/wordle/word.service.ts) fetches today's word from a Supabase
**edge function** (`daily-word`) so every player gets the same word each day. It falls
back to a deterministic local pick from a bundled list when offline.

| Backend piece | Role |
| --- | --- |
| `wordle_words` table | Answer pool, RLS: public read only |
| `get_daily_word()` SQL fn | Deterministic pick by day offset from an anchor date |
| `daily-word` edge function | Returns `{ word, date }` as JSON, CORS-enabled |

Config (public anon key) lives in [`src/environments/environment.ts`](src/environments/environment.ts).

## Federation note

The build also configures `@angular-architects/native-federation` and exposes a
`mount(el)` contract ([`src/mount.ts`](src/mount.ts)), but the shell integrates this
remote via **iframe** rather than the native-federation runtime (that runtime is now
end-of-life and needs `es-module-shims`, which conflicts with Vite). The iframe gives
hard isolation and is the second canonical MFE integration strategy in this repo.

## Develop

```bash
pnpm --filter @kobi/mfe-wordle start       # ng serve → :5002
```

Open http://localhost:5002 to play it standalone.

## Build & deploy

```bash
pnpm --filter @kobi/mfe-wordle build       # → dist/mfe-wordle/browser
```

Deployed on Vercel as a static Angular build ([vercel.json](vercel.json)). See
[DEPLOYMENT.md](../../DEPLOYMENT.md).
