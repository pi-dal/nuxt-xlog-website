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

const SectionIntro = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/ja/00-intro.md'), 'idle')
const SectionElectromagnetic = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/ja/01-electromagnetic-four-current.md'))
const SectionFieldTensor = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/ja/02-field-tensor.md'))
const SectionMaxwell = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/ja/03-maxwell-equations.md'))
const SectionForceEnergy = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/ja/04-force-and-energy.md'))
</script>

<template>
  <WrapperPost :frontmatter="frontmatter">
    <SectionIntro />
    <SectionElectromagnetic />
    <SectionFieldTensor />
    <SectionMaxwell />
    <SectionForceEnergy />
  </WrapperPost>
</template>

<route lang="yaml">
meta:
  frontmatter:
    title: 特殊相対性理論における四元ベクトル — 電磁気学と力学
    slug: STR-Four-Vector-Electromagnetism-and-Dynamics
    type: post
    lang: ja
    date: 2025-10-07T00:00:00.000Z
    summary: 基礎的な時空と衝突の変換に続き、電磁気学と力学における四元ベクトルの応用を探求します。四元電流密度、電磁場テンソルからマクスウェル方程式の共変形式、ローレンツ力の共変性証明まで。
    image: https://pi-dal.com/og/STR-Four-Vector-Electromagnetism-and-Dynamics.png
</route>
