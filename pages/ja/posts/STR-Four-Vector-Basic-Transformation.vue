<script setup lang="ts">
import type { ContentFrontmatter } from '~/types/content'
import { defineAsyncComponent, hydrateOnIdle, hydrateOnVisible } from 'vue'

type ChunkHydrationMode = 'idle' | 'visible'

const route = useRoute()
const frontmatter = route.meta.frontmatter as ContentFrontmatter

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

const SectionIntro = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/ja/00-intro.md'), 'idle')
const SectionBasics = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/ja/01-basics.md'))
const SectionProperties = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/ja/02-properties.md'))
const SectionApplicationsFoundations = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/ja/03-applications-foundations.md'))
const SectionApplicationsCollisions = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/ja/04-applications-collisions.md'))
const SectionApplicationsScattering = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/ja/05-applications-scattering.md'))
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
    title: 特殊相対性理論における四元ベクトル — 時空と衝突
    slug: STR-Four-Vector-Basic-Transformation
    type: post
    lang: ja
    date: 2025-07-20T10:58:41.000Z
    summary: 物理オリンピックの学習の中で、特殊相対性理論の四元ベクトルに関する中国語資料が極めて少ないことに気づきました。この記事では基礎的な時空変換から衝突力学までをカバーします。
    image: https://pi-dal.com/og/STR-Four-Vector-Basic-Transformation.png
</route>
