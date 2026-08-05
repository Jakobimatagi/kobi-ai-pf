<script setup lang="ts">
import { ref } from 'vue';
import { REMOTES } from '../mfe/config';
import { getBoardId } from '../mfe/board';

const loaded = ref(false);

// Pass the per-browser board id to the Angular iframe. It's a different origin,
// so a URL param is the only channel — the Angular MFE reads ?board= on load.
const angularSrc = `${REMOTES.angular.url}?board=${encodeURIComponent(getBoardId())}`;
</script>

<template>
  <section>
    <header class="mb-5 flex items-center gap-3">
      <h1 class="text-xl font-bold text-slate-800">Angular MFE</h1>
      <span
        class="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700"
      >
        Angular · iframe isolation
      </span>
    </header>
    <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        v-if="!loaded"
        class="absolute inset-0 flex items-center justify-center text-slate-400"
      >
        <span class="animate-pulse">Loading Angular MFE…</span>
      </div>
      <iframe
        :src="angularSrc"
        title="Angular micro-frontend"
        class="h-[680px] w-full border-0"
        @load="loaded = true"
      ></iframe>
    </div>
  </section>
</template>
