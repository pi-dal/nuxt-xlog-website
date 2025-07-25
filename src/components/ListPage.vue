<script setup lang="ts">
import type { XLogPost } from '~/types'
import { useHead } from '@unhead/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import ArtPlum from '~/components/ArtPlum.vue'

interface Props {
  fetchDataFunction: () => Promise<XLogPost[]>
  title: string
  description: string
  contentType: 'Post' | 'Book'
  basePath: string
  usePagination?: boolean
  itemsPerPage?: number
  ogImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  usePagination: false,
  itemsPerPage: 10,
  ogImage: '',
})

const route = useRoute()

// 设置页面meta
useHead(() => {
  const ogImage = props.ogImage || `https://pi-dal.com/og/${props.basePath.slice(1)}.png`
  const siteTitle = `${props.title} - pi-dal`

  return {
    title: siteTitle,
    meta: [
      { name: 'description', content: `All ${props.contentType.toLowerCase()}s from pi-dal` },
      { property: 'og:title', content: siteTitle },
      { property: 'og:description', content: props.description },
      { property: 'og:image', content: ogImage },
    ],
  }
})

// 响应式数据
const allItems = ref<XLogPost[]>([])
const displayedItems = ref<XLogPost[]>([])
const pending = ref(true)
const error = ref<string | null>(null)

// 分页状态
const currentPage = ref(1)

// 计算属性
const totalPages = computed(() => {
  if (!props.usePagination)
    return 1
  return Math.ceil(allItems.value.length / props.itemsPerPage)
})

// 生成分页页码数组
const paginationItems = computed(() => {
  const items: (number | 'ellipsis')[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    // 如果总页数不超过7页，显示所有页码
    for (let i = 1; i <= total; i++) {
      items.push(i)
    }
  }
  else {
    // 智能分页：始终显示第1页
    items.push(1)

    if (current <= 4) {
      // 当前页在前4页时：1 2 3 4 5 ... total
      for (let i = 2; i <= 5; i++) {
        items.push(i)
      }
      if (total > 6) {
        items.push('ellipsis')
      }
    }
    else if (current >= total - 3) {
      // 当前页在后4页时：1 ... (total-4) (total-3) (total-2) (total-1) total
      if (total > 6) {
        items.push('ellipsis')
      }
      for (let i = total - 4; i <= total - 1; i++) {
        if (i > 1) {
          items.push(i)
        }
      }
    }
    else {
      // 当前页在中间时：1 ... (current-1) current (current+1) ... total
      items.push('ellipsis')
      for (let i = current - 1; i <= current + 1; i++) {
        items.push(i)
      }
      items.push('ellipsis')
    }

    // 始终显示最后一页（如果不是第1页）
    if (total > 1) {
      items.push(total)
    }
  }

  return items
})

// 获取数据
async function fetchData() {
  try {
    pending.value = true
    error.value = null

    const data = await props.fetchDataFunction()

    // 对于posts，按发布时间倒序排列
    if (props.contentType === 'Post') {
      allItems.value = data.sort((a, b) =>
        new Date(b.date_published || 0).getTime() - new Date(a.date_published || 0).getTime(),
      )
    }
    else {
      allItems.value = data
    }

    updateDisplayedItems()
  }
  catch (fetchError) {
    console.error(`Error fetching ${props.contentType.toLowerCase()}s:`, fetchError)
    error.value = fetchError instanceof Error ? fetchError.message : `Failed to load ${props.contentType.toLowerCase()}s`
  }
  finally {
    pending.value = false
  }
}

// 更新显示的项目
function updateDisplayedItems() {
  if (!props.usePagination) {
    displayedItems.value = allItems.value
  }
  else {
    const startIndex = (currentPage.value - 1) * props.itemsPerPage
    const endIndex = startIndex + props.itemsPerPage
    displayedItems.value = allItems.value.slice(startIndex, endIndex)
  }
}

