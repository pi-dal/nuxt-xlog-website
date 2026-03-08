<script setup lang="ts">
import { buildYouTubeEmbedSrc } from '~/logics/embeds'

const props = withDefaults(defineProps<{
  id: string
  title?: string
  noScale?: boolean
}>(), {
  title: 'YouTube video player',
  noScale: false,
})

const src = computed(() => buildYouTubeEmbedSrc(props.id))
</script>

<template>
  <div class="my-8">
    <iframe
      class="w-full rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      :class="noScale ? 'aspect-video' : 'aspect-video lg:scale-[1.03] lg:my-6'"
      :src="src"
      :title="title"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </div>
</template>
