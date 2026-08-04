// Central registry of micro-frontend endpoints.
// Remote URLs are environment-driven so the same build works locally and in
// production. In dev they default to localhost; in prod to the deployed URLs.
const isDev = import.meta.env.DEV;

export const REMOTES = {
  weather: {
    // Module Federation remote (React) — mounted inline in the shell DOM.
    // The remoteEntry URL itself is wired at build time in vite.config.ts.
    remoteName: 'mfe_weather',
    exposedModule: './WeatherApp',
  },
  wordle: {
    // Iframe-embedded remote (Angular) — isolated runtime + styles.
    url:
      (import.meta.env.VITE_WORDLE_URL as string | undefined) ??
      (isDev ? 'http://localhost:5002' : 'https://kobi-ai-pf-wordle.vercel.app'),
  },
} as const;
