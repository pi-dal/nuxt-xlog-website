import type { ContentFrontmatter, ContentType } from '~/types/content'
import { useRouter } from 'vue-router'
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

interface RouteLike {
  meta?: {
    frontmatter?: Partial<ContentFrontmatter>
  }
  path: string
}

interface ExtractOptions {
  collection?: 'books' | 'posts'
  lang?: string
  type?: ContentType
}

function normalizeRouteEntry(route: RouteLike): ContentRouteEntry | null {
  const frontmatter = route.meta?.frontmatter
  if (!frontmatter?.title || !frontmatter.slug || !frontmatter.type)
    return null

  // Detect locale from route path as fallback
  let lang = frontmatter.lang
  if (!lang || !['zh', 'en', 'ja'].includes(lang)) {
    const segs = route.path.split('/').filter(Boolean)
    if (segs.length >= 1 && ['en', 'zh', 'ja'].includes(segs[0]))
      lang = segs[0]
    else
      lang = 'zh'
  }

  return {
    path: route.path,
    title: frontmatter.title,
    slug: frontmatter.slug,
    date: frontmatter.date,
    lang,
    summary: frontmatter.summary,
    image: frontmatter.image,
    type: normalizeContentType(frontmatter.type),
    tags: frontmatter.tags || [],
    draft: Boolean(frontmatter.draft),
  }
}

function matchesCollection(path: string, collection?: ExtractOptions['collection']) {
  if (!collection)
    return true

  const prefix = `/${collection}/`
  return path.startsWith(prefix)
}

export function extractContentEntriesFromRoutes(routes: RouteLike[], options: ExtractOptions = {}): ContentRouteEntry[] {
  return routes
    .map(normalizeRouteEntry)
    .filter((entry): entry is ContentRouteEntry => Boolean(entry))
    .filter(entry => matchesCollection(entry.path, options.collection))
    .filter(entry => !options.type || entry.type === options.type)
    .filter(entry => !options.lang || entry.lang === options.lang)
    .filter(entry => !entry.draft)
    .filter(entry => !options.collection || Boolean(entry.date))
    .sort((a, b) => {
      if (!a.date && !b.date)
        return a.title.localeCompare(b.title)
      if (!a.date)
        return 1
      if (!b.date)
        return -1
      return +new Date(b.date) - +new Date(a.date)
    })
}

export function useContentRoutes(options: ExtractOptions = {}) {
  const router = useRouter()

  return computed(() => extractContentEntriesFromRoutes(router.getRoutes(), options))
}
