import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

// Production URLs of the deployed remotes (override with env vars).
const DEFAULT_REACT_REMOTE =
  'https://kobi-ai-pf-mfe-react.vercel.app/remoteEntry.js';
const DEV_REACT_REMOTE = 'http://localhost:5001/remoteEntry.js';

// Vue "shell" — the Module Federation host.
// Consumes the React MFE (a whole app) at runtime and mounts it inline.
// The Angular MFE is embedded via iframe (see AngularView.vue).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode !== 'production';
  const reactRemote =
    env.VITE_REACT_REMOTE_URL ??
    (isDev ? DEV_REACT_REMOTE : DEFAULT_REACT_REMOTE);

  return {
    plugins: [
      vue(),
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: {
          mfe_react: {
            type: 'module',
            name: 'mfe_react',
            entry: reactRemote,
            entryGlobalName: 'mfe_react',
          },
        },
        dts: false,
        shared: {},
      }),
    ],
    server: {
      port: 5000,
      strictPort: true,
    },
    build: {
      target: 'chrome89',
    },
  };
});