// 分页导航
function goToPage(page: number) {
  currentPage.value = page
  updateDisplayedItems()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 在组件挂载时获取数据
onMounted(fetchData)
</script>

<template>
  <div>
    <!-- 树枝动画效果 -->
    <ClientOnly>
      <ArtPlum />
    </ClientOnly>

    <!-- 页面内容 -->
    <div :class="contentType === 'Book' ? 'prose dark:prose-invert max-w-3xl mx-auto' : ''">
      <!-- 页面头部 -->
      <div class="mb-8 text-center">
        <h1 :class="contentType === 'Book' ? '!mb-2' : 'text-3xl lg:text-4xl font-bold mb-4'">
          {{ title }}
        </h1>
        <p :class="contentType === 'Book' ? '!mt-0 opacity-75' : 'text-gray-600 dark:text-gray-400'">
          {{ description }}
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="pending" :class="contentType === 'Book' ? 'py-8 text-center' : 'py-20 text-center'">
        <div :class="contentType === 'Book' ? 'flex items-center justify-center' : 'animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full'">
          <div v-if="contentType === 'Book'" class="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
        </div>
        <div :class="contentType === 'Book' ? 'mt-2 text-sm opacity-75' : 'mt-4 opacity-50'">
          Loading {{ contentType.toLowerCase() }}s...
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" :class="contentType === 'Book' ? 'py-8 text-center text-red-500' : 'py-20 text-center'">
        <div :class="contentType === 'Book' ? 'mb-2' : 'text-red-500 text-lg mb-2'">
          Failed to load {{ contentType.toLowerCase() }}s
        </div>
        <div :class="contentType === 'Book' ? 'text-sm opacity-75' : 'mb-4 text-sm opacity-75'">
          {{ error }}
        </div>
        <button
          :class="contentType === 'Book' ? 'mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600' : 'text-blue-500 hover:text-blue-600'"
          @click="fetchData"
        >
          {{ contentType === 'Book' ? 'Retry' : 'Retry' }}
        </button>
      </div>

      <!-- 内容列表 -->
      <div v-else-if="displayedItems.length > 0" :class="contentType === 'Post' ? 'max-w-4xl mx-auto' : 'not-prose'">
        <!-- 使用插槽让父组件自定义列表项渲染 -->
        <slot :items="displayedItems" />

        <!-- 分页控件 -->
        <div v-if="usePagination && totalPages > 1" class="mt-8 flex justify-center">
          <nav class="flex items-center space-x-2">
            <!-- Previous Page -->
            <button
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="[
                currentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ]"
              @click="goToPage(currentPage - 1)"
            >
              Previous
            </button>

            <!-- Page Numbers -->
            <template v-for="(item, index) in paginationItems" :key="`${item}-${index}`">
              <!-- Ellipsis -->
              <span
                v-if="item === 'ellipsis'"
                class="px-3 py-2 text-gray-400 dark:text-gray-600"
              >
                ...
              </span>
              <!-- Page Button -->
              <button
                v-else
                class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
                :class="[
                  item === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
                @click="goToPage(item)"
              >
                {{ item }}
              </button>
            </template>

            <!-- Next Page -->
            <button
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="[
                currentPage === totalPages
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ]"
              @click="goToPage(currentPage + 1)"
            >
              Next
            </button>
          </nav>
        </div>

        <!-- 分页信息 -->
        <div v-if="usePagination && allItems.length > 0" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, allItems.length) }} of {{ allItems.length }} {{ contentType.toLowerCase() }}s
        </div>
      </div>

      <!-- 无内容状态 -->
      <div v-else :class="contentType === 'Book' ? 'py-12 text-center' : 'text-center p-10'">
        <div :class="contentType === 'Book' ? 'max-w-sm mx-auto' : ''">
          <p class="text-gray-600 dark:text-gray-300 mb-2">
            {{ contentType === 'Book' ? 'No reading notes yet.' : 'No posts found.' }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ contentType === 'Book'
              ? 'Reading notes will show articles tagged with "微信读书" in your xLog.'
              : `${contentType}s will appear here once they are published.`
            }}
          </p>
        </div>
      </div>

      <!-- 底部导航 -->
      <div :class="contentType === 'Book' ? 'prose dark:prose-invert max-w-3xl mx-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden' : 'max-w-4xl mx-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden'">
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
