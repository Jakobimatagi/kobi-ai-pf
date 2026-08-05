// Supabase project config. The anon key is safe to ship in the browser: RLS
// grants it read-only access, and every write goes through the `tasks` edge
// function (service role). Shared verbatim with the Angular dashboard MFE.
export const SUPABASE_URL = 'https://fhecoussqvnaqsqjsgxx.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZWNvdXNzcXZuYXFzcWpzZ3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NDE1MjQsImV4cCI6MjEwMTQxNzUyNH0.AkUtqgcPo7TIR2CmGKn6TJEBPDqssG1mTSrp1jRzCXM';

// REST base for the `tasks` edge function.
export const TASKS_API = `${SUPABASE_URL}/functions/v1/tasks`;
