import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ColumnDef, Priority, Task } from './types';
import TaskCard from './TaskCard';

interface Props {
  column: ColumnDef;
  tasks: Task[];
  onOpen: (task: Task) => void;
  onAdd: (status: ColumnDef['status'], title: string, priority: Priority) => void;
}

export default function Column({ column, tasks, onOpen, onAdd }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MED');

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(column.status, trimmed, priority);
    setTitle('');
    setPriority('MED');
    setAdding(false);
  };

  return (
    <div className="flex min-w-[240px] flex-1 flex-col rounded-2xl bg-slate-100/70 p-2.5">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700">{column.label}</h3>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={[
          'flex min-h-[80px] flex-1 flex-col gap-2 rounded-xl p-1 transition',
          isOver ? 'bg-sky-100/60 ring-2 ring-inset ring-sky-300' : '',
        ].join(' ')}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpen} />
          ))}
        </SortableContext>
      </div>

      {adding ? (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="What needs doing?"
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-sky-400"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 outline-none focus:border-sky-400"
            >
              <option value="LOW">Low</option>
              <option value="MED">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <div className="flex gap-1.5">
              <button
                onClick={() => setAdding(false)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 rounded-xl px-2 py-1.5 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700"
        >
          + Add issue
        </button>
      )}
    </div>
  );
}
