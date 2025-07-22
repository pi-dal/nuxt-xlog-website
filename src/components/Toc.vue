<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

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
const isMobileOpen = ref(false)

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

function toggleMobileToc() {
  isMobileOpen.value = !isMobileOpen.value
}

function closeMobileToc() {
  isMobileOpen.value = false
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMobileOpen.value) {
    closeMobileToc()
  }
}

// Prevent background scroll when mobile TOC is open
watch(isMobileOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleKeyDown)
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Set initial active heading

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  })
})
</script>

<template>
  <div v-if="items.length > 0">
    <!-- Mobile TOC (collapsible button design) -->
    <div class="mobile-toc">
      <!-- Mobile TOC toggle button -->
      <button 
        @click="toggleMobileToc"
        class="mobile-toc-button"
        :class="{ 'active': isMobileOpen }"
        title="Table of Contents"
        aria-label="Toggle table of contents"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
        </svg>
      </button>

      <!-- Mobile TOC content (collapsible) -->
      <div v-if="isMobileOpen" class="mobile-toc-overlay" @click="closeMobileToc">
        <div class="mobile-toc-content" @click.stop>
          <div class="mobile-toc-header">
            <h3>Table of Contents</h3>
            <button @click="closeMobileToc" class="mobile-toc-close" aria-label="Close table of contents">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <ul class="mobile-toc-list">
            <li v-for="item in items" :key="item.id">
              <a
                :href="`#${item.id}`"
                @click="closeMobileToc"
                class="mobile-toc-link" 
                :class="{ 'active': activeId === item.id }"
                :style="{ paddingLeft: `${(item.level - 1) * 0.75 + 0.75}rem` }"
              >
                {{ item.text }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile TOC Styles */
.mobile-toc {
  position: relative;
  z-index: 200;
}

.mobile-toc-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #6b7280;
  z-index: 250;
}

.mobile-toc-button:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.mobile-toc-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.dark .mobile-toc-button {
  background: rgba(17, 24, 39, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
  color: #9ca3af;
}

.dark .mobile-toc-button:hover {
  background: rgba(17, 24, 39, 1);
}


.mobile-toc-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

.mobile-toc-content {
  background: white;
  width: 100%;
  max-height: 70vh;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.dark .mobile-toc-content {
  background: #1f2937;
}

.mobile-toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .mobile-toc-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.mobile-toc-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.dark .mobile-toc-header h3 {
  color: #f9fafb;
}

.mobile-toc-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.mobile-toc-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.dark .mobile-toc-close {
  color: #9ca3af;
}

.dark .mobile-toc-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #d1d5db;
}

.mobile-toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.mobile-toc-list::-webkit-scrollbar {
  width: 4px;
}

.mobile-toc-list::-webkit-scrollbar-track {
  background: transparent;
}

.mobile-toc-list::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.mobile-toc-list::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.mobile-toc-list li {
  margin: 0;
}

.mobile-toc-link {
  display: block;
  padding: 12px 24px;
  text-decoration: none;
  color: #374151;
  border: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.mobile-toc-link:hover {
  background: rgba(0, 0, 0, 0.05);
  text-decoration: none;
  border: none;
}

.mobile-toc-link.active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
}

.dark .mobile-toc-link {
  color: #d1d5db;
}

.dark .mobile-toc-link:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dark .mobile-toc-link.active {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.2);
  border-left-color: #60a5fa;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
