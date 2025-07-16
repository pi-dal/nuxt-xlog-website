<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const container = document.querySelector('.rss-menu-container')

  if (container && !container.contains(target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="rss-menu-container" @click.stop>
    <button
      class="rss-trigger"
      :class="{ active: isOpen }"
      title="RSS Feeds"
      @click="toggleMenu"
    >
      <div i-la-rss-square style="font-size:1.25rem; margin: 0 -0.125rem;" />
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="rss-menu">
        <div class="rss-menu-content">
          <a
            href="/feed.xml"
            target="_blank"
            class="rss-menu-item"
            @click="closeMenu"
          >
            <div i-ri-global-line class="rss-menu-icon" />
            <span>All Content</span>
          </a>

          <a
            href="/blog-feed.xml"
            target="_blank"
            class="rss-menu-item"
            @click="closeMenu"
          >
            <div i-ri-article-line class="rss-menu-icon" />
            <span>Blog Posts</span>
          </a>

          <a
            href="/books-feed.xml"
            target="_blank"
            class="rss-menu-item"
            @click="closeMenu"
          >
            <div i-ri-book-line class="rss-menu-icon" />
            <span>Reading Notes</span>
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.rss-menu-container {
  position: relative;
  display: inline-block;
}

.rss-trigger {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  outline: none;
  padding: 0;
  margin: 0;
}

.rss-trigger:hover,
.rss-trigger.active {
  opacity: 1;
}

.rss-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  z-index: 1000;
}

.rss-menu-content {
  background: var(--c-bg);
  border: 1px solid rgba(125, 125, 125, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 160px;
  backdrop-filter: blur(10px);
}

.dark .rss-menu-content {
  background: rgba(32, 32, 32, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.rss-menu-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  gap: 0.5rem;
}

.rss-menu-item:hover {
  background-color: rgba(125, 125, 125, 0.1);
}

.dark .rss-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.rss-menu-icon {
  font-size: 1rem;
  opacity: 0.8;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
