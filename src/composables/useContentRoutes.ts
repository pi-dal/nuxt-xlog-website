import type { ContentType } from '~/types/content'
import { contentEntries } from '~/content/content-entries'
import { normalizeContentType } from '~/types/content'

export interface ContentRouteEntry {
  date?: string
  draft: boolean
  image?: string
  lang?: string
  path: string
  slug: string
  summary?: string
  tags: string[]
  title: string
  type: ContentType
}

interface ExtractOptions {
  collection?: 'books' | 'posts'
  lang?: string
  type?: ContentType
}

export function useContentRoutes(options: ExtractOptions = {}): import('vue').ComputedRef<ContentRouteEntry[]> {
  const filtered = computed(() => {
    return contentEntries
      .filter(entry => !options.collection || entry.collection === options.collection)
      .filter(entry => !options.lang || entry.lang === options.lang)
      .filter(entry => !entry.draft)
      .map(entry => ({
        path: entry.path,
        title: entry.title,
        slug: entry.slug,
        lang: entry.lang,
        date: entry.date,
        summary: entry.summary,
        type: normalizeContentType(entry.type),
        tags: [] as string[],
        draft: false,
      }))
      .sort((a, b) => {
        if (!a.date && !b.date)
          return a.title.localeCompare(b.title)
        if (!a.date)
          return 1
        if (!b.date)
          return -1
        return +new Date(b.date) - +new Date(a.date)
      }) as ContentRouteEntry[]
  })

  return filtered
}
