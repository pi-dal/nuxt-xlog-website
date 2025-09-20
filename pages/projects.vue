<script setup lang="ts">
import type { XLogPortfolio } from '~/types'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import ArtPlum from '~/components/ArtPlum.vue'
import { getPortfolioDirect } from '~/logics/xlog-direct'

const route = useRoute()

const portfolios = ref<XLogPortfolio[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    portfolios.value = await getPortfolioDirect()
  }
  catch (error) {
    console.error('Failed to load portfolio:', error)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- 树枝动画效果 -->
    <ClientOnly>
      <ArtPlum />
    </ClientOnly>

    <div class="prose dark:prose-invert max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="!mb-2">
          Projects
        </h1>
        <p class="!mt-0 opacity-75">
          Projects that I created or maintaining.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-8 text-center">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
        </div>
        <p class="mt-2 text-sm opacity-75">
          Loading projects...
        </p>
      </div>

      <!-- Projects -->
      <div v-else-if="portfolios.length > 0" class="not-prose">
        <!-- Projects Grid -->
        <div class="space-y-3">
          <div
            v-for="project in portfolios"
            :key="project.id"
            class="group relative block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <!-- Project Title -->
                <h3 class="font-semibold text-gray-900 dark:text-white transition-colors group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:underline group-hover:decoration-slate-400/70 group-hover:decoration-2">
                  {{ project.title }}
                </h3>

                <!-- Project Description -->
                <p class="mt-1 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {{ project.excerpt }}
                </p>

                <!-- Project Meta -->
                <div class="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <time :datetime="project.date_published">
                    {{ new Date(project.date_published).getFullYear() }}
                  </time>
                </div>
              </div>

              <!-- Project Image/Icon -->
              <div class="ml-4 flex-shrink-0">
                <div class="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <img
                    v-if="project.cover"
                    :src="project.cover"
                    :alt="project.title"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-6 h-6 rounded bg-slate-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ project.title.charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Click to view -->
            <RouterLink
              :to="`/posts/${project.slug}`"
              class="absolute inset-0"
              :aria-label="`View ${project.title}`"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center">
        <div class="max-w-sm mx-auto">
          <p class="text-gray-600 dark:text-gray-300 mb-2">
            No projects yet.
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Projects will show articles tagged with "portfolio" in your xLog.
          </p>
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="prose dark:prose-invert max-w-3xl mx-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
        <span class="font-mono opacity-50">> </span>
        <RouterLink
          :to="route.path.split('/').slice(0, -1).join('/') || '/'"
          class="font-mono opacity-50 hover:opacity-75"
        >
          cd ..
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group {
  position: relative;
}
</style>
