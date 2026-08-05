// `tasks` — REST API for the Kanban board, backed by public.jira_tasks.
//
//   GET    /tasks        → list every task (ordered by status, then position)
//   POST   /tasks        → create a task   { title, description?, priority?, status? }
//   PATCH  /tasks/:id    → update a task   { title?, description?, priority?, status?, position? }
//   DELETE /tasks/:id    → delete a task
//
// The browser holds only the anon key (read-only via RLS). All writes run here
// with the service-role key, so the table stays write-locked to the public.
// The React board calls these routes; both MFEs also subscribe to Realtime on
// jira_tasks to stay live.

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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // Path is /tasks or /tasks/:id — grab the segment after "tasks".
  const parts = new URL(req.url).pathname.split('/').filter(Boolean);
  const id = parts[parts.indexOf('tasks') + 1];

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('jira_tasks')
          .select('*')
          .order('status', { ascending: true })
          .order('position', { ascending: true });
        if (error) throw error;
        return json(data);
      }

      case 'POST': {
        const body = await req.json().catch(() => ({}));
        const title = String(body.title ?? '').trim();
        if (!title) return json({ error: 'title is required' }, 400);
        if (body.priority && !PRIORITIES.includes(body.priority)) {
          return json({ error: 'invalid priority' }, 400);
        }
        const status = body.status && STATUSES.includes(body.status) ? body.status : 'BACKLOG';

        // Append to the bottom of the target column.
        const { data: last } = await supabase
          .from('jira_tasks')
          .select('position')
          .eq('status', status)
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle();
        const position = (last?.position ?? 0) + 1000;

        const { data, error } = await supabase
          .from('jira_tasks')
          .insert({
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
        if (!id) return json({ error: 'task id is required' }, 400);
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
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        if (!data) return json({ error: 'not found' }, 404);
        return json(data);
      }

      case 'DELETE': {
        if (!id) return json({ error: 'task id is required' }, 400);
        const { error } = await supabase.from('jira_tasks').delete().eq('id', id);
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
