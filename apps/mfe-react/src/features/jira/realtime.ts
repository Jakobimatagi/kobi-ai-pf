// Supabase Realtime subscription for jira_tasks. Both this board and the
// Angular dashboard listen on the same channel, so a write from one MFE reaches
// the other live — across origins, tabs, and devices.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

/**
 * Subscribe to changes for a single board's tasks. Returns an unsubscribe
 * function. `onChange` fires on any insert/update/delete on this board (from
 * this or any other client).
 */
export function subscribeToTasks(boardId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`jira_tasks:${boardId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jira_tasks',
        filter: `board_id=eq.${boardId}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
