import { describe, expect, it } from 'vitest'

import {
  buildCollectionPageHead,
  buildContentPageHead,
} from '~/logics/site-meta'

describe('page head helpers', () => {
  it('builds canonical and collection JSON-LD for list pages', () => {
    const head = buildCollectionPageHead({
      collection: 'posts',
      description: 'Thoughts on code, study, tools, and whatever I am trying to understand.',
      path: '/posts',
      title: 'Blog Posts',
    })

    expect(head.title).toBe('Blog Posts - pi-dal')
    expect(head.link).toContainEqual({
      rel: 'canonical',
      href: 'https://pi-dal.com/posts',
    })
    expect(head.meta).toContainEqual({
      property: 'og:url',
      content: 'https://pi-dal.com/posts',
    })
    expect(head.script).toHaveLength(1)
    expect(head.script?.[0]?.type).toBe('application/ld+json')

    const payload = JSON.parse(head.script?.[0]?.textContent || '{}')
    expect(payload['@type']).toBe('CollectionPage')
    expect(payload.url).toBe('https://pi-dal.com/posts')
    expect(payload.name).toBe('Blog Posts')
  })

  it('builds canonical and article JSON-LD for content pages', () => {
    const head = buildContentPageHead({
      date: '2025-07-20T10:58:41.139Z',
      description: 'A reference article about four-vectors.',
      image: 'https://pi-dal.com/og/STR-Four-Vector-Basic-Transformation.png',
      path: '/posts/STR-Four-Vector-Basic-Transformation',
      title: 'How to use four-vectors',
      type: 'post',
    })

    expect(head.title).toBe('How to use four-vectors - pi-dal')
    expect(head.link).toContainEqual({
      rel: 'canonical',
      href: 'https://pi-dal.com/posts/STR-Four-Vector-Basic-Transformation',
    })
    expect(head.meta).toContainEqual({
      property: 'og:url',
      content: 'https://pi-dal.com/posts/STR-Four-Vector-Basic-Transformation',
    })
    expect(head.meta).toContainEqual({
      property: 'og:type',
      content: 'article',
    })

    const payload = JSON.parse(head.script?.[0]?.textContent || '{}')
    expect(payload['@type']).toBe('BlogPosting')
    expect(payload.headline).toBe('How to use four-vectors')
    expect(payload.datePublished).toBe('2025-07-20T10:58:41.139Z')
    expect(payload.image).toEqual(['https://pi-dal.com/og/STR-Four-Vector-Basic-Transformation.png'])
  })
})
