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
    path: 'signals',
    label: 'Signals Lab',
    description:
      'Interactive tour of Angular signals — signal, computed & effect wired to a live reactive graph.',
    emoji: '⚡',
    loadComponent: () =>
      import('./signals-lab/signals-lab').then((m) => m.SignalsLab),
  },
];
