import { onMounted, onUnmounted, ref } from 'vue'

export function useTocObserver(selector: string) {
  const activeId = ref<string | null>(null)
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null

  function handleScroll() {
    if (scrollTimeout)
      return

    scrollTimeout = setTimeout(() => {
      let currentId = ''
      const headings = document.querySelectorAll(selector)

      headings.forEach((heading) => {
        if (heading.getBoundingClientRect().top < 120) {
          currentId = heading.id
        }
      })

      activeId.value = currentId
      scrollTimeout = null
    }, 16) // ~60fps
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Set initial active heading
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
      scrollTimeout = null
    }
  })

  return { activeId }
}
