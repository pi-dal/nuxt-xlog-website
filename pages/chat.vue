<script setup lang="ts">
import type { XLogPost } from '~/types'
import { useHead } from '@unhead/vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import ArtPlum from '~/components/ArtPlum.vue'
import { formatDate } from '~/logics'
import { useMarkdown } from '~/logics/markdown'
import { buildAbsoluteUrl, resolveSiteUrl } from '~/logics/site-meta'
import { useSiteInfo } from '~/logics/useSiteInfo'
import { getPostsByTagDirect } from '~/logics/xlog-direct'

const route = useRoute()
const { siteInfo } = useSiteInfo()
const siteUrl = computed(() => resolveSiteUrl(siteInfo.value))
const siteName = computed(() => siteInfo.value?.name || siteInfo.value?.subdomain || 'xLog')
const pageUrl = computed(() => buildAbsoluteUrl(siteUrl.value, route.path))
const ogImageUrl = computed(() => buildAbsoluteUrl(siteUrl.value, '/og/chat.png'))

// SEO
useHead(() => ({
  title: `Chat With Me - ${siteName.value}`,
  meta: [
    { name: 'description', content: `Chat and consultation with ${siteName.value}` },
    { property: 'og:title', content: `Chat With Me - ${siteName.value}` },
    { property: 'og:description', content: 'Let\'s have a meaningful conversation!' },
    { property: 'og:url', content: pageUrl.value },
    { property: 'og:image', content: ogImageUrl.value },
  ],
}))

// 响应式数据
const chatPost = ref<XLogPost | null>(null)
const pending = ref(true)
const error = ref<string | null>(null)
const renderedContent = ref('')

// Markdown渲染器
const { render: renderMarkdown } = useMarkdown()

// 获取聊天内容
async function fetchChatContent() {
  try {
    pending.value = true
    error.value = null

    const posts = await getPostsByTagDirect('Chat-With-Me')

    if (posts.length > 0) {
      // 取最新的一篇文章
      chatPost.value = posts.sort((a, b) =>
        new Date(b.date_published || 0).getTime() - new Date(a.date_published || 0).getTime(),
      )[0]

      // 渲染Markdown内容
      if (chatPost.value?.content) {
        try {
          renderedContent.value = await renderMarkdown(chatPost.value.content)
        }
        catch (renderError) {
          console.warn('Failed to render markdown:', renderError)
          // 如果渲染失败，使用原始内容
          renderedContent.value = chatPost.value.content.replace(/\n/g, '<br>')
        }
      }
    }
  }
  catch (fetchError) {
    console.error('Error fetching chat content:', fetchError)
    error.value = fetchError instanceof Error ? fetchError.message : 'Failed to load chat content'
  }
  finally {
    pending.value = false
  }
}

// 在组件挂载时获取数据
onMounted(fetchChatContent)
</script>

<template>
  <div>
    <!-- 树枝动画效果 -->
    <ClientOnly>
      <ArtPlum />
    </ClientOnly>

    <!-- 加载状态 -->
    <div v-if="pending" class="py-20 text-center">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
      <div class="mt-4 opacity-50">
        Loading chat content...
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="py-20 text-center">
      <div class="text-red-500 text-lg mb-2">
        Failed to load chat content
      </div>
      <div class="mb-4 text-sm opacity-75">
        {{ error }}
      </div>
      <button class="text-slate-500 hover:text-slate-400 transition-colors hover:underline hover:decoration-slate-400/70" @click="fetchChatContent">
        Retry
      </button>
    </div>

    <!-- 聊天内容 -->
    <div v-else-if="chatPost" class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl lg:text-4xl font-bold">
          {{ chatPost.title }}
        </h1>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          {{ formatDate(chatPost.date_published) }}
        </p>
      </div>

      <img
        v-if="chatPost.cover"
        :src="chatPost.cover"
        :alt="chatPost.title"
        class="w-full h-auto rounded-lg my-8 shadow-lg"
      >

      <article
        class="prose dark:prose-invert max-w-none slide-enter-content"
      >
        <div v-if="renderedContent" v-html="renderedContent" />
        <div v-else class="text-center italic opacity-70">
          No content available.
        </div>
      </article>
    </div>

    <!-- 无内容状态 -->
    <div v-else class="text-center p-10">
      <h1 class="text-3xl font-bold mb-4">
        Chat With Me
      </h1>
      <p class="text-gray-600">
        No chat content found.
      </p>
      <p class="text-sm text-gray-500 mt-2">
        Create a post with "Chat-With-Me" tag to display content here.
      </p>
    </div>

    <!-- 支付组件 - 简洁设计，总是显示在底部 -->
    <div class="max-w-4xl mx-auto">
      <PayMe />
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
