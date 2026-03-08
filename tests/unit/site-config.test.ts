import { describe, expect, it } from 'vitest'

import { resolveAuthorHandle, resolveSiteUrl } from '~/logics/site-meta'
import { siteConfig } from '~/site/config'

describe('site config', () => {
  it('resolves the canonical base URL from local config', () => {
    expect(resolveSiteUrl()).toBe(siteConfig.url)
  })

  it('resolves the author handle from local config', () => {
    expect(resolveAuthorHandle()).toBe(siteConfig.author.handle)
  })

  it('does not fall back to xlog branding when local config exists', () => {
    expect(resolveSiteUrl()).not.toContain('.xlog.app')
    expect(resolveAuthorHandle()).not.toBe('xlog')
  })
})
