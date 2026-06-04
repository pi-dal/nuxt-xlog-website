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

const SectionIntro = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/00-intro.md'), 'idle')
const SectionElectromagnetic = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/01-electromagnetic-four-current.md'))
const SectionFieldTensor = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/02-field-tensor.md'))
const SectionMaxwell = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/03-maxwell-equations.md'))
const SectionForceEnergy = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/04-force-and-energy.md'))
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
    title: 如何用四维矢量来解决狭义相对论问题（电磁学与动力学）
    slug: STR-Four-Vector-Electromagnetism-and-Dynamics
    type: post
    lang: zh
    date: 2025-10-07T00:00:00.000Z
    summary: 在上篇文章介绍了基础的时空与碰撞变换之后，本文进一步探讨四维矢量在电磁学与动力学中的应用。
    image: https://pi-dal.com/og/STR-Four-Vector-Electromagnetism-and-Dynamics.png
</route>
