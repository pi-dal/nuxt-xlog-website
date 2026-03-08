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
  return /\/index\.md$/i.test(filePath.replace(/\\/g, '/'))
}

function toRootRelativeMarkdownPath(rootDir: string, filePath: string) {
  return relative(resolve(rootDir, 'pages'), filePath).replace(/\\/g, '/')
}

export function resolveRoutePathOverride(options: RoutePathOverrideOptions) {
  if (isIndexFile(options.filePath))
    return undefined

  return resolveMarkdownRoutePath(options)
}

export function resolveMarkdownRoutePath(options: MarkdownRoutePathOptions) {
  const rootDir = options.rootDir || process.cwd()
  const relativePath = toRootRelativeMarkdownPath(rootDir, options.filePath)

  if (isIndexFile(options.filePath))
    return `/${relativePath.replace(/\/index\.md$/i, '')}` || '/'

  const slug = requireSlug(options.filePath, options.frontmatter)
  const segments = relativePath.split('/')
  segments[segments.length - 1] = slug
  return `/${segments.join('/')}`.replace(/\/+/g, '/')
}
