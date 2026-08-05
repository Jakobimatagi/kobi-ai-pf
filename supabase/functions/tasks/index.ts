// `tasks` — REST API for the Kanban board, backed by public.jira_tasks.
//
// Every ticket belongs to a `board_id` (per-browser board), so all reads and
// creates are board-scoped:
//
//   GET    /tasks?board_id=B  → list a board's tasks (ordered by status, position)
//   POST   /tasks             → create  { board_id, title, description?, priority?, status? }
//   POST   /tasks/seed        → seed a new board with demo tickets, exactly once
//   PATCH  /tasks/:id         → update  { title?, description?, priority?, status?, position? }
//   DELETE /tasks/:id         → delete
//
// The browser holds only the anon key (read-only via RLS). All writes run here
// with the service-role key, so the table stays write-locked to the public.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

const PRIORITIES = ['LOW', 'MED', 'HIGH'];
const STATUSES = ['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

// Demo backlog dropped into every brand-new board so it isn't empty on arrival.
const DEMO_TICKETS = [
  { title: 'Set up micro-frontend shell',   description: 'Vue 3 host with Module Federation + iframe embedding.',                     priority: 'HIGH', status: 'DONE',        position: 1000 },
  { title: 'Weather component (React MFE)',  description: 'Live 7-day forecast from the Open-Meteo API.',                              priority: 'MED',  status: 'DONE',        position: 2000 },
  { title: 'Wordle component (Angular MFE)', description: 'Daily word served from a Supabase edge function.',                          priority: 'MED',  status: 'IN_REVIEW',   position: 1000 },
  { title: 'Kanban board + realtime sync',   description: 'React board writes; Angular dashboard live-updates via Supabase Realtime.', priority: 'HIGH', status: 'IN_PROGRESS', position: 1000 },
  { title: 'Shared dark-mode theme tokens',  description: 'One palette for the shell and every remote.',                               priority: 'LOW',  status: 'BACKLOG',     position: 1000 },
  { title: 'CI build on Node 24',            description: 'GitHub Actions build across all workspaces.',                               priority: 'MED',  status: 'BACKLOG',     position: 2000 },
];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

async function boardRows(boardId: string) {
  const { data, error } = await supabase
    .from('jira_tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('status', { ascending: true })
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const sub = parts[parts.indexOf('tasks') + 1]; // ':id', 'seed', or undefined

  try {
    switch (req.method) {
      case 'GET': {
        const boardId = url.searchParams.get('board_id') ?? url.searchParams.get('board');
        if (!boardId) return json({ error: 'board_id is required' }, 400);
        return json(await boardRows(boardId));
      }

      case 'POST': {
        const body = await req.json().catch(() => ({}));
        const boardId = String(body.board_id ?? '').trim();
        if (!boardId) return json({ error: 'board_id is required' }, 400);

        // Seed a new board's demo tickets — exactly once, race-safe. The claim
        // row is inserted with ON CONFLICT DO NOTHING; only the caller that
        // actually inserts it gets a row back and proceeds to seed.
        if (sub === 'seed') {
          const { data: claim, error: claimErr } = await supabase
            .from('jira_seeded_boards')
            .upsert({ board_id: boardId }, { onConflict: 'board_id', ignoreDuplicates: true })
            .select('board_id');
          if (claimErr) throw claimErr;
          if (claim && claim.length > 0) {
            const { error: seedErr } = await supabase
              .from('jira_tasks')
              .insert(DEMO_TICKETS.map((t) => ({ ...t, board_id: boardId })));
            if (seedErr) throw seedErr;
          }
          return json(await boardRows(boardId));
        }

        // Create a task, appended to the bottom of its column within the board.
        const title = String(body.title ?? '').trim();
        if (!title) return json({ error: 'title is required' }, 400);
        if (body.priority && !PRIORITIES.includes(body.priority)) {
          return json({ error: 'invalid priority' }, 400);
        }
        const status = body.status && STATUSES.includes(body.status) ? body.status : 'BACKLOG';

        const { data: last } = await supabase
          .from('jira_tasks')
          .select('position')
          .eq('board_id', boardId)
          .eq('status', status)
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle();
        const position = (last?.position ?? 0) + 1000;

        const { data, error } = await supabase
          .from('jira_tasks')
          .insert({
            board_id: boardId,
            title,
            description: String(body.description ?? '').trim(),
            priority: body.priority ?? 'MED',
            status,
            position,
          })
          .select()
          .single();
        if (error) throw error;
        return json(data, 201);
      }

      case 'PATCH': {
        if (!sub || sub === 'seed') return json({ error: 'task id is required' }, 400);
        const body = await req.json().catch(() => ({}));
        const patch: Record<string, unknown> = {};
        if (typeof body.title === 'string') patch.title = body.title.trim();
        if (typeof body.description === 'string') patch.description = body.description.trim();
        if (body.priority !== undefined) {
          if (!PRIORITIES.includes(body.priority)) return json({ error: 'invalid priority' }, 400);
          patch.priority = body.priority;
        }
        if (body.status !== undefined) {
          if (!STATUSES.includes(body.status)) return json({ error: 'invalid status' }, 400);
          patch.status = body.status;
        }
        if (typeof body.position === 'number') patch.position = body.position;
        if (Object.keys(patch).length === 0) return json({ error: 'nothing to update' }, 400);

        const { data, error } = await supabase
          .from('jira_tasks')
          .update(patch)
          .eq('id', sub)
          .select()
          .single();
        if (error) throw error;
        if (!data) return json({ error: 'not found' }, 404);
        return json(data);
      }

      case 'DELETE': {
        if (!sub || sub === 'seed') return json({ error: 'task id is required' }, 400);
        const { error } = await supabase.from('jira_tasks').delete().eq('id', sub);
        if (error) throw error;
        return json({ ok: true });
      }

      default:
        return json({ error: 'method not allowed' }, 405);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'unexpected error' }, 500);
  }
});
