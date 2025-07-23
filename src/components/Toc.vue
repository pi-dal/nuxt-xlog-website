<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrap } from '~/composables/useFocusTrap'
import { useTocObserver } from '~/composables/useTocObserver'
import TocItem from './TocItem.vue'

export interface TocItemType {
  id: string
  text: string
  level: number
  children?: TocItemType[]
}

defineProps<{
  items: TocItemType[]
}>()

// Use composables for separation of concerns
const { activeId } = useTocObserver('article h1, article h2, article h3, article h4')

// Mobile TOC state and handlers
const isMobileOpen = ref(false)
const mobileToggleButton = ref<HTMLButtonElement>()

// Focus trap for mobile modal
const {
  firstFocusElement,
  focusFirstElement,
  focusLastElement,
} = useFocusTrap({
  isOpen: isMobileOpen,
  containerSelector: '.mobile-toc-content',
  onClose: () => {
    isMobileOpen.value = false
    focusLastElement()
  },
})

function closeMobileToc() {
  isMobileOpen.value = false
  focusLastElement()
}

function toggleMobileToc() {
  isMobileOpen.value = !isMobileOpen.value
  if (isMobileOpen.value) {
    focusFirstElement()
  }
}
</script>

<template>
  <div>
    <!-- Desktop TOC (floating hover-based design - original design) -->
    <nav v-if="items.length > 0" class="desktop-toc">
      <!-- TOC trigger -->
      <div class="toc-trigger" title="Table of Contents">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
        </svg>
      </div>

      <!-- TOC content -->
      <div class="toc-content">
        <ul>
          <TocItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            :active-id="activeId"
            variant="desktop"
          />
        </ul>
      </div>
    </nav>

    <!-- Mobile TOC (collapsible button design) -->
    <div v-if="items.length > 0" class="mobile-toc">
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
            <button ref="firstFocusElement" class="mobile-toc-close" aria-label="Close table of contents" @click="closeMobileToc">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <ul class="mobile-toc-list">
            <TocItem
              v-for="(item, index) in items"
              :key="item.id"
              :ref="index === items.length - 1 ? 'lastFocusElement' : undefined"
              :item="item"
              :active-id="activeId"
              variant="mobile"
              @link-click="closeMobileToc"
            />
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
  z-index: var(--toc-z-index);
  width: var(--toc-width);
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
  width: var(--toc-trigger-size);
  height: var(--toc-trigger-size);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--toc-bg-light);
  border-radius: 6px;
  border: 1px solid var(--toc-border-light);
  cursor: pointer;
  transition: all 0.4s ease;
  color: var(--toc-text-muted);
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .toc-trigger {
  background: var(--toc-bg-dark);
  border-color: var(--toc-border-dark);
  color: var(--toc-text-muted);
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
  background: var(--toc-scrollbar-color);
  border-radius: 2px;
}

.toc-content::-webkit-scrollbar-thumb:hover {
  background: var(--toc-scrollbar-hover);
}

.toc-content ul > li {
  padding-left: 0.8rem;
  line-height: 1.5em;
  margin-top: 0.5em;
}

.toc-content ul > li::before {
  display: none;
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
  z-index: var(--toc-z-index);
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
  width: var(--toc-mobile-button-size);
  height: var(--toc-mobile-button-size);
  background: var(--toc-bg-light);
  border: 1px solid var(--toc-border-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #6b7280;
  z-index: var(--toc-z-index-mobile);
}

.mobile-toc-button:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.mobile-toc-button.active {
  background: var(--toc-primary-color);
  color: white;
  border-color: var(--toc-primary-color);
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
  z-index: var(--toc-z-index-overlay);
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
  background: var(--toc-scrollbar-color);
  border-radius: 2px;
}

.mobile-toc-list::-webkit-scrollbar-thumb:hover {
  background: var(--toc-scrollbar-hover);
}

.mobile-toc-list li {
  margin: 0;
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
