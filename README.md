# kobi.ai — Micro-Frontend Portfolio

An AI-driven portfolio built as a **micro-frontend** architecture: a **Vue 3** shell
that orchestrates independently-built **React** and **Angular** micro-frontends —
each with its own framework, build pipeline, and integration strategy.

Everything is **TypeScript**, styled with **Tailwind CSS v4**, and uses **Material**
component libraries (MUI for React, Angular Material for Angular).

| App | Path | Framework | Role | Integration | Port |
| --- | --- | --- | --- | --- | --- |
| Shell | `apps/shell` | Vue 3 + Vue Router | Host | Module Federation host + iframe embedder | 5000 |
| Weather | `apps/mfe-weather` | React 19 + MUI | Remote | **Module Federation** (mounted inline) | 5001 |
| Wordle | `apps/mfe-wordle` | Angular 22 + Angular Material | Remote | **iframe** (isolated runtime & styles) | 5002 |

## Two integration strategies (on purpose)

Real micro-frontend systems mix integration techniques depending on the trade-offs.
This repo demonstrates the two canonical ones:

- **Runtime Module Federation** — the React weather remote exposes a framework-agnostic
  `mount(el)` contract. The Vue shell loads its `remoteEntry.js` at runtime and mounts
  React directly into the shell's own DOM. Shared page, no iframe.
- **iframe isolation** — the Angular Wordle remote is embedded via `<iframe>`, giving it a
  fully isolated runtime and CSS scope. This side-steps cross-framework style bleed and
  lets Angular keep its own bootstrap/zone.

Each remote also runs **standalone** at its own port for independent development.

## The components

### 🌤️ Weather (React)
A 7-day forecast that hits the free [Open-Meteo](https://open-meteo.com) API (no key
required): city autocomplete + quick-pick chips, current conditions, and a daily grid.
Built with MUI components on a Tailwind layout.

### 🟩 Wordle (Angular)
A daily Wordle clone. The **word of the day** is served deterministically from a
**Supabase Edge Function** (`daily-word`) backed by a Postgres table + SQL function, so
every player gets the same word each day. Falls back to a deterministic local word list
when offline. Full guess evaluation (correct / present / absent with duplicate handling),
on-screen + physical keyboard, built with Angular Material + Tailwind and Angular signals.

## Backend (Supabase)

| Piece | Detail |
| --- | --- |
| `wordle_words` table | Answer pool (5-letter words), row-level security: public read only |
| `get_daily_word()` | SQL function — deterministic pick by day offset from an anchor date |
| `daily-word` edge function | Returns `{ word, date }` as JSON; CORS-enabled |

## Getting started

Requires **Node 22** (`.nvmrc`) and **pnpm** (via Corepack).

```bash
corepack enable
pnpm install
```

Run all three micro-frontends together (shell + both remotes):

```bash
pnpm dev
```

Then open **http://localhost:5000**.

> The weather remote is served as a built artifact (`vite build && vite preview`) when
> consumed by the shell — this avoids the Vite React-refresh preamble that only exists in
> the dev server, and mirrors how remotes are deployed in production.

### Develop a single remote in isolation

```bash
pnpm dev:shell      # Vue shell only            → :5000
pnpm dev:weather    # React remote (hot reload)  → :5001
pnpm dev:wordle     # Angular remote (hot reload) → :5002
```

### Build everything

```bash
pnpm build
```

## Tech stack

- **Monorepo:** pnpm workspaces
- **Shell:** Vue 3.5, Vue Router, Vite 8, `@module-federation/vite`
- **React remote:** React 19, MUI 9, Vite 8, `@module-federation/vite`, `vite-plugin-css-injected-by-js`
- **Angular remote:** Angular 22 (standalone + signals), Angular Material, `@angular-architects/native-federation`
- **Styling:** Tailwind CSS v4 (all apps)
- **Backend:** Supabase (Postgres, RLS, Edge Functions)
- **Language:** TypeScript everywhere

## Repository layout

```
kobi-ai-pf/
├─ apps/
│  ├─ shell/         # Vue host
│  ├─ mfe-weather/   # React remote (Module Federation)
│  └─ mfe-wordle/    # Angular remote (iframe)
├─ pnpm-workspace.yaml
└─ package.json      # root scripts orchestrate all three
```
