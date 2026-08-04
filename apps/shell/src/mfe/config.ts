// Central registry of micro-frontend endpoints.
// In production these become deployed URLs (e.g. via env vars).
export const REMOTES = {
  weather: {
    // Module Federation remote (React) — mounted inline in the shell DOM.
    remoteName: 'mfe_weather',
    exposedModule: './WeatherApp',
  },
  wordle: {
    // Iframe-embedded remote (Angular) — isolated runtime + styles.
    url: import.meta.env.VITE_WORDLE_URL ?? 'http://localhost:5002',
  },
} as const;
