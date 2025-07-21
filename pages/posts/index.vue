<script setup lang="ts">
import type { XLogPost } from '~/types'
import { useHead } from '@unhead/vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import ArtPlum from '~/components/ArtPlum.vue'
import { formatDate } from '~/logics'
import { getAllPostsDirect } from '~/logics/xlog-direct'

const route = useRoute()

// SEO
useHead({
  title: 'Blog Posts - pi-dal',
  meta: [
    { name: 'description', content: 'All blog posts from pi-dal' },
    { property: 'og:title', content: 'Blog Posts - pi-dal' },
    { property: 'og:description', content: 'Read all the latest posts and thoughts' },
    { property: 'og:image', content: 'https://pi-dal.com/og/posts.png' },
  ],
})

// 响应式数据
const posts = ref<XLogPost[]>([])
const pending = ref(true)
const error = ref<string | null>(null)

// 获取文章列表
async function fetchPosts() {
  try {
    pending.value = true
    error.value = null

    const allPosts = await getAllPostsDirect()

    // 按发布时间倒序排列
    posts.value = allPosts.sort((a, b) =>
      new Date(b.date_published || 0).getTime() - new Date(a.date_published || 0).getTime(),
    )
  }
  catch (fetchError) {
    console.error('Error fetching posts:', fetchError)
    error.value = fetchError instanceof Error ? fetchError.message : 'Failed to load posts'
  }
  finally {
    pending.value = false
  }
}

// 在组件挂载时获取数据
onMounted(fetchPosts)
</script>

<template>
  <div>
    <!-- 树枝动画效果 -->
    <ClientOnly>
      <ArtPlum />
    </ClientOnly>

    <!-- 页面头部 -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl lg:text-4xl font-bold mb-4">
        Blog Posts
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        My thoughts, experiences, and learnings
      </p>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="py-20 text-center">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
      <div class="mt-4 opacity-50">
        Loading posts...
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="py-20 text-center">
      <div class="text-red-500 text-lg mb-2">
        Failed to load posts
      </div>
      <div class="mb-4 text-sm opacity-75">
        {{ error }}
      </div>
      <button class="text-blue-500 hover:text-blue-600" @click="fetchPosts">
        Retry
      </button>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="posts.length > 0" class="max-w-4xl mx-auto">
      <div class="space-y-8">
        <article
          v-for="post in posts"
          :key="post.id"
          class="group border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0"
        >
          <RouterLink
            :to="`/posts/${post.slug}`"
            class="block transition-colors"
          >
            <!-- 文章信息 -->
            <div>
              <h2 class="text-2xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ post.title }}
              </h2>

              <p v-if="post.excerpt || post.summary" class="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                {{ post.excerpt || post.summary }}
              </p>

              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <time :datetime="post.date_published">
                  {{ formatDate(post.date_published, false) }}
                </time>
                <span v-if="post.author" class="ml-4">
                  by {{ post.author.name }}
                </span>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
    </div>

    <!-- 无内容状态 -->
    <div v-else class="text-center p-10">
      <p class="text-gray-600 dark:text-gray-300 mb-2">
        No posts found.
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Posts will appear here once they are published.
      </p>
    </div>

    <!-- 底部导航 -->
    <div class="max-w-4xl mx-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
      <span class="font-mono opacity-50">> </span>
      <RouterLink
        :to="route.path.split('/').slice(0, -1).join('/') || '/'"
        class="font-mono opacity-50 hover:opacity-75"
      >
        cd ..
      </RouterLink>
    </div>
  </div>
</template>
