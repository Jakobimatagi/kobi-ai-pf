import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

// Production URLs of the deployed remotes (override with env vars).
const DEFAULT_WEATHER_REMOTE = 'https://kobi-ai-pf-weather.vercel.app/remoteEntry.js';
const DEV_WEATHER_REMOTE = 'http://localhost:5001/remoteEntry.js';

// Vue "shell" — the Module Federation host.
// Consumes the React weather remote at runtime and mounts it inline.
// The Angular remote is embedded via iframe (see WordleView.vue).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode !== 'production';
  const weatherRemote =
    env.VITE_WEATHER_REMOTE_URL ??
    (isDev ? DEV_WEATHER_REMOTE : DEFAULT_WEATHER_REMOTE);

  return {
    plugins: [
      vue(),
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: {
          mfe_weather: {
            type: 'module',
            name: 'mfe_weather',
            entry: weatherRemote,
            entryGlobalName: 'mfe_weather',
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
