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
  <nav v-if="items.length > 0" class="hidden-toc-nav hidden lg:flex">
    <!-- 隐藏式目录触发器 -->
    <div class="hidden-toc-trigger" title="目录">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
      </svg>
    </div>

    <!-- 目录内容 -->
    <div class="hidden-toc-content">
      <ul>
        <li v-for="item in items" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="toc-link" :class="[
              activeId === item.id ? 'active' : '',
            ]"
            :style="{ paddingLeft: `${(item.level - 1) * 0.75 + 0.5}rem` }"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.hidden-toc-nav {
  position: fixed;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 200;
  width: 240px;
  max-height: 60vh;
  font-size: 0.8em;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.hidden-toc-trigger {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s ease;
  color: #888;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .hidden-toc-trigger {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.2);
  color: #888;
}

.hidden-toc-content {
  opacity: 0;
  transition: opacity 0.7s ease;
  margin-top: 4px;
  max-height: calc(60vh - 40px);
  overflow-y: auto;
  padding-bottom: 20px;
  border-radius: 8px;
}

.hidden-toc-content h3 {
  display: none;
}

.hidden-toc-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-overflow: ellipsis;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.hidden-toc-content::-webkit-scrollbar {
  width: 4px;
}

.hidden-toc-content::-webkit-scrollbar-track {
  background: transparent;
}

.hidden-toc-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.hidden-toc-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.hidden-toc-content ul > li {
  padding-left: 0.8rem;
  line-height: 1.5em;
  margin-top: 0.5em;
}

.hidden-toc-content ul > li::before {
  display: none;
}

.toc-link {
  text-decoration: none;
  border: none !important;
  opacity: 0.75;
  transition: opacity 0.3s ease;
  display: block;
  color: inherit;
}

.toc-link:hover {
  text-decoration: none;
  border: none !important;
  opacity: 1;
}

.toc-link.active {
  opacity: 1;
  color: #3b82f6;
}

/* 悬停时显示 */
.hidden-toc-nav:hover .hidden-toc-trigger {
  color: inherit;
}

.hidden-toc-nav:hover .hidden-toc-content {
  opacity: 0.75;
}

/* 永远显示模式 */
.hidden-toc-nav.toc-always-on .hidden-toc-content {
  opacity: 0.6;
}
</style>
