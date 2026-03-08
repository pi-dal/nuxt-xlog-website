import type { ContentRouteEntry } from '~/composables/useContentRoutes'

export interface ContentEntryGroup {
  entries: ContentRouteEntry[]
  label: string
}

export function getYearHeadingClassNames() {
  return 'text-sm font-semibold tracking-[0.32em] uppercase text-zinc-300 dark:text-zinc-700'
}

export function groupContentEntriesByYear(entries: ContentRouteEntry[]): ContentEntryGroup[] {
  const groups = new Map<string, ContentRouteEntry[]>()

  for (const entry of entries) {
    const label = entry.date
      ? String(new Date(entry.date).getFullYear())
      : 'More'

    const current = groups.get(label) || []
    current.push(entry)
    groups.set(label, current)
  }

  return [...groups.entries()]
    .sort((a, b) => {
      if (a[0] === 'More')
        return 1
      if (b[0] === 'More')
        return -1
      return Number(b[0]) - Number(a[0])
    })
    .map(([label, groupedEntries]) => ({
      label,
      entries: groupedEntries,
    }))
}
