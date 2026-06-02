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

const SectionIntro = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/en/00-intro.md'), 'idle')
const SectionElectromagnetic = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/en/01-electromagnetic-four-current.md'))
const SectionFieldTensor = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/en/02-field-tensor.md'))
const SectionMaxwell = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/en/03-maxwell-equations.md'))
const SectionForceEnergy = createChunkedSection(() => import('~/content/chunked-posts/STR-Four-Vector-Electromagnetism-and-Dynamics/en/04-force-and-energy.md'))
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
    title: Four-Vectors in Special Relativity — Electromagnetism and Dynamics
    slug: STR-Four-Vector-Electromagnetism-and-Dynamics
    type: post
    lang: en
    date: 2025-10-07T00:00:00.000Z
    summary: Building on the basic spacetime and collision transformations, this article explores the application of four-vectors in electromagnetism and dynamics — from four-current density and the electromagnetic field tensor to the covariant form of Maxwell's equations and the proof of Lorentz force covariance.
    image: https://pi-dal.com/og/STR-Four-Vector-Electromagnetism-and-Dynamics.png
</route>
