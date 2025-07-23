<script setup lang="ts">
import type { TocItemType } from './Toc.vue'

interface Props {
  item: TocItemType
  activeId: string | null
  variant: 'desktop' | 'mobile'
}

interface Emits {
  linkClick: []
}

defineProps<Props>()
defineEmits<Emits>()

function getLinkClass(variant: string) {
  return variant === 'desktop' ? 'toc-link' : 'mobile-toc-link'
}

function getPaddingLeft(level: number, variant: string) {
  const baseOffset = variant === 'desktop' ? 0.5 : 0.75
  return `${(level - 1) * 0.75 + baseOffset}rem`
}
</script>

<template>
  <li>
    <a
      :href="`#${item.id}`"
      :class="[getLinkClass(variant), { active: activeId === item.id }]"
      :style="{ paddingLeft: getPaddingLeft(item.level, variant) }"
      @click="$emit('linkClick')"
    >
      {{ item.text }}
    </a>
  </li>
</template>

<style scoped>
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
  color: var(--toc-primary-color);
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
  color: var(--toc-primary-color);
  background: rgba(59, 130, 246, 0.1);
  border-left-color: var(--toc-primary-color);
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
</style>
