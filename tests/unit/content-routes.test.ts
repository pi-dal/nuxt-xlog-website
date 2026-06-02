import { describe, expect, it } from 'vitest'

import { contentEntries } from '~/content/content-entries'

describe('content entries', () => {
  it('loads content entries from build-time manifest with proper metadata', () => {
    // Verify the manifest has all expected entries
    expect(contentEntries.length).toBeGreaterThan(20)

    // Check EN posts exist with real titles and dates
    const enPosts = contentEntries.filter(e => e.lang === 'en' && e.collection === 'posts' && e.slug !== 'posts')
    expect(enPosts.length).toBeGreaterThanOrEqual(6)
    expect(enPosts.some(e => e.title.includes('ArozOS'))).toBe(true)
    expect(enPosts.some(e => e.date && e.date.length > 0)).toBe(true)

    // Check JA posts exist
    const jaPosts = contentEntries.filter(e => e.lang === 'ja' && e.collection === 'posts' && e.slug !== 'posts')
    expect(jaPosts.length).toBeGreaterThanOrEqual(6)
    expect(jaPosts.some(e => e.date && e.date.length > 0)).toBe(true)

    // Check ZH posts exist
    const zhPosts = contentEntries.filter(e => e.lang === 'zh' && e.collection === 'posts' && e.slug !== 'posts')
    expect(zhPosts.length).toBeGreaterThanOrEqual(6)
  })
})
