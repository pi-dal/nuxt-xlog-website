<script setup lang="ts">
import { buildGitHubRepoHref, parseGitHubRepo } from '~/logics/embeds'

const props = defineProps<{
  repo: string
  title?: string
  description?: string
  badge?: string
}>()

const parsed = computed(() => parseGitHubRepo(props.repo))
const href = computed(() => buildGitHubRepoHref(props.repo))
const heading = computed(() => props.title || parsed.value.name)
</script>

<template>
  <AppLink
    :to="href"
    class="group my-6 block overflow-hidden rounded-3xl border border-zinc-200 bg-linear-to-br from-white via-zinc-50 to-zinc-100 p-5 no-underline transition duration-300 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:hover:border-zinc-700"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="mb-2 text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
          GitHub Repository
        </p>
        <h3 class="text-xl font-semibold text-zinc-900 transition group-hover:text-black dark:text-zinc-100 dark:group-hover:text-white">
          {{ heading }}
        </h3>
        <p class="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {{ parsed.repo }}
        </p>
      </div>
      <span
        v-if="badge"
        class="shrink-0 rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
      >
        {{ badge }}
      </span>
      <div
        v-else
        class="i-ri-github-fill mt-1 shrink-0 text-xl text-zinc-400 transition group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-100"
      />
    </div>

    <p
      v-if="description"
      class="m-0 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300"
    >
      {{ description }}
    </p>

    <div class="mt-4 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      <span>Open repository</span>
      <div class="i-ri-arrow-right-up-line transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  </AppLink>
</template>
