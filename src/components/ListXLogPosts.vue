<script setup lang="ts">
import type { XLogPost } from '~/types'
import { formatDate } from '~/logics'
import { getAllPostsDirect } from '~/logics/xlog-direct'

const props = defineProps<{
  limit?: number
}>()

const allPosts = ref<XLogPost[]>([])
const posts = ref<XLogPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const postsPerPage = 4

onMounted(async () => {
  try {
    loading.value = true
    allPosts.value = await getAllPostsDirect()
    updateDisplayedPosts()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load posts'
    console.error('Error loading posts:', err)
  }
  finally {
    loading.value = false
  }
})

function updateDisplayedPosts() {
  if (props.limit) {
    // 如果有limit属性，只显示指定数量的文章（首页等场景）
    posts.value = allPosts.value.slice(0, props.limit)
  }
  else {
    // 否则实现分页
    const startIndex = (currentPage.value - 1) * postsPerPage
    const endIndex = startIndex + postsPerPage
    posts.value = allPosts.value.slice(startIndex, endIndex)
  }
}

const totalPages = computed(() => {
  if (props.limit)
    return 1
  return Math.ceil(allPosts.value.length / postsPerPage)
})

function goToPage(page: number) {
  currentPage.value = page
  updateDisplayedPosts()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getPostUrl = (post: XLogPost) => `/posts/${post.slug}`
</script>

<template>
  <div>
    <!-- Loading and error states -->
    <LoadingErrorState
      :loading="loading"
      :error="error"
      loading-text="Loading posts..."
      error-text="Failed to load posts"
      :show-retry="true"
      @retry="onMounted"
    />

    <!-- 文章列表 -->
    <div v-if="!loading && !error && posts.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
      <article
        v-for="post in posts"
        :key="post.id"
        class="py-6 first:pt-0 last:pb-0"
      >
        <div class="flex flex-col space-y-3">
          <!-- 文章标题和链接 -->
          <h2 class="text-xl font-semibold">
            <RouterLink
              :to="getPostUrl(post)"
              class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {{ post.title }}
            </RouterLink>
          </h2>

          <!-- 文章摘要 -->
          <p v-if="post.excerpt || post.summary" class="text-gray-600 dark:text-gray-400 line-clamp-3">
            {{ post.excerpt || post.summary }}
          </p>

          <!-- 文章元信息 -->
          <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <time :datetime="post.date_published">
              {{ formatDate(post.date_published) }}
            </time>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
      <div class="mb-2">
        No posts found
      </div>
      <div class="text-sm opacity-75">
        Check your xLog configuration or try again later
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && !error && !props.limit && totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex items-center space-x-2">
        <!-- 上一页 -->
        <button
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>

        <!-- 页码 -->
        <template v-for="page in Math.min(totalPages, 7)" :key="page">
          <!-- 如果总页数<=7，显示所有页码 -->
          <button
            v-if="totalPages <= 7"
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <!-- 如果总页数>7，显示智能分页 -->
          <template v-else>
            <!-- 第1页 -->
            <button
              v-if="page === 1"
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                1 === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ]"
              @click="goToPage(1)"
            >
              1
            </button>
            <!-- 省略号 -->
            <span v-if="page === 2 && currentPage > 4" class="px-3 py-2 text-gray-400 dark:text-gray-600">...</span>
            <!-- 当前页前后页码 -->
            <button
              v-if="page >= Math.max(2, currentPage - 1) && page <= Math.min(totalPages - 1, currentPage + 1)"
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <!-- 省略号 -->
            <span v-if="page === 6 && currentPage < totalPages - 3" class="px-3 py-2 text-gray-400 dark:text-gray-600">...</span>
            <!-- 最后一页 -->
            <button
              v-if="page === 7 && totalPages > 1"
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                totalPages === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ]"
              @click="goToPage(totalPages)"
            >
              {{ totalPages }}
            </button>
          </template>
        </template>

        <!-- 下一页 -->
        <button
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
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
    <div v-if="!loading && !error && !props.limit && allPosts.length > 0" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
      Showing {{ ((currentPage - 1) * postsPerPage) + 1 }} to {{ Math.min(currentPage * postsPerPage, allPosts.length) }} of {{ allPosts.length }} posts
    </div>
  </div>
</template>
