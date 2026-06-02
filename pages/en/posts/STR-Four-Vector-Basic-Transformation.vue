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

const SectionIntro = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/en/00-intro.md'), 'idle')
const SectionBasics = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/en/01-basics.md'))
const SectionProperties = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/en/02-properties.md'))
const SectionApplicationsFoundations = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/en/03-applications-foundations.md'))
const SectionApplicationsCollisions = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/en/04-applications-collisions.md'))
const SectionApplicationsScattering = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Basic-Transformation/en/05-applications-scattering.md'))
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
    title: Four-Vectors in Special Relativity — Spacetime and Collisions
    slug: STR-Four-Vector-Basic-Transformation
    type: post
    lang: en
    date: 2025-07-20T10:58:41.000Z
    summary: In learning physics olympiad, I found Chinese resources on four-vectors in special relativity extremely scarce. This article draws on my studies to provide a reference for students interested in four-vector methods, covering basic spacetime transformations and collision dynamics.
    image: https://pi-dal.com/og/STR-Four-Vector-Basic-Transformation.png
</route>
