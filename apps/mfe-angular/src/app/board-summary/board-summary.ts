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
  template: `
    <div class="mx-auto w-full max-w-3xl px-4 py-6">
      <div class="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Executive Summary</h2>
          <p class="text-sm text-slate-500">
            Read-only rollup of the project board — editing happens on the React board.
          </p>
        </div>
        @if (live()) {
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live · Supabase Realtime
          </span>
        }
      </div>

      @if (error()) {
        <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {{ error() }}
        </div>
      }

      @if (loading()) {
        <p class="py-16 text-center text-sm text-slate-400">Loading summary…</p>
      } @else {
        <!-- Status breakdown -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          @for (s of statusMeta; track s.status) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full" [class]="s.dot"></span>
                <span class="text-xs font-medium text-slate-500">{{ s.label }}</span>
              </div>
              <div class="mt-2 text-3xl font-bold text-slate-800">{{ count(s.status) }}</div>
            </div>
          }
        </div>

        <!-- Progress -->
        <div class="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium text-slate-600">Completion</span>
            <span class="font-semibold text-slate-800">
              {{ count('DONE') }} / {{ total() }} done · {{ donePct() }}%
            </span>
          </div>
          <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all duration-500"
              [style.width.%]="donePct()"
            ></div>
          </div>
        </div>

        <!-- Priority breakdown -->
        <div class="mt-4 flex flex-wrap gap-2">
          @for (p of priorityMeta; track p.priority) {
            <span
              class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
              [class]="p.cls"
            >
              {{ p.label }} priority
              <span class="rounded-full bg-white/70 px-1.5">{{ pcount(p.priority) }}</span>
            </span>
          }
        </div>

        <!-- Ticket feed -->
        <div class="mt-6">
          <h3 class="mb-2 text-sm font-semibold text-slate-700">Recent activity</h3>
          <div class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            @for (t of feed(); track t.id) {
              <div class="flex items-center gap-3 px-4 py-3">
                <span class="font-mono text-xs font-semibold text-slate-400">PROJ-{{ t.ticket_no }}</span>
                <span class="flex-1 truncate text-sm text-slate-700">{{ t.title }}</span>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  [class]="statusChip(t.status)"
                >
                  {{ statusLabel(t.status) }}
                </span>
              </div>
            } @empty {
              <p class="px-4 py-6 text-center text-sm text-slate-400">No issues yet.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
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
