import type { TocItem } from '~/types'

interface TocHeadingLike {
  id: string
  tagName: string
  textContent: string | null
}

export function extractTocItems(headings: ArrayLike<TocHeadingLike>): TocItem[] {
  const items: TocItem[] = []

  for (const heading of Array.from(headings)) {
    const text = (heading.textContent || '').replace(/#\s*$/, '').trim()
    const level = Number.parseInt(heading.tagName.replace(/^H/i, ''), 10)

    if (!heading.id || !text || Number.isNaN(level))
      continue

    items.push({
      id: heading.id,
      text,
      level,
    })
  }

  return items
}
