<script setup lang="ts">
import type { ContentFrontmatter } from '~/types/content'
import { useHead } from '@unhead/vue'
import { defineAsyncComponent, hydrateOnIdle, hydrateOnVisible } from 'vue'
import { buildAbsoluteUrl, resolveSiteUrl } from '~/logics/site-meta'
import { siteConfig } from '~/site/config'

type ChunkHydrationMode = 'idle' | 'visible'

const route = useRoute()
const frontmatter = route.meta.frontmatter as ContentFrontmatter
const siteUrl = resolveSiteUrl()
const pageTitle = `${frontmatter.title} - ${siteConfig.title}`
const pageDescription = frontmatter.summary || siteConfig.description
const pageImage = frontmatter.image || buildAbsoluteUrl(siteUrl, `/og/${frontmatter.slug}.png`)

function createChunkedSection(
  loader: () => Promise<unknown>,
  hydration: ChunkHydrationMode = 'visible',
) {
  return defineAsyncComponent({
    loader: loader as never,
    hydrate: hydration === 'idle'
      ? hydrateOnIdle()
      : hydrateOnVisible({ rootMargin: '1200px 0px' }),
  })
}

const SectionIntro = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/00-intro.md'), 'idle')
const SectionBasics = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/01-basics.md'))
const SectionProperties = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/02-properties.md'))
const SectionApplicationsFoundations = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/03-applications-foundations.md'))
const SectionApplicationsCollisions = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/04-applications-collisions.md'))
const SectionApplicationsScattering = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/05-applications-scattering.md'))

useHead(() => ({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:image', content: pageImage },
  ],
}))
</script>

<template>
  <WrapperPost :frontmatter="frontmatter">
    <SectionIntro />
    <SectionBasics />
    <SectionProperties />
    <SectionApplicationsFoundations />
    <SectionApplicationsCollisions />
    <SectionApplicationsScattering />
  </WrapperPost>
</template>

<route lang="yaml">
meta:
  frontmatter:
    title: 如何用四维矢量来解决狭义相对论问题（基础的时空与碰撞的变换）
    slug: STR-Four-Vector-Basic-Transformation
    type: post
    date: 2025-07-20T10:58:41.139Z
    summary: 在学习物理竞赛的过程中，我曾发现中文资料中关于狭义相对论( STR )四维矢量的文章乃至书籍都极为稀缺。鉴于此，我希望能结合个人所学，撰写一篇相关文章，以期为有志于此的同学提供一份学习参考。
    image: https://pi-dal.com/og/STR-Four-Vector-Basic-Transformation.png
</route>
