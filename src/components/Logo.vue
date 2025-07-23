<script setup lang="ts">
import { fetchSiteInfo, siteInfo } from '~/logics/site'

interface Props {
  variant?: 'default' | 'stroke'
}

const { variant = 'default' } = defineProps<Props>()

fetchSiteInfo()
</script>

<template>
  <img v-if="siteInfo?.avatar" :src="siteInfo.avatar" alt="Avatar" class="avatar" :class="variant">
  <img v-else src="/avatar.webp" alt="Avatar" class="avatar" :class="variant">
</template>

<style scoped>
.avatar {
  width: 100%;
  height: auto;
  max-width: 100px;
  border-radius: 50%;
}

@media (prefers-reduced-motion) {
  .avatar {
    animation: none !important;
  }
}

@media print {
  .avatar {
    animation: none !important;
  }
}

@keyframes grow {
  0% {
    transform: scale(0.9);
  }
  40% {
    transform: scale(1);
  }
  85% {
    transform: scale(1);
  }
  95%,
  to {
    transform: scale(0.9);
  }
}

@keyframes grow-stroke {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  10% {
    opacity: 1;
    transform: translate(0, 1%);
  }
  20% {
    transform: translate(0, 0);
  }
  40% {
    transform: scale(1);
  }
  85% {
    transform: scale(1);
  }
  95%,
  to {
    transform: scale(0.9);
  }
}

.avatar.default {
  animation: grow 10s ease forwards infinite;
  transform-origin: center;
}

.avatar.stroke {
  animation: grow-stroke 10s ease forwards infinite;
  transform-origin: center;
}
</style>
