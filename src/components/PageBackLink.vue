<script setup lang="ts">
interface Props {
  hideOnRoot?: boolean
  to?: string
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  hideOnRoot: false,
  to: '',
  wrapperClass: 'max-w-4xl mx-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden',
})

const route = useRoute()
const resolvedTo = computed(() => props.to || route.path.split('/').slice(0, -1).join('/') || '/')
const shouldRender = computed(() => !props.hideOnRoot || route.path !== '/')
</script>

<template>
  <div v-if="shouldRender" :class="wrapperClass">
    <span class="font-mono opacity-50">> </span>
    <RouterLink
      :to="resolvedTo"
      class="font-mono opacity-50 hover:opacity-75"
    >
      cd ..
    </RouterLink>
  </div>
</template>
