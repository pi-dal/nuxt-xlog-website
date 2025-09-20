<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import ArtPlum from '~/components/ArtPlum.vue'
import Toc from '~/components/Toc.vue'
import { useAnchorNavigation } from '~/composables/useAnchorNavigation'
import { useMarkdownRenderer } from '~/composables/useMarkdownRenderer'
import { usePost } from '~/composables/usePost'
import { formatDate } from '~/logics'
import { buildAbsoluteUrl, resolveAuthorHandle, resolveSiteUrl } from '~/logics/site-meta'
import { useSiteInfo } from '~/logics/useSiteInfo'

interface Props {
  contentType: 'Post' | 'Book'
  basePath: '/posts' | '/books'
}

const props = defineProps<Props>()

const route = useRoute()
const slug = route.params.slug as string
const { siteInfo } = useSiteInfo()
const siteUrl = computed(() => resolveSiteUrl(siteInfo.value))
const canonicalUrl = computed(() => buildAbsoluteUrl(siteUrl.value, `${props.basePath}/${slug}`))
const ogImageUrl = computed(() => buildAbsoluteUrl(siteUrl.value, `/og/${slug}.png`))
const authorHandle = computed(() => resolveAuthorHandle(siteInfo.value))

// 使用组合式函数
const { post, pending, error, fetchPost } = usePost(slug)
const { renderedContent, tocItems, renderContent } = useMarkdownRenderer()

// Twitter URL
const tweetUrl = computed(() => {
  const handle = authorHandle.value
  const readableHandle = handle ? `@${handle}` : (post.value?.author?.name || siteInfo.value?.name || 'xLog')
  const shareUrl = buildAbsoluteUrl(siteUrl.value, route.path)
  const text = `Reading ${readableHandle}'s ${shareUrl}\n\nI think...`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
})

// 设置锚点导航
useAnchorNavigation({ contentSelector: 'article' })

// 设置页面meta
useHead(() => {
  const title = post.value?.title || props.contentType
  const description = post.value?.excerpt || post.value?.summary || ''
  const url = canonicalUrl.value
  const ogImage = ogImageUrl.value

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ],
  }
})

// 监听post变化，自动渲染内容
watch(post, async (newPost) => {
  if (newPost?.content) {
    await renderContent(newPost.content)
  }
}, { immediate: false })

// 在组件挂载时获取数据
onMounted(async () => {
  await fetchPost()
})
</script>

<template>
  <div>
    <!-- 树枝动画效果 -->
    <ClientOnly>
      <ArtPlum />
    </ClientOnly>

    <div class="px-4 py-8">
      <!-- Hidden TOC for content with headings -->
      <Toc v-if="tocItems.length > 0" :items="tocItems" />

      <!-- Main content -->
      <div class="max-w-4xl mx-auto">
        <!-- 加载状态 -->
        <div v-if="pending" class="py-20 text-center">
          <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
          <div class="mt-4 opacity-50">
            Loading {{ contentType.toLowerCase() }}...
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="py-20 text-center">
          <div class="text-red-500 text-lg mb-2">
            {{ error.type === '404' ? `${contentType} not found` : `Failed to load ${contentType.toLowerCase()}` }}
          </div>
          <div class="mb-4 text-sm opacity-75">
            {{ error.details || error.message }}
          </div>
          <div class="space-x-4">
            <RouterLink :to="basePath" class="text-slate-500 hover:text-slate-400 hover:underline hover:decoration-slate-400/70 transition-colors">
              ← Back to {{ contentType === 'Post' ? 'Blog' : 'Books' }}
            </RouterLink>
            <button
              class="text-slate-500 hover:text-slate-400 hover:underline hover:decoration-slate-400/70 transition-colors"
              @click="fetchPost()"
            >
              Try Again
            </button>
          </div>
        </div>

        <!-- 内容详情 -->
        <div v-else-if="post">
          <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">
              {{ post.title }}
            </h1>
            <div class="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
              <div v-if="post.author" class="flex items-center gap-2">
                <img
                  v-if="post.author.avatar"
                  :src="post.author.avatar"
                  :alt="post.author.name"
                  class="w-8 h-8 rounded-full"
                >
                <span>{{ post.author.name }}</span>
              </div>
              <span>·</span>
              <time :datetime="post.date_published">
                {{ formatDate(post.date_published, false) }}
              </time>
            </div>
          </header>

          <article
            class="prose dark:prose-invert max-w-none slide-enter-content"
          >
            <div v-if="renderedContent" v-html="renderedContent" />
            <div v-else class="text-center italic opacity-70">
              No content available.
            </div>
          </article>

          <!-- 底部导航 -->
          <div class="prose dark:prose-invert max-w-none mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
            <span class="font-mono opacity-50">> </span>
            <span class="opacity-50">comment on </span>
            <a :href="tweetUrl" target="_blank" class="opacity-50 hover:opacity-75">
              <div class="i-ri-twitter-x-line inline-block" />
            </a>
            <br>
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
    </div>
  </div>
</template>

<style scoped>
.slide-enter-content {
  animation: slide-enter 0.6s both;
}

@keyframes slide-enter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
