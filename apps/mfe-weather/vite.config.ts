import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cssInjected from 'vite-plugin-css-injected-by-js';
import { federation } from '@module-federation/vite';

// React "Weather" micro-frontend — exposed as a Module Federation remote.
// Dev/standalone: http://localhost:5001
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inline the remote's CSS into JS so Tailwind styles auto-inject into the
    // host's <head> when this remote is mounted via Module Federation.
    cssInjected(),
    federation({
      name: 'mfe_weather',
      filename: 'remoteEntry.js',
      exposes: {
        './WeatherApp': './src/mount.tsx',
      },
      dts: false,
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
  server: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  build: {
    target: 'chrome89',
    modulePreload: false,
    minify: true,
    cssCodeSplit: false,
  },
});
