import type { ContentFrontmatter } from '~/types/content'
import { relative, resolve } from 'node:path'

interface RoutePathOverrideOptions {
  filePath: string
  frontmatter: Partial<ContentFrontmatter>
  rootDir?: string
}

interface MarkdownRoutePathOptions {
  filePath: string
  frontmatter: Partial<ContentFrontmatter>
  rootDir?: string
}

function normalizeSlug(slug: string | undefined) {
  const normalized = slug?.trim().replace(/^\/+|\/+$/g, '')
  return normalized || undefined
}

function requireSlug(filePath: string, frontmatter: Partial<ContentFrontmatter>) {
  const slug = normalizeSlug(frontmatter.slug)
  if (slug)
    return slug

  throw new Error(`Missing frontmatter slug for ${filePath}`)
}

function isIndexFile(filePath: string) {
  return /\/index\.(?:md|vue)$/i.test(filePath.replace(/\\/g, '/'))
}

function toRootRelativeMarkdownPath(rootDir: string, filePath: string) {
  return relative(resolve(rootDir, 'pages'), filePath).replace(/\\/g, '/')
}

function removePageExtension(path: string) {
  return path.replace(/\.(md|vue)$/i, '')
}

export function isLegacyRootCollectionPath(relativePath: string) {
  return /^(?:posts|books)(?:\/|$)/.test(relativePath)
}

function localeFromFrontmatter(frontmatter: Partial<ContentFrontmatter>) {
  return typeof frontmatter.lang === 'string' && frontmatter.lang.trim()
    ? frontmatter.lang.trim()
    : 'zh'
}

function toCanonicalContentPath(relativePath: string, frontmatter: Partial<ContentFrontmatter>, slug?: string) {
  const segments = relativePath.split('/')

  if (isLegacyRootCollectionPath(relativePath)) {
    segments.unshift(localeFromFrontmatter(frontmatter))
  }

  if (slug)
    segments[segments.length - 1] = slug

  return `/${segments.join('/')}`.replace(/\/+/g, '/')
}

export function resolvePathBasedRoutePath(options: MarkdownRoutePathOptions) {
  const rootDir = options.rootDir || process.cwd()
  const relativePath = removePageExtension(toRootRelativeMarkdownPath(rootDir, options.filePath))

  return toCanonicalContentPath(relativePath, options.frontmatter)
}

export function resolveRoutePathOverride(options: RoutePathOverrideOptions) {
  const rootDir = options.rootDir || process.cwd()
  const relativePath = toRootRelativeMarkdownPath(rootDir, options.filePath)

  if (isIndexFile(options.filePath) && !isLegacyRootCollectionPath(relativePath))
    return undefined

  return resolveMarkdownRoutePath(options)
}

export function resolveMarkdownRoutePath(options: MarkdownRoutePathOptions) {
  const rootDir = options.rootDir || process.cwd()
  const relativePath = toRootRelativeMarkdownPath(rootDir, options.filePath)

  if (isIndexFile(options.filePath)) {
    const clean = relativePath.replace(/\/?index\.(?:md|vue)$/i, '')
    return clean ? toCanonicalContentPath(clean, options.frontmatter) : '/'
  }

  const slug = requireSlug(options.filePath, options.frontmatter)
  return toCanonicalContentPath(relativePath, options.frontmatter, slug)
}
