<script setup lang="ts">
import type { XLogPost } from '~/types'
import { formatDate } from '~/logics'
import { getAllPostsDirect } from '~/logics/xlog-direct'

const props = defineProps<{
  limit?: number
}>()

const posts = ref<XLogPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    const allPosts = await getAllPostsDirect()
    posts.value = allPosts.slice(0, props.limit || 50)
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load posts'
    console.error('Error loading posts:', err)
  }
  finally {
    loading.value = false
  }
})

const getPostUrl = (post: XLogPost) => `/posts/${post.slug}`
</script>

<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="loading" class="py-8 text-center">
      <div class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
      <div class="mt-2 opacity-50">Loading posts...</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="py-8 text-center text-red-500">
      <div class="mb-2">Failed to load posts</div>
      <div class="text-sm opacity-75">{{ error }}</div>
      <button
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        @click="onMounted"
      >
        Retry
      </button>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="posts.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
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
      <div class="mb-2">No posts found</div>
      <div class="text-sm opacity-75">Check your xLog configuration or try again later</div>
    </div>
  </div>
</template> 