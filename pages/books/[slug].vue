<script setup lang="ts">
import type { TocItem } from '~/components/Toc.vue'
import type { XLogComment, XLogPost } from '~/types'
import { useHead } from '@unhead/vue'
import { useEventListener } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommentList from '~/components/CommentList.vue'
import Toc from '~/components/Toc.vue'
import { formatDate } from '~/logics'
import { useMarkdown } from '~/logics/markdown'
import { getCommentsDirect, getPostBySlugDirect } from '~/logics/xlog-direct'

const route = useRoute()
const slug = route.params.slug as string

console.log('Books detail page - slug:', slug)
console.log('Route params:', route.params)
console.log('Route path:', route.path)

// 响应式数据
const post = ref<XLogPost | null>(null)
const pending = ref(true)
const error = ref<string | null>(null)
const renderedContent = ref('')
const comments = ref<XLogComment[]>([])
const tocItems = ref<TocItem[]>([])
const loading = ref(true)

// Markdown渲染器
const { render: renderMarkdown } = useMarkdown()

// 设置页面meta
useHead(() => ({
  title: post.value?.title || 'Book',
  meta: [
    { name: 'description', content: post.value?.excerpt || post.value?.summary || '' },
    { property: 'og:title', content: post.value?.title || 'Book' },
    { property: 'og:description', content: post.value?.excerpt || post.value?.summary || '' },
    { property: 'og:image', content: post.value?.cover || 'https://xlog.app/og.png' },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: post.value?.title || 'Book' },
    { name: 'twitter:description', content: post.value?.excerpt || post.value?.summary || '' },
    { name: 'twitter:image', content: post.value?.cover || '' },
  ],
}))

// 获取文章数据
async function fetchPost() {
  try {
    pending.value = true

    const foundPost = await getPostBySlugDirect(slug)

    if (!foundPost) {
      error.value = 'Book not found'
    }
    else {
      post.value = foundPost
      error.value = null

      // 渲染Markdown内容
      if (foundPost.content) {
        try {
          renderedContent.value = await renderMarkdown(foundPost.content)

          // 解析TOC
          parseToc()
        }
        catch (renderError) {
          // 如果渲染失败，使用原始内容
          renderedContent.value = foundPost.content.replace(/\n/g, '<br>')
        }
      }

      // 获取评论
      await fetchComments()
    }
  }
  catch (err) {
    error.value = err.toString()
  }
  finally {
    pending.value = false
  }
}

function parseToc() {
  const contentEl = document.createElement('div')
  contentEl.innerHTML = renderedContent.value

  const headings = contentEl.querySelectorAll('h1, h2, h3, h4')
  const items: TocItem[] = []
  headings.forEach((heading) => {
    // 移除从 markdown-it-anchor 插件来的末尾的 '#'
    const text = (heading.textContent || '').replace(/#\s*$/, '').trim()
    if (text) {
      items.push({
        id: heading.id,
        text,
        level: Number.parseInt(heading.tagName.substring(1)),
      })
    }
  })
  tocItems.value = items
}

async function fetchComments() {
  if (!post.value)
    return
  try {
    const { characterId, id: noteId } = post.value
    if (characterId && noteId) {
      comments.value = await getCommentsDirect(characterId, noteId)
    }
  }
  catch (commentError) {
    console.error('Failed to fetch comments:', commentError)
  }
}

// 在组件挂载时获取数据
onMounted(async () => {
  await fetchPost()

  // 添加锚点导航功能
  const content = document.querySelector('article')
  if (!content)
    return

  const navigate = () => {
    if (location.hash) {
      const el = document.querySelector(decodeURIComponent(location.hash))
      if (el) {
        const rect = el.getBoundingClientRect()
        const y = window.scrollY + rect.top - 80 // 留出导航栏高度
        window.scrollTo({
          top: y,
          behavior: 'smooth',
        })
        return true
      }
    }
  }

  const handleAnchors = (event: MouseEvent & { target: HTMLElement }) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        // 使用Vue Router导航
        const router = useRouter()
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(content, 'click', handleAnchors, { passive: false })

  setTimeout(() => {
    if (!navigate())
      setTimeout(navigate, 1000)
  }, 1)
})
</script>

<template>
  <div class="grid grid-cols-12 gap-x-8 px-4 py-8">
    <!-- Main content -->
    <div class="col-span-12 lg:col-span-9">
      <!-- 加载状态 -->
      <div v-if="pending" class="py-20 text-center">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
        <div class="mt-4 opacity-50">
          Loading book...
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="py-20 text-center">
        <div class="text-red-500 text-lg mb-2">
          Book not found
        </div>
        <div class="mb-4 text-sm opacity-75">
          Slug: "{{ slug }}"
        </div>
        <RouterLink to="/books" class="text-blue-500 hover:text-blue-600">
          ← Back to Books
        </RouterLink>
      </div>

      <!-- 书籍详情 -->
      <div v-else-if="post" class="max-w-4xl mx-auto">
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

        <img
          v-if="post.cover"
          :src="post.cover"
          :alt="post.title"
          class="w-full h-auto rounded-lg my-8 shadow-lg"
        >

        <article
          ref="content"
          class="prose dark:prose-invert max-w-none slide-enter-content"
        >
          <div v-if="renderedContent" v-html="renderedContent" />
          <div v-else class="text-center italic opacity-70">
            No content available.
          </div>
        </article>

        <div class="border-t dark:border-gray-700 my-12" />

        <!-- 评论区 -->
        <div id="comments" class="w-full">
          <Suspense>
            <CommentList :comments="comments" />
            <template #fallback>
              <div class="text-center py-8 opacity-70">
                Loading comments...
              </div>
            </template>
          </Suspense>

          <div class="mt-10 text-center">
            <a
              :href="`https://xlog.pi-dal.com/${post.slug}`"
              target="_blank"
              class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded no-underline"
            >
              在 xLog 上发表评论
            </a>
            <p class="text-sm opacity-60 mt-2">
              您的评论将永久记录在区块链上
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- TOC Sidebar -->
    <div
      v-if="tocItems.length > 0"
      class="hidden lg:block col-span-3"
    >
      <Toc :items="tocItems" />
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