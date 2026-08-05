import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { resolveBoardId } from '../board-id';

export type Status = 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MED' | 'HIGH';

export interface Task {
  id: string;
  ticket_no: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * Read-only view of the Kanban data. Reads go through the same `tasks` edge
 * function the React board writes to; a Realtime subscription on jira_tasks
 * pushes live updates so this dashboard reflects the board without a refresh.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    { auth: { persistSession: false } },
  );

  readonly boardId = resolveBoardId();

  async list(): Promise<Task[]> {
    const url = `${environment.supabaseUrl}/functions/v1/tasks?board_id=${encodeURIComponent(this.boardId)}`;
    const res = await fetch(url, {
      headers: {
        apikey: environment.supabaseAnonKey,
        Authorization: `Bearer ${environment.supabaseAnonKey}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to load tasks (${res.status})`);
    return (await res.json()) as Task[];
  }

  /** Fire `cb` whenever a task on this board changes. Returns an unsubscribe function. */
  onChange(cb: () => void): () => void {
    const channel = this.supabase
      .channel(`jira_dashboard:${this.boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jira_tasks',
          filter: `board_id=eq.${this.boardId}`,
        },
        () => cb(),
      )
      .subscribe();
    return () => {
      void this.supabase.removeChannel(channel);
    };
  }
}
