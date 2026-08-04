<script setup lang="ts">
import { RouterLink } from 'vue-router';

const cards = [
  {
    to: '/react',
    title: 'React MFE',
    framework: 'React',
    tone: 'sky',
    desc: 'A React 19 + MUI app hosting multiple components (starting with a live weather forecast), loaded into this Vue shell over Module Federation.',
    emoji: '⚛️',
  },
  {
    to: '/angular',
    title: 'Angular MFE',
    framework: 'Angular',
    tone: 'rose',
    desc: 'An Angular 22 + Angular Material app hosting multiple components (starting with a daily Wordle backed by Supabase), embedded via iframe.',
    emoji: '🅰️',
  },
];
</script>

<template>
  <section>
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">
        Micro-frontend playground
      </h1>
      <p class="mt-2 max-w-2xl text-slate-600">
        A Vue 3 shell orchestrating independently-built React and Angular
        micro-frontends — each its own framework, build pipeline, and
        integration strategy. TypeScript, Tailwind, and Material throughout.
      </p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <RouterLink
        v-for="card in cards"
        :key="card.to"
        :to="card.to"
        class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <span class="text-4xl">{{ card.emoji }}</span>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            :class="
              card.tone === 'sky'
                ? 'bg-sky-100 text-sky-700'
                : 'bg-rose-100 text-rose-700'
            "
          >
            {{ card.framework }}
          </span>
        </div>
        <h2 class="mt-4 text-lg font-semibold text-slate-800">
          {{ card.title }}
        </h2>
        <p class="mt-1 text-sm text-slate-500">{{ card.desc }}</p>
        <span
          class="mt-4 inline-block text-sm font-semibold text-slate-900 group-hover:underline"
        >
          Open →
        </span>
      </RouterLink>
    </div>
  </section>
</template>
