<script setup lang="ts">
import { isExternalLink } from '~/logics/embeds'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  to: string
}>()

const external = computed(() => isExternalLink(props.to))
</script>

<template>
  <a
    v-if="external"
    v-bind="$attrs"
    :href="to"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot />
  </a>
  <RouterLink
    v-else
    v-bind="$attrs"
    :to="to"
  >
    <slot />
  </RouterLink>
</template>
