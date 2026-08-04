import type { ReactNode } from 'react';
import Weather from './features/weather/Weather';

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
];
