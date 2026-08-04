// Central registry of micro-frontend endpoints.
// Each MFE is a whole framework app (many components); the shell integrates the
// app as a unit and lets it handle its own internal navigation.
// Remote URLs are environment-driven so the same build works locally and in
// production. In dev they default to localhost; in prod to the deployed URLs.
const isDev = import.meta.env.DEV;

export const REMOTES = {
  react: {
    // Module Federation remote (React) — the whole app is mounted inline.
    // The remoteEntry URL itself is wired at build time in vite.config.ts.
    remoteName: 'mfe_react',
    exposedModule: './App',
  },
  angular: {
    // Iframe-embedded remote (Angular) — isolated runtime + styles.
    url:
      (import.meta.env.VITE_ANGULAR_URL as string | undefined) ??
      (isDev ? 'http://localhost:5002' : 'https://kobi-ai-pf-angular.vercel.app'),
  },
} as const;
