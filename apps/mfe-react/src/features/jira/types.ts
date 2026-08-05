export type Priority = 'LOW' | 'MED' | 'HIGH';
export type Status = 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

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

export interface ColumnDef {
  status: Status;
  label: string;
}

export const COLUMNS: ColumnDef[] = [
  { status: 'BACKLOG', label: 'Backlog' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW', label: 'In Review' },
  { status: 'DONE', label: 'Done' },
];

export const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  HIGH: { label: 'High', className: 'bg-rose-100 text-rose-700 border-rose-200' },
  MED: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  LOW: { label: 'Low', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export const ticketKey = (t: Pick<Task, 'ticket_no'>) => `PROJ-${t.ticket_no}`;
