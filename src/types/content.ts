export type ContentType = 'book' | 'chat' | 'page' | 'post' | 'project'

export interface SiteLink {
  platform: string
  url: string
}

export interface SiteConfig {
  author: {
    handle: string
    name: string
  }
  avatar: string
  description: string
  socialLinks: SiteLink[]
  title: string
  url: string
}

export interface ContentFrontmatter {
  title: string
  date?: string
  draft?: boolean
  image?: string
  lang?: string
  slug: string
  summary?: string
  tags?: string[]
  type: ContentType
}

export interface ImportedArticleRecord {
  date?: string
  draft?: boolean
  slug: string
  status?: string
  summary?: string
  tags?: string[]
  title: string
  type: ContentType
}

export function isContentType(value: string | null | undefined): value is ContentType {
  return ['book', 'chat', 'page', 'post', 'project'].includes((value || '').toLowerCase())
}

export function normalizeContentType(value: string | null | undefined): ContentType {
  const normalized = value?.trim().toLowerCase()
  if (!normalized || !isContentType(normalized))
    throw new Error(`Unsupported content type: ${value || '<empty>'}`)
  return normalized
}
