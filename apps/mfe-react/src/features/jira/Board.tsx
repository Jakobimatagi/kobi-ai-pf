import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { createTask, deleteTask, listTasks, seedBoard, updateTask, type TaskPatch } from './api';
import { subscribeToTasks } from './realtime';
import { useBoardId } from './boardId';
import { COLUMNS, ticketKey, type Priority, type Status, type Task } from './types';
import Column from './Column';
import TaskCard from './TaskCard';
import IssueModal from './IssueModal';

type Columns = Record<Status, Task[]>;

const EMPTY: Columns = { BACKLOG: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
const STATUS_SET = new Set<string>(COLUMNS.map((c) => c.status));

function group(tasks: Task[]): Columns {
  const out: Columns = { BACKLOG: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
  for (const t of [...tasks].sort((a, b) => a.position - b.position)) out[t.status].push(t);
  return out;
}

// Position for a card that now sits at `index` in `arr` — midway between its
// neighbours so a single-row PATCH is enough to persist the move.
function neighborPos(arr: Task[], index: number): number {
  const prev = arr[index - 1]?.position;
  const next = arr[index + 1]?.position;
  if (prev != null && next != null) return (prev + next) / 2;
  if (prev != null) return prev + 1000;
  if (next != null) return next - 1000;
  return 1000;
}

const mapTask = (cols: Columns, id: string, fn: (t: Task) => Task): Columns =>
  Object.fromEntries(
    Object.entries(cols).map(([s, list]) => [s, list.map((t) => (t.id === id ? fn(t) : t))]),
  ) as Columns;

const removeTask = (cols: Columns, id: string): Columns =>
  Object.fromEntries(
    Object.entries(cols).map(([s, list]) => [s, list.filter((t) => t.id !== id)]),
  ) as Columns;

function TrashZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'TRASH' });
  return (
    <div
      ref={setNodeRef}
      className={[
        'mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-medium transition',
        isOver
          ? 'border-rose-400 bg-rose-50 text-rose-600'
          : 'border-slate-300 bg-slate-50 text-slate-400',
      ].join(' ')}
    >
      <DeleteOutlineIcon fontSize="small" />
      {isOver ? 'Release to delete' : 'Drag a card here to delete'}
    </div>
  );
}

export default function Board() {
  const boardId = useBoardId();
  const [columns, setColumns] = useState<Columns>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const draggingRef = useRef(false);
  const dragOrigin = useRef<{ status: Status } | null>(null);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const load = useCallback(async () => {
    try {
      setColumns(group(await listTasks(boardId)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  // Initial load + live sync, scoped to this board. seedBoard() populates a
  // brand-new board with demo tickets (exactly once) and returns its rows. Any
  // change (from this board or the Angular dashboard, another tab, another
  // device) refetches — unless we're mid-drag.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await seedBoard(boardId);
        if (!alive) return;
        setColumns(group(rows));
        setError(null);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load tasks.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    const unsub = subscribeToTasks(boardId, () => {
      if (draggingRef.current) return;
      clearTimeout(refetchTimer.current);
      refetchTimer.current = setTimeout(() => void load(), 200);
    });
    return () => {
      alive = false;
      clearTimeout(refetchTimer.current);
      unsub();
    };
  }, [boardId, load]);

  const findContainer = (id: string): Status | 'TRASH' | null => {
    if (id === 'TRASH') return 'TRASH';
    if (STATUS_SET.has(id)) return id as Status;
    for (const c of COLUMNS) if (columns[c.status].some((t) => t.id === id)) return c.status;
    return null;
  };

  const findTask = (id: string): Task | undefined => {
    for (const c of COLUMNS) {
      const hit = columns[c.status].find((t) => t.id === id);
      if (hit) return hit;
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTask(String(event.active.id));
    if (!task) return;
    draggingRef.current = true;
    dragOrigin.current = { status: task.status };
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const origin = dragOrigin.current;
    draggingRef.current = false;
    dragOrigin.current = null;
    setActiveTask(null);
    if (!over || !origin) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const to = findContainer(overId);
    if (!to) return;

    if (to === 'TRASH') {
      const t = findTask(activeId);
      if (t) setPendingDelete(t);
      return;
    }

    const from = origin.status;

    if (from === to) {
      const arr = columns[to];
      const oldIndex = arr.findIndex((t) => t.id === activeId);
      let newIndex = arr.findIndex((t) => t.id === overId);
      if (newIndex === -1) newIndex = arr.length - 1;
      if (oldIndex === -1 || oldIndex === newIndex) return;
      const reordered = arrayMove(arr, oldIndex, newIndex);
      const position = neighborPos(reordered, newIndex);
      setColumns({ ...columns, [to]: reordered.map((t) => (t.id === activeId ? { ...t, position } : t)) });
      void persist(activeId, { position });
    } else {
      const fromArr = [...columns[from]];
      const toArr = [...columns[to]];
      const oldIndex = fromArr.findIndex((t) => t.id === activeId);
      if (oldIndex === -1) return;
      const [moved] = fromArr.splice(oldIndex, 1);
      let insertAt = toArr.findIndex((t) => t.id === overId);
      if (insertAt === -1) insertAt = toArr.length;
      toArr.splice(insertAt, 0, { ...moved, status: to });
      const position = neighborPos(toArr, insertAt);
      toArr[insertAt] = { ...toArr[insertAt], position };
      setColumns({ ...columns, [from]: fromArr, [to]: toArr });
      void persist(activeId, { status: to, position });
    }
  };

  // Persist a move; on failure, surface it and resync from the server.
  const persist = async (id: string, patch: TaskPatch) => {
    try {
      await updateTask(id, patch);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.');
      void load();
    }
  };

  const handleAdd = async (status: Status, title: string, priority: Priority) => {
    const temp: Task = {
      id: `temp-${Date.now()}`,
      ticket_no: 0,
      title,
      description: '',
      priority,
      status,
      position: Number.MAX_SAFE_INTEGER,
      created_at: '',
      updated_at: '',
    };
    setColumns((prev) => ({ ...prev, [status]: [...prev[status], temp] }));
    try {
      await createTask(boardId, { title, priority, status });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the issue.');
      await load();
    }
  };

  const handleSaveEdit = async (id: string, patch: TaskPatch) => {
    setColumns((prev) => mapTask(prev, id, (t) => ({ ...t, ...patch })));
    try {
      await updateTask(id, patch);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
      void load();
    }
  };

  const handleConfirmDelete = async () => {
    const task = pendingDelete;
    if (!task) return;
    setPendingDelete(null);
    setColumns((prev) => removeTask(prev, task.id));
    try {
      await deleteTask(task.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the issue.');
      void load();
    }
  };

  const total = COLUMNS.reduce((n, c) => n + columns[c.status].length, 0);

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Project Board</h2>
          <p className="text-sm text-slate-500">
            Full CRUD Kanban · drag to move · {total} {total === 1 ? 'issue' : 'issues'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live · synced via Supabase Realtime
        </span>
      </div>

      {error && (
        <Alert severity="warning" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading board…</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {COLUMNS.map((col) => (
              <Column
                key={col.status}
                column={col}
                tasks={columns[col.status]}
                onOpen={setEditing}
                onAdd={handleAdd}
              />
            ))}
          </div>

          <TrashZone />

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onOpen={() => {}} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {editing && (
        <IssueModal
          task={editing}
          onSave={handleSaveEdit}
          onDelete={(t) => {
            setEditing(null);
            setPendingDelete(t);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      <Dialog open={!!pendingDelete} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete issue?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{pendingDelete ? ticketKey(pendingDelete) : ''}</strong>? This can’t be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setPendingDelete(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
