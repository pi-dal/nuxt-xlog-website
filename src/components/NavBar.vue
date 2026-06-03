<script setup lang="ts">
const route = useRoute()

const LOCALE_LABELS = {
  default: {
    blog: 'Blog',
    books: 'Books',
    chat: `Let's Chat`,
    home: '/',
    photos: 'Photos',
    projects: 'Projects',
  },
  en: {
    blog: 'Blog',
    books: 'Books',
    chat: `Let's Chat`,
    home: '/en',
    photos: 'Photos',
    projects: 'Projects',
  },
  ja: {
    blog: '記事',
    books: '読書',
    chat: '連絡',
    home: '/ja',
    photos: '写真',
    projects: 'プロジェクト',
  },
  zh: {
    blog: '文章',
    books: '读书',
    chat: '联系',
    home: '/zh',
    photos: '摄影',
    projects: '项目',
  },
} as const

const currentLocale = computed(() => {
  const segs = route.path.split('/').filter(Boolean)
  const locale = segs[0]
  return locale === 'zh' || locale === 'en' || locale === 'ja' ? locale : 'default'
})

const currentLabels = computed(() => LOCALE_LABELS[currentLocale.value])

function toLocalePath(path: string) {
  const prefix = currentLocale.value === 'default' ? '' : `/${currentLocale.value}`
  return `${prefix}${path}` || '/'
}

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()
</script>

<template>
  <header class="header z-40">
    <RouterLink
      class="w-12 h-12 absolute xl:fixed m-5 select-none outline-none"
      :to="currentLabels.home"
      focusable="false"
    >
      <Logo />
    </RouterLink>
    <button
      title="Scroll to top"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
    <nav class="nav">
      <div class="spacer" />
      <div class="right" print:op0>
        <RouterLink :to="toLocalePath('/posts')" :title="currentLabels.blog">
          <span class="lt-md:hidden">{{ currentLabels.blog }}</span>
          <div i-ri-article-line md:hidden />
        </RouterLink>
        <RouterLink :to="toLocalePath('/projects')" :title="currentLabels.projects">
          <span class="lt-md:hidden">{{ currentLabels.projects }}</span>
          <div i-ri-lightbulb-line class="md:hidden" />
        </RouterLink>
        <RouterLink :to="toLocalePath('/chat')" :title="currentLabels.chat">
          <span class="lt-md:hidden">{{ currentLabels.chat }}</span>
          <div i-ri-chat-1-line class="md:hidden" />
        </RouterLink>
        <RouterLink :to="toLocalePath('/books')" :title="currentLabels.books">
          <div i-ri-book-line />
        </RouterLink>
        <a href="https://photography.pi-dal.com" target="_blank" :title="currentLabels.photos">
          <div i-ri-camera-3-line />
        </a>
        <div class="lt-md:hidden">
          <RSSMenu />
        </div>
        <ToggleTheme />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
}

.nav > * {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
  position: relative;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav a.router-link-active,
.nav a.router-link-exact-active {
  opacity: 1;
}

/* Active indicator: stable underline dot, distinct from hover opacity */
.nav a.router-link-active::after,
.nav a.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  opacity: 0.4;
  transition:
    width 0.2s ease,
    opacity 0.2s ease;
}

.nav a.router-link-active:hover::after,
.nav a.router-link-exact-active:hover::after {
  width: 16px;
  opacity: 0.6;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}
</style>
