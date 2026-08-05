# kobi.ai — Micro-Frontend Portfolio

An AI-driven portfolio built as a **micro-frontend** architecture: a **Vue 3** shell
that orchestrates two independently-built framework apps — a **React** MFE and an
**Angular** MFE. Each MFE is a whole mini-app with its own router that **hosts many
components**, integrated into the shell with its own strategy.

Everything is **TypeScript**, styled with **Tailwind CSS v4**, and uses **Material**
component libraries (MUI for React, Angular Material for Angular).

| App | Path | Framework | Role | Integration | Port |
| --- | --- | --- | --- | --- | --- |
| Shell | `apps/shell` | Vue 3 + Vue Router | Host | Module Federation host + iframe embedder | 5000 |
| React MFE | `apps/mfe-react` | React 19 + MUI + React Router | Remote | **Module Federation** (whole app mounted inline) | 5001 |
| Angular MFE | `apps/mfe-angular` | Angular 22 + Angular Material + Router | Remote | **iframe** (isolated runtime & styles) | 5002 |

Each MFE keeps a component **registry** (`registry.ts`) — adding a component is one entry
(nav link + home card + route) and requires **no changes to the shell**.

## How this was built

Built AI-assisted and engineer-directed. The AI wrote code quickly; the architecture,
technical decisions, code review, and debugging were mine. The commit history is
co-authored and left intact — the point isn't who typed each line, it's the judgment that
made the output production-ready. A few decisions that shaped it:

- **Two integration strategies, deliberately** — runtime Module Federation for React,
  iframe isolation for Angular (the latter chosen after Angular's native-federation
  runtime proved end-of-life and incompatible with Vite).
- **Debugging the tooling's blind spots** — a Vite React-refresh preamble error when
  mounting a React remote in a non-React host (fix: serve the remote as a built artifact),
  a Tailwind v4 gradient-utility rename, and a production CORS/URL mismatch caught by
  verifying the live deployment rather than assuming it worked.
- **Cross-origin state sync, done right** — the obvious `BroadcastChannel`/`window`-event
  approach silently fails across the React↔Angular origin boundary. Chose **Supabase
  Realtime** (a database-mediated channel) instead, which also gets cross-tab and
  cross-device sync for free — and kept writes behind a service-role edge function so the
  public table stays read-only.
- **Structured to grow** — each MFE hosts many components via a registry; adding one
  touches a single file.

Standards held throughout: strict TypeScript across all three frameworks, small
single-responsibility modules, environment-driven config (no hardcoded URLs), CI that
type-checks and builds every app on each PR, and behaviour verified in a real browser
before it's called done.

## Two integration strategies (on purpose)

Real micro-frontend systems mix integration techniques depending on the trade-offs.
This repo demonstrates the two canonical ones:

- **Runtime Module Federation** — the React MFE exposes its whole app behind a
  framework-agnostic `mount(el)` contract. The Vue shell loads its `remoteEntry.js` at
  runtime and mounts React directly into the shell's own DOM. Shared page, no iframe. The
  React app drives its own internal navigation with an in-memory router.
- **iframe isolation** — the Angular MFE is embedded via `<iframe>`, giving it a fully
  isolated runtime and CSS scope. It routes internally with hash-based routing.

Each MFE also runs **standalone** at its own port for independent development.

## Components (so far)

### ⚛️ React MFE — Weather
A 7-day forecast that hits the free [Open-Meteo](https://open-meteo.com) API (no key
required): city autocomplete + quick-pick chips, current conditions, and a daily grid.
Built with MUI components on a Tailwind layout.

### ⚛️ React MFE — Project Board
A full-CRUD Kanban board. Four status columns (Backlog / In Progress / In Review / Done),
inline **+ Add issue** forms, click-to-edit modal, and **drag-and-drop** (via `@dnd-kit`)
with **optimistic updates** so moves feel instant. A dedicated trash drop-zone opens a
deletion-confirmation modal. Every write goes through a **REST edge function**
(`GET/POST/PATCH/DELETE /tasks`); the board reads the same API and subscribes to
**Supabase Realtime** so it stays live. *(More React components to come.)*

### 🅰️ Angular MFE — Wordle
A daily Wordle clone. The **word of the day** is served deterministically from a
**Supabase Edge Function** (`daily-word`) backed by a Postgres table + SQL function, so
every player gets the same word each day. Falls back to a deterministic local word list
when offline. Full guess evaluation (correct / present / absent with duplicate handling),
on-screen + physical keyboard, built with Angular Material + Tailwind and Angular signals.

### 🅰️ Angular MFE — Board Summary
A **read-only executive dashboard** over the same board data: totals, a per-status
breakdown, a completion bar, a priority split, and a live activity feed. Dragging and
editing are deliberately absent — it's a permissioned "viewer" role. It never talks to the
React board directly; it subscribes to **Supabase Realtime** independently.
*(More Angular components to come.)*

### 🔄 The "wow": two frameworks, one live board
The React board (Module Federation, inline) and the Angular dashboard (iframe, a **separate
origin**) share no code and no runtime. Create, drag, or delete an issue on the board and
the Angular dashboard's numbers update within a heartbeat — because both apps subscribe to
Postgres row changes over **Supabase Realtime**. A `BroadcastChannel` or `window` event
can't cross that origin boundary; a database-mediated channel does, and works across tabs
and devices too.

## Backend (Supabase)

| Piece | Detail |
| --- | --- |
| `wordle_words` table | Answer pool (5-letter words), row-level security: public read only |
| `get_daily_word()` | SQL function — deterministic pick by day offset from an anchor date |
| `daily-word` edge function | Returns `{ word, date }` as JSON; CORS-enabled |
| `jira_tasks` table | Kanban store; RLS: **anon read-only**, in the `supabase_realtime` publication |
| `tasks` edge function | REST API (`GET/POST/PATCH/DELETE`); writes with the service role so the table stays write-locked |

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

> The React MFE is served as a built artifact (`vite build && vite preview`) when
> consumed by the shell — this avoids the Vite React-refresh preamble that only exists in
> the dev server, and mirrors how remotes are deployed in production.

### Develop a single MFE in isolation

```bash
pnpm dev:shell      # Vue shell only              → :5000
pnpm dev:react      # React MFE (hot reload)      → :5001
pnpm dev:angular    # Angular MFE (hot reload)    → :5002
```

### Build everything

```bash
pnpm build
```

## Deployment

Each app deploys as its own **Vercel project** (git-connected, one Root Directory each),
so the micro-frontends ship independently. Full steps, env vars, and how the cross-origin
Module Federation + iframe wiring works in production are in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Tech stack

- **Monorepo:** pnpm workspaces
- **Shell:** Vue 3.5, Vue Router, Vite 8, `@module-federation/vite`
- **React MFE:** React 19, React Router, MUI 9, `@dnd-kit`, Vite 8, `@module-federation/vite`, `vite-plugin-css-injected-by-js`
- **Angular MFE:** Angular 22 (standalone + signals + Router), Angular Material, `@angular-architects/native-federation`
- **Styling:** Tailwind CSS v4 (all apps)
- **Backend:** Supabase (Postgres, RLS, Edge Functions, **Realtime**), `@supabase/supabase-js`
- **Language:** TypeScript everywhere

## Repository layout

```
kobi-ai-pf/
├─ apps/
│  ├─ shell/         # Vue host
│  ├─ mfe-react/     # React MFE — many components (Module Federation)
│  └─ mfe-angular/   # Angular MFE — many components (iframe)
├─ pnpm-workspace.yaml
└─ package.json      # root scripts orchestrate all three
```
