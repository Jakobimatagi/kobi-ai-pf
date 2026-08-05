-- Per-browser boards.
--
-- Scope every ticket to a `board_id` so each visitor gets their own isolated
-- Kanban — no auth required. The id is generated client-side (the shell stores
-- it in localStorage) and handed to both MFEs: to React via the mount()
-- contract, to the Angular iframe via a ?board= URL param.

alter table public.jira_tasks add column if not exists board_id text;

-- Existing global rows become the 'demo' board.
update public.jira_tasks set board_id = 'demo' where board_id is null;

alter table public.jira_tasks alter column board_id set not null;

-- Board-scoped ordering.
create index if not exists jira_tasks_board_status_position_idx
  on public.jira_tasks (board_id, status, position);

-- Claim table: guarantees a board is seeded with demo tickets exactly once,
-- even if its first load races across the two MFEs. Only the service-role edge
-- function touches it — RLS is on with no policies, so anon has no access.
create table if not exists public.jira_seeded_boards (
  board_id   text primary key,
  created_at timestamptz not null default now()
);
alter table public.jira_seeded_boards enable row level security;
