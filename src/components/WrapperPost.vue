<script setup lang='ts'>
import { formatDate } from '~/logics'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()
const content = ref<HTMLDivElement>()

onMounted(() => {
  const navigate = () => {
    if (location.hash) {
      const el = document.querySelector(decodeURIComponent(location.hash))
      if (el) {
        const rect = el.getBoundingClientRect()
        const y = window.scrollY + rect.top - 40
        window.scrollTo({
          top: y,
          behavior: 'smooth',
        })
        return true
      }
    }
  }

  const handleAnchors = (
    event: MouseEvent & { target: HTMLElement },
  ) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(content.value!, 'click', handleAnchors, { passive: false })

  setTimeout(() => {
    if (!navigate())
      setTimeout(navigate, 1000)
  }, 1)
})

const ArtComponent = computed(() => {
  let art = frontmatter.art
  if (art === 'random')
    art = 'plum'
  if (typeof window !== 'undefined') {
    if (art === 'plum')
      return defineAsyncComponent(() => import('./ArtPlum.vue'))
  }
  return undefined
})

// Add a computed property to determine parent route based on frontmatter type
const parentRoute = computed(() => {
  // If it's a note type article, always go to /notes
  if (frontmatter.type === 'note')
    return '/notes'

  // Original logic for other types
  return route.path.startsWith('/zh/') ? '/posts' : (route.path.split('/').slice(0, -1).join('/') || '/')
})
</script>

<template>
  <div>
    <ClientOnly v-if="ArtComponent">
      <component :is="ArtComponent" />
    </ClientOnly>
    <div
      v-if="frontmatter.display ?? frontmatter.title"
      class="prose m-auto mb-8"
      :lang="frontmatter.lang"
      :class="[frontmatter.wrapperClass]"
    >
      <h1 class="mb-0 slide-enter-50">
        {{ frontmatter.display ?? frontmatter.title }}
      </h1>
      <p
        v-if="frontmatter.date"
        class="opacity-50 !-mt-6 slide-enter-50"
      >
        {{ formatDate(frontmatter.date, false) }} <span v-if="frontmatter.duration">· {{ frontmatter.duration }}</span>
      </p>
      <p v-if="frontmatter.place" class="mt--4!">
        <span op50>at </span>
        <a v-if="frontmatter.placeLink" :href="frontmatter.placeLink" target="_blank">
          {{ frontmatter.place }}
        </a>
        <span v-else font-bold>
          {{ frontmatter.place }}
        </span>
      </p>
      <p
        v-if="frontmatter.subtitle"
        class="opacity-50 !-mt-6 italic slide-enter"
      >
        {{ frontmatter.subtitle }}
      </p>
      <p
        v-if="frontmatter.draft"
        class="slide-enter" bg-orange-4:10 text-orange-4 border="l-3 orange-4" px4 py2
      >
        This is a draft post, the content may be incomplete. Please check back later.
      </p>
    </div>
    <article
      ref="content"
      :lang="frontmatter.lang"
      :class="[frontmatter.tocAlwaysOn ? 'toc-always-on' : '', frontmatter.class]"
    >
      <slot />
    </article>

    <!-- Navigation back -->
    <div v-if="route.path !== '/'" class="prose m-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
      <span font-mono op50>> </span>
      <RouterLink
        :to="parentRoute"
        class="font-mono op50 hover:op75"
      >
        cd ..
      </RouterLink>
    </div>
  </div>
</template>
