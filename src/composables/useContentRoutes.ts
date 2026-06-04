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
    // Get all matching entries
    const all = contentEntries
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

    // Deduplicate by slug: prefer locale-prefixed paths
    const bySlug = new Map<string, ContentRouteEntry>()
    for (const entry of all) {
      // Always prefer locale-prefixed paths (/zh/posts/xxx > /posts/xxx)
      const existing = bySlug.get(entry.slug)
      if (!existing) {
        bySlug.set(entry.slug, entry)
      }
      else {
        const entryHasLocale = entry.path.split('/').filter(Boolean).length >= 2 && ['en', 'zh', 'ja'].includes(entry.path.split('/').filter(Boolean)[0])
        const existingHasLocale = existing.path.split('/').filter(Boolean).length >= 2 && ['en', 'zh', 'ja'].includes(existing.path.split('/').filter(Boolean)[0])
        // Only replace if the new entry has a locale prefix and the existing doesn't
        if (entryHasLocale && !existingHasLocale) {
          bySlug.set(entry.slug, entry)
        }
      }
    }
    return [...bySlug.values()]
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
