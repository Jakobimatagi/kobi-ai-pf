<script setup lang="ts">
import RemoteMount from '../components/RemoteMount.vue';
import { getBoardId } from '../mfe/board';

// Lazy-load the React MFE's exposed app module at runtime via Module
// Federation. The @module-federation/vite plugin resolves this specifier
// against the configured remote entry. The React app handles its own routing.
const loadReactApp = () =>
  import('mfe_react/App') as Promise<{
    mount: (el: HTMLElement, ctx?: { boardId?: string }) => () => void;
  }>;

// Hand the per-browser board id to the React MFE via its mount() contract.
const mountOptions = { boardId: getBoardId() };
</script>

<template>
  <section>
    <header class="mb-5 flex items-center gap-3">
      <h1 class="text-xl font-bold text-slate-800">React MFE</h1>
      <span
        class="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700"
      >
        React · Module Federation
      </span>
    </header>
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <RemoteMount :loader="loadReactApp" :options="mountOptions" />
    </div>
  </section>
</template>
