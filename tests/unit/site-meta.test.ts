import { describe, expect, it } from 'vitest'

import { buildAbsoluteUrl, resolveAuthorHandle, resolveSiteUrl } from '~/logics/site-meta'
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
})
