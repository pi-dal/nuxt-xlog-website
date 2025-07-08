<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPageBySlugDirect } from '~/logics/xlog-direct'
import { useMarkdown } from '~/logics/markdown'
import { useHead } from '@unhead/vue'
import { siteInfo, fetchSiteInfo } from '~/logics/site'
import type { SocialLink } from '~/types'

const aboutContent = ref('')
const loading = ref(true)
const socialLinks = ref<SocialLink[]>([])
const { render: renderMarkdown } = useMarkdown()

useHead({
  title: 'xLog Website',
  meta: [
    { name: 'description', content: 'Your xLog-powered website' },
    { property: 'og:image', content: 'https://xlog.app/og.png' },
  ],
})

/**
 * Pre-processes markdown to remove leading 4-space indentation from paragraphs
 * that are incorrectly formatted as code blocks, while preserving all line breaks.
 */
function preprocessMarkdown(markdown: string): string {
  if (!markdown) return ''

  return markdown
    .split('\n')
    .map(line => line.startsWith('    ') ? line.substring(4) : line)
    .join('\n')
}

// Map platform names to UnoCSS icons
const platformIcons: Record<string, string> = {
  github: 'i-simple-icons-github',
  twitter: 'i-ri-twitter-x-fill',
  telegram: 'i-simple-icons-telegram',
  bilibili: 'i-simple-icons-bilibili',
  youtube: 'i-simple-icons-youtube',
  mastodon: 'i-simple-icons-mastodon',
  instagram: 'i-simple-icons-instagram',
  threads: 'i-ri-threads-line',
  bluesky: 'i-ri-bluesky-fill',
}

onMounted(async () => {
  try {
    await fetchSiteInfo()

    const page = await getPageBySlugDirect('about')
    if (page && page.content) {
      const processedContent = preprocessMarkdown(page.content)
      aboutContent.value = await renderMarkdown(processedContent)
    } else {
      aboutContent.value = '<p>Could not load about page. Please make sure you have a page with the slug "about" on your xLog.</p>'
    }

    if (siteInfo && siteInfo.social_links) {
      console.log('Social Links from API:', siteInfo.social_links)
      socialLinks.value = siteInfo.social_links
    }

  } catch (error) {
    console.error('Failed to load page data:', error)
    aboutContent.value = '<p>Error loading page data.</p>'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div 
      v-if="loading" 
      class="prose m-auto"
    >
      <p>Loading intro...</p>
    </div>
    <div
      v-else
      class="prose dark:prose-invert max-w-3xl mx-auto"
      v-html="aboutContent"
    />

    <div flex-auto />
    
    <div class="prose m-auto mt-8 mb-8 max-w-3xl mx-auto">
      ---
    </div>

    <div class="prose m-auto mt-8 mb-8 max-w-3xl mx-auto">
      Find me on
      <p flex="~ gap-4 wrap" class="mt-2!">
        <a
          v-for="link in siteInfo?.social_links"
          :key="link.platform"
          :href="link.url"
          target="_blank"
          :title="link.platform"
          class="flex items-center gap-2 text-lg opacity-75 hover:opacity-100 transition-opacity no-underline"
        >
          <span :class="platformIcons[link.platform] || 'i-ri-link'" />
          <span class="capitalize text-sm">{{ link.platform }}</span>
        </a>
      </p>
    </div>

    <div class="prose m-auto mt-8 mb-8 max-w-3xl mx-auto">
      <SponsorButtons />
    </div>
  </div>
</template>

<style scoped>
.slide-enter-content {
  animation: slide-enter 0.6s both;
}
@keyframes slide-enter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 