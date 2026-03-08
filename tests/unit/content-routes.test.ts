import { describe, expect, it } from 'vitest'

import { extractContentEntriesFromRoutes } from '~/composables/useContentRoutes'

describe('extractContentEntriesFromRoutes', () => {
  it('filters content routes by collection, excludes drafts, and sorts by descending date', () => {
    const routes: Parameters<typeof extractContentEntriesFromRoutes>[0] = [
      {
        path: '/posts/older',
        meta: {
          frontmatter: {
            title: 'Older Post',
            slug: 'older',
            type: 'post',
            date: '2024-01-01',
          },
        },
      },
      {
        path: '/posts/newer',
        meta: {
          frontmatter: {
            title: 'Newer Post',
            slug: 'newer',
            type: 'post',
            date: '2024-02-01',
          },
        },
      },
      {
        path: '/posts/draft',
        meta: {
          frontmatter: {
            title: 'Draft Post',
            slug: 'draft',
            type: 'post',
            date: '2024-03-01',
            draft: true,
          },
        },
      },
      {
        path: '/about',
        meta: {
          frontmatter: {
            title: 'About',
            slug: 'about',
            type: 'page',
          },
        },
      },
    ]

    const entries = extractContentEntriesFromRoutes(routes, {
      collection: 'posts',
    })

    expect(entries.map(entry => entry.title)).toEqual(['Newer Post', 'Older Post'])
    expect(entries.every(entry => entry.path.startsWith('/posts/'))).toBe(true)
  })
})
