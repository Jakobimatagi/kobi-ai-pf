-- Kanban board backing store.
--
-- Consumed by two independent micro-frontends:
--   * apps/mfe-react   — interactive board (full CRUD)
--   * apps/mfe-angular — read-only executive dashboard
--
-- Writes always go through the `tasks` edge function (service role), so the
-- browser never needs write access. RLS therefore grants anon SELECT only —
-- which is also exactly what Supabase Realtime needs to stream row changes to
-- both MFEs.

create table if not exists public.jira_tasks (
  id          uuid primary key default gen_random_uuid(),
  ticket_no   int  generated always as identity,               -- human key: PROJ-<ticket_no>
  title       text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 2000),
  priority    text not null default 'MED'     check (priority in ('LOW', 'MED', 'HIGH')),
  status      text not null default 'BACKLOG' check (status in ('BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
  position    double precision not null default 1000,           -- ordering within a column
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists jira_tasks_status_position_idx
  on public.jira_tasks (status, position);

-- Keep updated_at current on every write.
create or replace function public.jira_tasks_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jira_tasks_updated_at on public.jira_tasks;
create trigger jira_tasks_updated_at
  before update on public.jira_tasks
  for each row execute function public.jira_tasks_set_updated_at();

-- RLS: anyone may read; nobody may write from the client (edge function only).
alter table public.jira_tasks enable row level security;

drop policy if exists "jira_tasks anon read" on public.jira_tasks;
create policy "jira_tasks anon read"
  on public.jira_tasks for select
  to anon, authenticated
  using (true);

-- Emit the full old row on UPDATE/DELETE so Realtime payloads are complete.
alter table public.jira_tasks replica identity full;

-- Stream row changes to subscribed clients (idempotent).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'jira_tasks'
  ) then
    alter publication supabase_realtime add table public.jira_tasks;
  end if;
end $$;

-- Demo backlog so the board isn't empty on first load.
insert into public.jira_tasks (title, description, priority, status, position) values
  ('Set up micro-frontend shell',   'Vue 3 host with Module Federation + iframe embedding.',                     'HIGH', 'DONE',        1000),
  ('Weather component (React MFE)',  'Live 7-day forecast from the Open-Meteo API.',                              'MED',  'DONE',        2000),
  ('Wordle component (Angular MFE)', 'Daily word served from a Supabase edge function.',                          'MED',  'IN_REVIEW',   1000),
  ('Kanban board + realtime sync',   'React board writes; Angular dashboard live-updates via Supabase Realtime.', 'HIGH', 'IN_PROGRESS', 1000),
  ('Shared dark-mode theme tokens',  'One palette for the shell and every remote.',                               'LOW',  'BACKLOG',     1000),
  ('CI build on Node 24',            'GitHub Actions build across all workspaces.',                               'MED',  'BACKLOG',     2000)
on conflict do nothing;
