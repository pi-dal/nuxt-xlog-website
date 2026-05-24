import { describe, expect, it } from 'vitest'

import { buildAbsoluteUrl, buildContentPageHead, resolveAuthorHandle, resolveSiteUrl } from '~/logics/site-meta'
import { siteConfig } from '~/site/config'

describe('site-meta utilities', () => {
  it('falls back to the local site config', () => {
    expect(resolveSiteUrl()).toBe(siteConfig.url)
  })

  it('builds absolute URLs gracefully', () => {
    expect(buildAbsoluteUrl('https://example.com', 'foo')).toBe('https://example.com/foo')
    expect(buildAbsoluteUrl('https://example.com', '/bar')).toBe('https://example.com/bar')
    expect(buildAbsoluteUrl('', 'https://other.com/baz')).toBe('https://other.com/baz')
  })

  it('derives author handle from local site config', () => {
    expect(resolveAuthorHandle()).toBe(siteConfig.author.handle)
  })

  it('keeps the homepage title and description clean', () => {
    const head = buildContentPageHead({
      description: 'Notes, experiments, and life updates from pi-dal.',
      image: 'https://example.com/og/home.png',
      path: '/',
      title: siteConfig.title,
      type: 'page',
    })

    expect(head.title).toBe(siteConfig.title)
    expect(head.meta?.find(meta => meta.name === 'description')?.content).toBe('Notes, experiments, and life updates from pi-dal.')
  })

  it('uses an explicit description before summary when generating head metadata', () => {
    const head = buildContentPageHead({
      description: 'Explicit description',
      image: 'https://example.com/og/post.png',
      path: '/posts/example',
      title: 'Example',
      type: 'post',
    })

    expect(head.meta?.find(meta => meta.name === 'description')?.content).toBe('Explicit description')
  })
})
