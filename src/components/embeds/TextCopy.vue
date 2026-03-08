<script setup lang="ts">
import { getCopyText } from '~/logics/embeds'

const props = withDefaults(defineProps<{
  text?: string
  slice?: [number, number]
  buttonLabel?: string
}>(), {
  buttonLabel: 'Copy text',
})

const { copy, copied } = useClipboard()
const content = ref<HTMLElement | null>(null)

function handleCopy() {
  const text = getCopyText({
    text: props.text,
    fallbackText: content.value?.textContent ?? undefined,
    slice: props.slice,
  })

  if (text)
    copy(text)
}
</script>

<template>
  <div class="my-4 inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
    <span ref="content" class="min-w-0 break-all font-mono">
      <slot>{{ text }}</slot>
    </span>
    <button
      type="button"
      class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
      :aria-label="buttonLabel"
      :title="buttonLabel"
      @click="handleCopy"
    >
      <div :class="copied ? 'i-ri-check-line text-green-500' : 'i-ri-file-copy-line'" />
    </button>
  </div>
</template>
