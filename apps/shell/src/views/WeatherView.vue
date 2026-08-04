<script setup lang="ts">
import RemoteMount from '../components/RemoteMount.vue';

// Lazy-load the React remote's exposed mount module at runtime via
// Module Federation. The @module-federation/vite plugin resolves this
// specifier against the configured remote entry.
const loadWeather = () =>
  import('mfe_weather/WeatherApp') as Promise<{
    mount: (el: HTMLElement) => () => void;
  }>;
</script>

<template>
  <section>
    <header class="mb-5 flex items-center gap-3">
      <h1 class="text-xl font-bold text-slate-800">Weather</h1>
      <span
        class="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700"
      >
        React · Module Federation
      </span>
    </header>
    <div class="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
      <RemoteMount :loader="loadWeather" />
    </div>
  </section>
</template>
