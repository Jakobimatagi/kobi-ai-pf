import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_META, ticketKey, type Task } from './types';

interface Props {
  task: Task;
  onOpen: (task: Task) => void;
  /** True while this card is the drag overlay clone (renders flat, no listeners). */
  overlay?: boolean;
}

export default function TaskCard({ task, onOpen, overlay = false }: Props) {
  const sortable = useSortable({ id: task.id, data: { status: task.status } });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const priority = PRIORITY_META[task.priority];

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={() => !overlay && onOpen(task)}
      className={[
        'group cursor-grab touch-none rounded-xl border border-slate-200 bg-white p-3 shadow-sm',
        'transition hover:border-slate-300 hover:shadow-md active:cursor-grabbing',
        overlay ? 'rotate-2 shadow-lg' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-slate-800">{task.title}</p>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priority.className}`}
        >
          {priority.label}
        </span>
      </div>
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{task.description}</p>
      )}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="font-mono text-[11px] font-semibold text-slate-400">
          {ticketKey(task)}
        </span>
      </div>
    </div>
  );
}
