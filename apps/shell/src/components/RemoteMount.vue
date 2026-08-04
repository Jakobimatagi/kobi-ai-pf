<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// Mounts a Module Federation remote that exposes a `mount(el)` contract.
// `loader` returns the remote module; we call its mount() into our container
// and invoke the returned cleanup on unmount.
const props = defineProps<{
  loader: () => Promise<{ mount: (el: HTMLElement) => void | (() => void) }>;
}>();

const container = ref<HTMLElement | null>(null);
const status = ref<'loading' | 'ready' | 'error'>('loading');
const errorMessage = ref('');
let cleanup: (() => void) | void;

onMounted(async () => {
  try {
    const mod = await props.loader();
    if (!container.value) return;
    cleanup = mod.mount(container.value);
    status.value = 'ready';
  } catch (err) {
    status.value = 'error';
    errorMessage.value = err instanceof Error ? err.message : String(err);
    console.error('[shell] failed to load remote', err);
  }
});

onBeforeUnmount(() => {
  try {
    cleanup?.();
  } catch (err) {
    console.error('[shell] error during remote cleanup', err);
  }
});
</script>

<template>
  <div class="relative min-h-[420px]">
    <div
      v-if="status === 'loading'"
      class="absolute inset-0 flex items-center justify-center text-slate-400"
    >
      <span class="animate-pulse">Loading remote…</span>
    </div>

    <div
      v-else-if="status === 'error'"
      class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
    >
      <p class="font-semibold">Couldn’t load this micro-frontend.</p>
      <p class="mt-1 text-sm">Make sure its dev server is running.</p>
      <pre class="mt-3 overflow-x-auto rounded bg-red-100 p-2 text-xs">{{ errorMessage }}</pre>
    </div>

    <div ref="container"></div>
  </div>
</template>
