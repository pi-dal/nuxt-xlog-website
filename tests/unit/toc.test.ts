import { describe, expect, it } from 'vitest'

import { extractTocItems } from '~/logics/toc'

describe('extractTocItems', () => {
  it('builds toc items from heading-like nodes and strips anchor suffixes', () => {
    const items = extractTocItems([
      {
        id: 'day-1',
        tagName: 'H1',
        textContent: 'Day 1#',
      },
      {
        id: 'setup',
        tagName: 'H2',
        textContent: 'Setup',
      },
      {
        id: '',
        tagName: 'H3',
        textContent: 'Ignored',
      },
    ])

    expect(items).toEqual([
      {
        id: 'day-1',
        text: 'Day 1',
        level: 1,
      },
      {
        id: 'setup',
        text: 'Setup',
        level: 2,
      },
    ])
  })
})
