<script setup lang="ts">
const route = useRoute()

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()

const LOCALES = [
  { code: 'zh', label: '中文', path: '/zh/posts' },
  { code: 'en', label: 'EN', path: '/en/posts' },
  { code: 'ja', label: 'JA', path: '/ja/posts' },
]

const currentLocale = computed(() => {
  const segs = route.path.split('/').filter(Boolean)
  if (segs.length >= 1 && ['zh', 'en', 'ja'].includes(segs[0]))
    return segs[0]
  return 'zh'
})
</script>

<template>
  <header class="header z-40">
    <RouterLink
      class="w-12 h-12 absolute xl:fixed m-5 select-none outline-none"
      to="/"
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
        <RouterLink to="/posts" title="Blog">
          <span class="lt-md:hidden">Blog</span>
          <div i-ri-article-line md:hidden />
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span class="lt-md:hidden">Projects</span>
          <div i-ri-lightbulb-line class="md:hidden" />
        </RouterLink>
        <RouterLink to="/chat" title="Let's Chat">
          <span class="lt-md:hidden">Let's Chat</span>
          <div i-ri-chat-1-line class="md:hidden" />
        </RouterLink>
        <RouterLink to="/books" title="Books">
          <div i-ri-book-line />
        </RouterLink>
        <a href="https://photography.pi-dal.com" target="_blank" title="Photos">
          <div i-ri-camera-3-line />
        </a>

        <!-- Locale switcher -->
        <div class="locale-nav">
          <RouterLink
            v-for="loc in LOCALES"
            :key="loc.code"
            :to="loc.path"
            class="locale-nav-link"
            :class="{ active: loc.code === currentLocale }"
          >
            {{ loc.label }}
          </RouterLink>
        </div>

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

/* Locale switcher */
.locale-nav {
  display: flex;
  gap: 2px;
  align-items: center;
}

.locale-nav-link {
  font-size: 0.72rem !important;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 2px 5px;
  border-radius: 3px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  opacity: 0.5;
}

.locale-nav-link:hover {
  opacity: 1;
  border-color: currentColor;
}

.locale-nav-link.active {
  opacity: 1;
  border-color: currentColor;
}
</style>
