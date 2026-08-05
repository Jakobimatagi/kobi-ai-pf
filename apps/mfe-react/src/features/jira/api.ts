// Thin REST client for the `tasks` edge function.
//   GET /tasks · POST /tasks · PATCH /tasks/:id · DELETE /tasks/:id
import { SUPABASE_ANON_KEY, TASKS_API } from './config';
import type { Priority, Status, Task } from './types';

const authHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function listTasks(boardId: string): Promise<Task[]> {
  const url = `${TASKS_API}?board_id=${encodeURIComponent(boardId)}`;
  return fetch(url, { headers: authHeaders }).then(handle<Task[]>);
}

// Ensure this board exists (seeding demo tickets on first ever load), and
// return its current tasks. Idempotent — safe to call on every mount.
export function seedBoard(boardId: string): Promise<Task[]> {
  return fetch(`${TASKS_API}/seed`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ board_id: boardId }),
  }).then(handle<Task[]>);
}

export interface NewTask {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
}

export function createTask(boardId: string, input: NewTask): Promise<Task> {
  return fetch(TASKS_API, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, board_id: boardId }),
  }).then(handle<Task>);
}

export type TaskPatch = Partial<
  Pick<Task, 'title' | 'description' | 'priority' | 'status' | 'position'>
>;

export function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  return fetch(`${TASKS_API}/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }).then(handle<Task>);
}

export function deleteTask(id: string): Promise<{ ok: true }> {
  return fetch(`${TASKS_API}/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  }).then(handle<{ ok: true }>);
}
