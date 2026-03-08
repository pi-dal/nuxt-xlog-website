<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useContentRoutes } from '~/composables/useContentRoutes'
import { formatDate } from '~/logics'
import { getYearHeadingClassNames, groupContentEntriesByYear } from '~/logics/content-list'
import { buildAbsoluteUrl, resolveSiteUrl } from '~/logics/site-meta'
import { siteConfig } from '~/site/config'

interface Props {
  collection: 'books' | 'posts'
  description: string
  emptyMessage?: string
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'Nothing here yet.',
})

const entries = useContentRoutes({ collection: props.collection })
const groups = computed(() => groupContentEntriesByYear(entries.value))
const siteUrl = resolveSiteUrl()
const yearHeadingClassNames = getYearHeadingClassNames()

useHead(() => ({
  title: `${props.title} - ${siteConfig.title}`,
  meta: [
    { name: 'description', content: props.description },
    { property: 'og:title', content: `${props.title} - ${siteConfig.title}` },
    { property: 'og:description', content: props.description },
    { property: 'og:image', content: buildAbsoluteUrl(siteUrl, `/og/${props.collection}.png`) },
  ],
}))
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-10 md:mb-14">
      <h1 class="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
        {{ title }}
      </h1>
      <p class="max-w-2xl text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {{ description }}
      </p>
    </div>

    <div v-if="entries.length">
      <div
        v-for="(group, groupIndex) in groups"
        :key="group.label"
        class="mb-10 md:mb-14"
      >
        <div
          class="mb-4 md:mb-5 flex items-center gap-4 slide-enter"
          :style="{ '--enter-stage': groupIndex, '--enter-step': '80ms' }"
        >
          <span :class="yearHeadingClassNames">
            {{ group.label }}
          </span>
          <div class="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div class="space-y-4">
          <article
            v-for="(entry, entryIndex) in group.entries"
            :key="entry.path"
            class="slide-enter"
            :style="{ '--enter-stage': groupIndex + entryIndex + 1, '--enter-step': '80ms' }"
          >
            <RouterLink
              :to="entry.path"
              class="group block no-underline"
            >
              <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <h2 class="text-lg md:text-xl leading-tight font-normal text-zinc-800 dark:text-zinc-100 transition-colors group-hover:text-zinc-500 dark:group-hover:text-zinc-300">
                    {{ entry.title }}
                  </h2>
                  <p
                    v-if="entry.summary"
                    class="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
                  >
                    {{ entry.summary }}
                  </p>
                </div>

                <div class="mt-1 md:mt-0 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 md:justify-end">
                  <time v-if="entry.date" :datetime="entry.date" class="whitespace-nowrap">
                    {{ formatDate(entry.date, true) }}
                  </time>
                  <span v-if="entry.tags.length" class="op70">
                    · {{ entry.tags.join(', ') }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </article>
        </div>
      </div>
    </div>

    <div v-else class="py-12">
      <p class="text-zinc-500 dark:text-zinc-400">
        {{ emptyMessage }}
      </p>
    </div>
  </div>
</template>
