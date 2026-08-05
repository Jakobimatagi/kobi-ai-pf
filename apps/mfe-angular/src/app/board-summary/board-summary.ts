import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TaskService, type Priority, type Status, type Task } from './task.service';

const STATUS_LABEL: Record<Status, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

@Component({
  selector: 'app-board-summary',
  templateUrl: './board-summary.html',
})
export class BoardSummary implements OnInit, OnDestroy {
  private readonly tasks = inject(TaskService);
  private readonly zone = inject(NgZone);
  private unsubscribe: (() => void) | null = null;

  readonly items = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly live = signal(false);

  readonly total = computed(() => this.items().length);

  private readonly byStatus = computed(() => {
    const acc: Record<Status, number> = { BACKLOG: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
    for (const t of this.items()) acc[t.status]++;
    return acc;
  });

  private readonly byPriority = computed(() => {
    const acc: Record<Priority, number> = { LOW: 0, MED: 0, HIGH: 0 };
    for (const t of this.items()) acc[t.priority]++;
    return acc;
  });

  readonly donePct = computed(() =>
    this.total() ? Math.round((this.byStatus().DONE / this.total()) * 100) : 0,
  );

  readonly feed = computed(() =>
    [...this.items()]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 8),
  );

  readonly statusMeta = [
    { status: 'BACKLOG' as Status, label: 'Backlog', dot: 'bg-slate-400' },
    { status: 'IN_PROGRESS' as Status, label: 'In Progress', dot: 'bg-sky-500' },
    { status: 'IN_REVIEW' as Status, label: 'In Review', dot: 'bg-violet-500' },
    { status: 'DONE' as Status, label: 'Done', dot: 'bg-emerald-500' },
  ];

  readonly priorityMeta = [
    { priority: 'HIGH' as Priority, label: 'High', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
    { priority: 'MED' as Priority, label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    { priority: 'LOW' as Priority, label: 'Low', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ];

  count(status: Status): number {
    return this.byStatus()[status];
  }

  pcount(priority: Priority): number {
    return this.byPriority()[priority];
  }

  statusLabel(status: Status): string {
    return STATUS_LABEL[status];
  }

  statusChip(status: Status): string {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-100 text-emerald-700';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-700';
      case 'IN_REVIEW':
        return 'bg-violet-100 text-violet-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  async ngOnInit(): Promise<void> {
    await this.load();
    // Realtime callbacks fire outside Angular's zone — re-enter so the
    // signals-driven view updates immediately.
    this.unsubscribe = this.tasks.onChange(() => this.zone.run(() => void this.load()));
    this.live.set(true);
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }

  private async load(): Promise<void> {
    try {
      this.items.set(await this.tasks.list());
      this.error.set(null);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to load summary.');
    } finally {
      this.loading.set(false);
    }
  }
}
