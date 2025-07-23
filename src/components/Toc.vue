<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watchEffect } from 'vue'

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
const mobileToggleButton = ref<HTMLButtonElement>()
const mobileCloseButton = ref<HTMLButtonElement>()

// Throttle scroll handler for better performance
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

function handleScroll() {
  if (scrollTimeout)
    return

  scrollTimeout = setTimeout(() => {
    let currentId = ''
    const headings = document.querySelectorAll('article h1, article h2, article h3, article h4')

    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top < 120) {
        currentId = heading.id
      }
    })

    activeId.value = currentId
    scrollTimeout = null
  }, 16) // ~60fps
}

function toggleMobileToc() {
  isMobileOpen.value = !isMobileOpen.value
  if (isMobileOpen.value) {
    nextTick(() => {
      // Focus the close button when modal opens
      mobileCloseButton.value?.focus()
    })
  }
}

function closeMobileToc() {
  isMobileOpen.value = false
  // Return focus to the toggle button
  nextTick(() => {
    mobileToggleButton.value?.focus()
  })
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMobileOpen.value) {
    event.stopPropagation()
    closeMobileToc()
    return
  }

  // Focus trapping for Tab key
  if (event.key === 'Tab' && isMobileOpen.value) {
    const modalContent = document.querySelector('.mobile-toc-content')
    if (!modalContent)
      return

    const focusableElements = modalContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const focusableArray = Array.from(focusableElements) as HTMLElement[]

    if (focusableArray.length === 0)
      return

    const firstFocusable = focusableArray[0]
    const lastFocusable = focusableArray[focusableArray.length - 1]
    const activeElement = document.activeElement

    if (event.shiftKey) {
      // Shift+Tab: if at first element, go to last
      if (activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      }
    }
    else {
      // Tab: if at last element, go to first
      if (activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }
  }
}

// Prevent background scroll when mobile TOC is open
watchEffect((onInvalidate) => {
  if (isMobileOpen.value) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
  }

  onInvalidate(() => {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleKeyDown)
  })
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Set initial active heading
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
})
</script>

<template>
  <div v-if="items.length > 0">
    <!-- Desktop TOC (floating hover-based design - original design) -->
    <nav class="desktop-toc">
      <!-- TOC trigger -->
      <div class="toc-trigger" title="Table of Contents">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
        </svg>
      </div>

      <!-- TOC content -->
      <div class="toc-content">
        <ul>
          <li v-for="item in items" :key="item.id">
            <a
              :href="`#${item.id}`"
              class="toc-link" :class="{ active: activeId === item.id }"
              :style="{ paddingLeft: `${(item.level - 1) * 0.75 + 0.5}rem` }"
            >
              {{ item.text }}
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Mobile TOC (collapsible button design) -->
    <div class="mobile-toc">
      <!-- Mobile TOC toggle button -->
      <button
        ref="mobileToggleButton"
        class="mobile-toc-button"
        :class="{ active: isMobileOpen }"
        title="Table of Contents"
        aria-label="Toggle table of contents"
        @click="toggleMobileToc"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
        </svg>
      </button>

      <!-- Mobile TOC content (collapsible) -->
      <div v-if="isMobileOpen" class="mobile-toc-overlay" @click="closeMobileToc">
        <div class="mobile-toc-content" role="dialog" aria-modal="true" aria-labelledby="mobile-toc-title" @click.stop>
          <div class="mobile-toc-header">
            <h3 id="mobile-toc-title">
              Table of Contents
            </h3>
            <button ref="mobileCloseButton" class="mobile-toc-close" aria-label="Close table of contents" @click="closeMobileToc">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <ul class="mobile-toc-list">
            <li v-for="item in items" :key="item.id">
              <a
                :href="`#${item.id}`"
                class="mobile-toc-link"
                :class="{ active: activeId === item.id }"
                :style="{ paddingLeft: `${(item.level - 1) * 0.75 + 0.75}rem` }"
                @click="closeMobileToc"
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
/* Desktop TOC Styles (Original Floating Design) */
.desktop-toc {
  position: fixed;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 200;
  width: 240px;
  max-height: 60vh;
  font-size: 0.8em;
  overflow: hidden;
  flex-direction: column;
  display: none; /* Hidden by default */
}

/* Only show desktop TOC on large screens */
@media (min-width: 1024px) {
  .desktop-toc {
    display: flex;
  }
}

@media (max-width: 1023px) {
  .desktop-toc {
    display: none !important;
  }
}

.toc-trigger {
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

.dark .toc-trigger {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.2);
  color: #888;
}

.toc-content {
  opacity: 0;
  transition: opacity 0.7s ease;
  margin-top: 4px;
  max-height: calc(60vh - 40px);
  overflow-y: auto;
  padding-bottom: 20px;
  border-radius: 8px;
}

.toc-content h3 {
  display: none;
}

.toc-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-overflow: ellipsis;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.toc-content::-webkit-scrollbar {
  width: 4px;
}

.toc-content::-webkit-scrollbar-track {
  background: transparent;
}

.toc-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.toc-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.toc-content ul > li {
  padding-left: 0.8rem;
  line-height: 1.5em;
  margin-top: 0.5em;
}

.toc-content ul > li::before {
  display: none;
}

.toc-link {
  text-decoration: none;
  border: none;
  opacity: 0.75;
  transition: opacity 0.3s ease;
  display: block;
  color: inherit;
}

.toc-link:hover {
  text-decoration: none;
  border: none;
  opacity: 1;
}

.toc-link.active {
  opacity: 1;
  color: #3b82f6;
}

/* Show on hover */
.desktop-toc:hover .toc-trigger {
  color: inherit;
}

.desktop-toc:hover .toc-content {
  opacity: 0.75;
}

/* Always on mode */
.desktop-toc.toc-always-on .toc-content {
  opacity: 0.6;
}

/* Mobile TOC Styles */
.mobile-toc {
  z-index: 200;
  display: none; /* Hidden by default */
}

/* Only show mobile TOC on screens smaller than large */
@media (min-width: 1024px) {
  .mobile-toc {
    display: none !important;
  }
}

@media (max-width: 1023px) {
  .mobile-toc {
    display: block;
  }
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
