<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

const links = [
  { to: '/', label: 'Home' },
  { to: '/react', label: 'React' },
  { to: '/angular', label: 'Angular' },
];
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <RouterLink to="/" class="flex items-center gap-2">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white"
          >
            k
          </span>
          <span class="font-semibold tracking-tight">kobi<span class="text-slate-400">.ai</span></span>
        </RouterLink>
        <nav class="flex items-center gap-1">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            active-class="!bg-slate-900 !text-white"
            exact-active-class="!bg-slate-900 !text-white"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>

    <footer class="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
      Vue shell · React &amp; Angular micro-frontends · Supabase backend
    </footer>
  </div>
</template>
