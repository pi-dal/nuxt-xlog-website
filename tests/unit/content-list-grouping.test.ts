import { describe, expect, it } from 'vitest'

import { getYearHeadingClassNames, groupContentEntriesByYear } from '~/logics/content-list'

describe('groupContentEntriesByYear', () => {
  it('groups dated entries by descending year and keeps undated entries separate', () => {
    const groups = groupContentEntriesByYear([
      {
        path: '/posts/third',
        title: 'Third',
        slug: 'third',
        tags: [],
        draft: false,
        type: 'post',
        date: '2023-01-03',
      },
      {
        path: '/posts/first',
        title: 'First',
        slug: 'first',
        tags: [],
        draft: false,
        type: 'post',
        date: '2024-01-03',
      },
      {
        path: '/posts/second',
        title: 'Second',
        slug: 'second',
        tags: [],
        draft: false,
        type: 'post',
        date: '2024-01-02',
      },
      {
        path: '/posts/undated',
        title: 'Undated',
        slug: 'undated',
        tags: [],
        draft: false,
        type: 'post',
      },
    ])

    expect(groups).toHaveLength(3)
    expect(groups[0].label).toBe('2024')
    expect(groups[0].entries.map(entry => entry.slug)).toEqual(['first', 'second'])
    expect(groups[1].label).toBe('2023')
    expect(groups[1].entries.map(entry => entry.slug)).toEqual(['third'])
    expect(groups[2].label).toBe('More')
    expect(groups[2].entries.map(entry => entry.slug)).toEqual(['undated'])
  })

  it('uses visible year heading styles instead of transparent outline-only text', () => {
    const classNames = getYearHeadingClassNames()

    expect(classNames).toContain('text-zinc-300')
    expect(classNames).toContain('dark:text-zinc-700')
    expect(classNames).not.toContain('text-transparent')
  })
})
