<script setup lang="ts">
import { computed } from 'vue'
import raw from '../../../photos/data'

const props = defineProps<{
  photos?: Array<any>
  limit?: number
}>()

const photos = computed(() => {
  const source = props.photos || raw
  if (props.limit)
    return source.slice(0, props.limit)
  return source
})
</script>

<template>
  <div class="photos grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" max-w-500 mx-auto>
    <div v-for="photo, idx in photos" :key="idx" class="flex items-center justify-center">
      <img
        :src="photo.url"
        :alt="photo.text || photo.name"
        :data-photo-index="idx"
        loading="lazy"
        class="w-full h-auto object-contain"
      >
    </div>
  </div>
</template>
