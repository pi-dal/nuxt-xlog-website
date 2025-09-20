import type { XLogSite } from '~/types'
import { describe, expect, it } from 'vitest'

import { buildAbsoluteUrl, resolveAuthorHandle, resolveSiteUrl } from '~/logics/site-meta'

const baseSite: XLogSite = {
  id: '1',
  name: 'Example',
  subdomain: 'example',
}

describe('site-meta utilities', () => {
  it('normalizes env overrides', () => {
    const site = { ...baseSite, custom_domain: 'https://custom.test' }
    expect(resolveSiteUrl(site)).toMatch(/custom/)
  })

  it('falls back to subdomain when no custom domain', () => {
    expect(resolveSiteUrl(baseSite)).toBe('https://example.xlog.app')
  })

  it('builds absolute URLs gracefully', () => {
    expect(buildAbsoluteUrl('https://example.com', 'foo')).toBe('https://example.com/foo')
    expect(buildAbsoluteUrl('https://example.com', '/bar')).toBe('https://example.com/bar')
    expect(buildAbsoluteUrl('', 'https://other.com/baz')).toBe('https://other.com/baz')
  })

  it('derives author handle from social links', () => {
    const site = {
      ...baseSite,
      social_links: [{ platform: 'twitter', url: 'https://twitter.com/antfu' }],
    }
    expect(resolveAuthorHandle(site)).toBe('antfu')
  })
})
