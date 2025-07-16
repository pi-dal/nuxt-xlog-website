<script setup lang="ts">
interface Props {
  loading?: boolean
  error?: string | null
  loadingText?: string
  errorText?: string
  showRetry?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  loadingText: 'Loading...',
  errorText: 'Failed to load',
  showRetry: false,
})

const emit = defineEmits<{
  retry: []
}>()

function handleRetry() {
  emit('retry')
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="loading" class="py-8 text-center">
    <div class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
    <div class="mt-2 opacity-50">
      {{ loadingText }}
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="py-8 text-center text-red-500">
    <div class="mb-2">
      {{ errorText }}
    </div>
    <div class="mb-4 text-sm opacity-75">
      {{ error }}
    </div>
    <button
      v-if="showRetry"
      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      @click="handleRetry"
    >
      Retry
    </button>
  </div>
</template>
