import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

// Vue "shell" — the Module Federation host.
// Consumes the React weather remote at runtime and mounts it inline.
// The Angular remote is embedded via iframe (see WordleView.vue).
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    federation({
      name: 'shell',
      remotes: {
        mfe_weather: {
          type: 'module',
          name: 'mfe_weather',
          entry: 'http://localhost:5001/remoteEntry.js',
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
});
