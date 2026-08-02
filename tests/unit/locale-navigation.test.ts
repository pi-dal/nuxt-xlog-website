import { describe, expect, it } from 'vitest'
import {
  buildLocaleCookie,
  buildLocaleNavigation,
  getLocaleFromCookie,
  getLocaleFromPath,
  hasConcreteRoute,
  localizeBareEntryPath,
} from '~/logics/locale-routing'

const labels = {
  zh: 'ZH',
  en: 'EN',
  ja: 'JA',
} as const

describe('locale navigation', () => {
  it('only offers locale variants that resolve to real routes', () => {
    const existingRoutes = new Set([
      '/zh/posts/example',
      '/en/posts/example',
    ])

    const items = buildLocaleNavigation({
      currentFullPath: '/zh/posts/example',
      labels,
      routeExists: path => existingRoutes.has(path),
    })

    expect(items.map(item => item.label)).toEqual(['ZH', 'EN'])
    expect(items.map(item => item.to)).toEqual([
      '/zh/posts/example',
      '/en/posts/example',
    ])
  })

  it('does not offer language navigation on an unlocalized page', () => {
    const items = buildLocaleNavigation({
      currentFullPath: '/embeds',
      labels,
      routeExists: path => path === '/embeds',
    })

    expect(items).toEqual([])
  })

  it('keeps the current query and hash when switching locale', () => {
    const items = buildLocaleNavigation({
      currentFullPath: '/zh/posts/example?view=compact#details',
      labels,
      routeExists: () => true,
    })

    expect(items.find(item => item.locale === 'en')?.to)
      .toBe('/en/posts/example?view=compact#details')
  })

  it('derives one locale consistently and persists only explicit locale paths', () => {
    expect(getLocaleFromPath('/ja/books/example')).toBe('ja')
    expect(getLocaleFromPath('/embeds')).toBeNull()
    expect(buildLocaleCookie('/en/posts/example')).toContain('locale=en')
    expect(buildLocaleCookie('/embeds')).toBeNull()
  })

  it('does not count the catch-all 404 record as an existing route', () => {
    expect(hasConcreteRoute({ matched: [{ name: '/[...404]' }] })).toBe(false)
    expect(hasConcreteRoute({ matched: [{ name: '/zh/posts/[slug]' }] })).toBe(true)
  })

  it('normalizes bare SPA entry links using the active locale preference', () => {
    expect(getLocaleFromCookie('theme=dark; locale=en')).toBe('en')
    expect(getLocaleFromCookie('locale=de')).toBeNull()
    expect(localizeBareEntryPath('/posts', 'en')).toBe('/en/posts')
    expect(localizeBareEntryPath('/books/example', 'ja')).toBe('/ja/books/example')
    expect(localizeBareEntryPath('/projects/', 'zh')).toBe('/zh/projects')
    expect(localizeBareEntryPath('/embeds', 'en')).toBeNull()
  })
})
