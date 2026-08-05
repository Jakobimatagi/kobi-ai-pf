import type { Type } from '@angular/core';

// Registry of components hosted by this Angular micro-frontend.
// Add an entry here to surface a new component in the nav + home grid + routes.
export interface MfeComponent {
  path: string;
  label: string;
  description: string;
  emoji: string;
  loadComponent: () => Promise<Type<unknown>>;
}

export const COMPONENTS: MfeComponent[] = [
  {
    path: 'wordle',
    label: 'Wordle',
    description: 'Daily word game, word of the day served from Supabase.',
    emoji: '🟩',
    loadComponent: () => import('./wordle/wordle').then((m) => m.Wordle),
  },
  {
    path: 'board-summary',
    label: 'Board Summary',
    description: 'Live read-only rollup of the Kanban board, synced via Supabase Realtime.',
    emoji: '📊',
    loadComponent: () =>
      import('./board-summary/board-summary').then((m) => m.BoardSummary),
  },
  {
    path: 'signals',
    label: 'Signals Lab',
    description:
      'Interactive tour of Angular signals — signal, computed & effect across three live demos.',
    emoji: '⚡',
    loadComponent: () =>
      import('./signals-lab/signals-lab').then((m) => m.SignalsLab),
  },
];
