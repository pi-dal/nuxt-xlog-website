<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

export interface TocItem {
  id: string
  text: string
  level: number
  children?: TocItem[]
}

defineProps<{
  items: TocItem[]
}>()

const activeId = ref<string | null>(null)

function handleScroll() {
  let currentId = ''
  const headings = document.querySelectorAll('article h1, article h2, article h3, article h4')

  headings.forEach((heading) => {
    if (heading.getBoundingClientRect().top < 120) {
      currentId = heading.id
    }
  })

  activeId.value = currentId
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Set initial active heading

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<template>
  <nav class="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pl-4 text-sm">
    <h3 class="font-semibold mb-2 text-sm text-gray-900 dark:text-gray-100">
      目录
    </h3>
    <ul class="space-y-1">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          class="block py-1 rounded-md transition-all duration-200"
          :class="[
            activeId === item.id
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50',
            `pl-${(item.level - 1) * 3 + 3}`,
          ]"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
