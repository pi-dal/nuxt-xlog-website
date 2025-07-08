<script setup lang="ts">
import { useRoute } from 'vue-router'
import { englishOnly } from '~/logics'

const inactiveStyle = 'opacity-50 hover:opacity-100 font-normal'
const activeStyle = 'opacity-100 font-semibold'

const route = useRoute()
</script>

<template>
  <div class="prose m-auto mb-8 select-none">
    <div class="mb-2">
      <button class="flex items-center gap-1 text-sm op50 hover:op100 !border-none !font-normal" @click="englishOnly = !englishOnly">
        <div :class="englishOnly ? 'i-carbon-checkbox-checked' : 'i-carbon-checkbox'" />
        <span>English Only</span>
      </button>
    </div>

    <div class="!mt-0 flex flex-wrap gap-3 text-xl sm:text-3xl">
      <RouterLink to="/posts" class="!border-none" :class="route.path.startsWith('/posts') ? activeStyle : inactiveStyle">
        Blog
      </RouterLink>
      <RouterLink to="/talks" class="!border-none" :class="route.path.startsWith('/talks') ? activeStyle : inactiveStyle">
        Talks
      </RouterLink>
      <RouterLink to="/podcasts" class="!border-none" :class="route.path.startsWith('/podcasts') ? activeStyle : inactiveStyle">
        Podcasts
      </RouterLink>
      <RouterLink to="/streams" class="!border-none" :class="route.path.startsWith('/streams') ? activeStyle : inactiveStyle">
        Streams
      </RouterLink>
      <RouterLink to="/notes" class="!border-none" :class="route.path.startsWith('/notes') ? activeStyle : inactiveStyle">
        Notes
      </RouterLink>
    </div>
  </div>
</template>
