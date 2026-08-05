import type { ReactNode } from 'react';
import Weather from './features/weather/Weather';
import Board from './features/jira/Board';

// Registry of components hosted by this React micro-frontend.
// Add an entry here to surface a new component in the nav + home grid.
export interface ComponentEntry {
  path: string;
  label: string;
  description: string;
  emoji: string;
  element: ReactNode;
}

export const COMPONENTS: ComponentEntry[] = [
  {
    path: '/weather',
    label: 'Weather',
    description: 'Live 7-day forecast from the Open-Meteo API.',
    emoji: '⛅',
    element: <Weather />,
  },
  {
    path: '/board',
    label: 'Project Board',
    description: 'Full-CRUD Kanban with drag & drop, backed by a REST edge function and live-synced via Supabase Realtime.',
    emoji: '🗂️',
    element: <Board />,
  },
];
