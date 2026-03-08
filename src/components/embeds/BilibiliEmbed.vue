<script setup lang="ts">
import { buildBilibiliEmbedSrc } from '~/logics/embeds'

const props = withDefaults(defineProps<{
  bvid: string
  page?: number
  title?: string
}>(), {
  page: 1,
  title: 'Bilibili video player',
})

const src = computed(() => buildBilibiliEmbedSrc(props.bvid, props.page))
</script>

<template>
  <div class="my-8">
    <iframe
      class="aspect-video w-full rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      :src="src"
      :title="title"
      scrolling="no"
      frameborder="0"
      allowfullscreen
    />
  </div>
</template>
