import type { ContentFrontmatter } from '~/types/content'
import { readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { resolveMarkdownRoutePath } from './content-route-path'
import { buildAbsoluteUrl } from './site-meta'

export interface CanonicalRouteEntry {
  path: string
  title?: string
  type: 'content' | 'page' | 'route'
}

interface ContentScanOptions {
  rootDir?: string
}

const IGNORED_MARKDOWN_FILES = new Set([
  '[...404].vue',
])

function normalizePath(path: string) {
  if (!path)
    return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function removeExtension(path: string) {
  return path.replace(/\.(md|vue)$/i, '')
}

function toRootRelativePagePath(rootDir: string, filePath: string) {
  return relative(resolve(rootDir, 'pages'), filePath).replace(/\\/g, '/')
}

function resolveVueRoutePath(rootDir: string, filePath: string) {
  const relativePath = toRootRelativePagePath(rootDir, filePath)
  if (IGNORED_MARKDOWN_FILES.has(relativePath))
    return null

  const withoutExtension = removeExtension(relativePath)
  if (withoutExtension.endsWith('/index'))
    return normalizePath(withoutExtension.slice(0, -'/index'.length) || '/')

  if (withoutExtension.includes('['))
    return null

  return normalizePath(withoutExtension)
}

export async function collectCanonicalRouteEntries(options: ContentScanOptions = {}): Promise<CanonicalRouteEntry[]> {
  const rootDir = options.rootDir || process.cwd()
  const markdownFiles = await fg(['pages/**/*.md'], {
    absolute: true,
    cwd: rootDir,
  })
  const vueFiles = await fg(['pages/**/*.vue'], {
    absolute: true,
    cwd: rootDir,
  })

  const markdownEntries = await Promise.all(markdownFiles.map(async (filePath) => {
    const raw = await readFile(filePath, 'utf8')
    const { data } = matter(raw)
    const frontmatter = data as Partial<ContentFrontmatter>
    if (frontmatter.draft)
      return null

    const path = resolveMarkdownRoutePath({
      filePath,
      frontmatter,
      rootDir,
    })

    return {
      path,
      title: frontmatter.title,
      type: (frontmatter.date || ['book', 'post'].includes(frontmatter.type || ''))
        ? 'content'
        : 'page',
    } satisfies CanonicalRouteEntry
  }))

  const vueEntries = vueFiles
    .map((filePath) => {
      const path = resolveVueRoutePath(rootDir, filePath)
      if (!path)
        return null
      return {
        path,
        type: 'route',
      } satisfies CanonicalRouteEntry
    })

  const deduped = new Map<string, CanonicalRouteEntry>()
  for (const entry of [...markdownEntries, ...vueEntries]) {
    if (!entry)
      continue
    deduped.set(entry.path, entry)
  }

  return [...deduped.values()].sort((a, b) => a.path.localeCompare(b.path))
}

export async function collectCanonicalUrls(baseUrl: string, options: ContentScanOptions = {}): Promise<string[]> {
  const entries = await collectCanonicalRouteEntries(options)
  const urls = new Set<string>([
    buildAbsoluteUrl(baseUrl, '/'),
  ])

  for (const entry of entries) {
    urls.add(buildAbsoluteUrl(baseUrl, entry.path))

    const segments = entry.path.split('/').filter(Boolean)
    if (segments.length >= 2)
      urls.add(buildAbsoluteUrl(baseUrl, `/${segments[0]}/`))
  }

  return [...urls]
}
