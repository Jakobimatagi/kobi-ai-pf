<script setup lang="ts">
// Understated, factual account of how the project was built.
const decisions = [
  {
    title: 'Two integration strategies, chosen deliberately',
    body: 'The React app is loaded at runtime via Module Federation and mounted into this Vue shell; the Angular app is embedded via iframe for hard runtime/style isolation. The iframe was chosen after Angular’s native-federation runtime proved end-of-life and incompatible with Vite.',
  },
  {
    title: 'Debugging the tooling’s blind spots',
    body: 'Diagnosed a Vite React-refresh preamble error when mounting a React remote in a non-React host (fix: serve the remote as a built artifact), a Tailwind v4 gradient-utility rename, and a production CORS/URL mismatch — the last caught by verifying the live deployment rather than assuming it worked.',
  },
  {
    title: 'Structured to grow',
    body: 'Each micro-frontend is a full app that hosts many components through a registry. Adding a component is a single entry — it appears in that app’s nav, home grid, and routes with no changes to the shell.',
  },
];

const standards = [
  'Strict TypeScript across all three frameworks',
  'Small, single-responsibility modules',
  'Environment-driven config — no hardcoded URLs',
  'CI that type-checks and builds every app on each PR',
  'Conventional commits and a documented deploy path',
  'Behaviour verified in a real browser before it’s called done',
];
</script>

<template>
  <section>
    <div class="mb-8 max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">
        How this was built
      </h1>
      <p class="mt-3 text-slate-600">
        This project was built AI-assisted and engineer-directed. The AI wrote
        code quickly; the architecture, technical decisions, code review, and
        debugging were mine. The commit history is co-authored and left intact —
        the point isn’t who typed each line, it’s the judgment that made the
        output production-ready.
      </p>
    </div>

    <h2 class="mb-3 text-sm font-semibold tracking-wide text-slate-400 uppercase">
      Decisions
    </h2>
    <div class="grid gap-4">
      <div
        v-for="d in decisions"
        :key="d.title"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 class="font-semibold text-slate-800">{{ d.title }}</h3>
        <p class="mt-1 text-sm text-slate-600">{{ d.body }}</p>
      </div>
    </div>

    <h2 class="mt-8 mb-3 text-sm font-semibold tracking-wide text-slate-400 uppercase">
      Standards held throughout
    </h2>
    <ul class="grid gap-2 sm:grid-cols-2">
      <li
        v-for="s in standards"
        :key="s"
        class="flex items-start gap-2 text-sm text-slate-600"
      >
        <span class="mt-0.5 text-slate-900">✓</span>
        <span>{{ s }}</span>
      </li>
    </ul>

    <p class="mt-8 text-sm text-slate-500">
      Source, commit history, and CI are public on
      <a
        href="https://github.com/Jakobimatagi/kobi-ai-pf"
        target="_blank"
        rel="noopener"
        class="font-medium text-slate-900 underline underline-offset-2"
      >GitHub</a>.
    </p>
  </section>
</template>
