import { describe, expect, it } from 'vitest'

import {
  buildBilibiliEmbedSrc,
  buildGitHubRepoHref,
  buildYouTubeEmbedSrc,
  getCopyText,
  isExternalLink,
  parseGitHubRepo,
} from '~/logics/embeds'

describe('isExternalLink', () => {
  it('identifies http and https urls as external links', () => {
    expect(isExternalLink('https://example.com')).toBe(true)
    expect(isExternalLink('http://example.com/docs')).toBe(true)
    expect(isExternalLink('/posts/hello-world')).toBe(false)
    expect(isExternalLink('mailto:hello@example.com')).toBe(false)
  })
})

describe('buildYouTubeEmbedSrc', () => {
  it('builds a privacy-friendly youtube embed url', () => {
    expect(buildYouTubeEmbedSrc('dQw4w9WgXcQ'))
      .toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })
})

describe('buildBilibiliEmbedSrc', () => {
  it('builds a bilibili player url from a bvid and page number', () => {
    expect(buildBilibiliEmbedSrc('BV1xx411c7mD'))
      .toBe('https://player.bilibili.com/player.html?bvid=BV1xx411c7mD&page=1')

    expect(buildBilibiliEmbedSrc('BV1xx411c7mD', 3))
      .toBe('https://player.bilibili.com/player.html?bvid=BV1xx411c7mD&page=3')
  })
})

describe('getCopyText', () => {
  it('prefers explicit text and supports slicing', () => {
    expect(getCopyText({
      text: '  owner/repo  ',
      fallbackText: 'ignored',
      slice: [0, 5],
    })).toBe('owner')
  })

  it('falls back to trimmed slot text when explicit text is absent', () => {
    expect(getCopyText({
      fallbackText: '  pnpm add nuxt  ',
    })).toBe('pnpm add nuxt')
  })
})

describe('parseGitHubRepo', () => {
  it('normalizes owner and repo names from shorthand input', () => {
    expect(parseGitHubRepo('antfu/antfu.me')).toEqual({
      owner: 'antfu',
      name: 'antfu.me',
      repo: 'antfu/antfu.me',
    })
  })

  it('rejects malformed repo names', () => {
    expect(() => parseGitHubRepo('antfu')).toThrow(/owner\/repo/i)
  })
})

describe('buildGitHubRepoHref', () => {
  it('builds a canonical github repository link', () => {
    expect(buildGitHubRepoHref('antfu/antfu.me'))
      .toBe('https://github.com/antfu/antfu.me')
  })
})
