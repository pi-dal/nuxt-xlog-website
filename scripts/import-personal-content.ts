import type { ImportedArticleRecord } from '~/types/content'
import { readFile } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { slugify } from './slugify'

interface XlogMappingEntry {
  author?: string
  date?: string
  ogImage?: string
  title?: string
}

export interface ImportPersonalContentOptions {
  outputDir?: string
  personalDir?: string
  publicDir?: string
  xlogMappingPath?: string
}

export interface ImportPersonalContentResult {
  copiedAssets: string[]
  importedBooks: string[]
  importedPosts: string[]
}

interface MatchedXlogEntry {
  entry: XlogMappingEntry
  slug: string
}

const FOUR_VECTOR_POSTS = [
  {
    filename: '如何用四维矢量来解决狭义相对论问题（基础的时空与碰撞的变换）.md',
    fallbackDate: '2025-07-24',
    fallbackSlug: 'STR-Four-Vector-Basic-Transformation',
    fallbackTitle: '如何用四维矢量来解决狭义相对论问题（基础的时空与碰撞的变换）',
  },
  {
    filename: '如何用四维矢量来解决狭义相对论问题（电磁学与动力学）.md',
    fallbackDate: '2025-10-06',
    fallbackSlug: 'STR-Four-Vector-Electromagnetism-and-Dynamics',
    fallbackTitle: '如何用四维矢量来解决狭义相对论问题（电磁学与动力学）',
  },
] as const

function quoteYamlString(value: string) {
  return JSON.stringify(value)
}

function toFrontmatter(record: ImportedArticleRecord, body: string) {
  const lines = [
    '---',
    `title: ${quoteYamlString(record.title)}`,
    `slug: ${quoteYamlString(record.slug)}`,
    `type: ${record.type}`,
  ]

  if (record.date)
    lines.push(`date: ${quoteYamlString(record.date)}`)
  if (record.summary)
    lines.push(`summary: ${quoteYamlString(record.summary)}`)
  if (record.draft)
    lines.push('draft: true')
  if (record.tags?.length) {
    lines.push('tags:')
    for (const tag of record.tags)
      lines.push(`  - ${quoteYamlString(tag)}`)
  }

  lines.push('---', '', body.trim(), '')
  return lines.join('\n')
}

async function loadXlogMapping(path: string) {
  if (!await fs.pathExists(path))
    return {} as Record<string, XlogMappingEntry>

  return JSON.parse(await readFile(path, 'utf8')) as Record<string, XlogMappingEntry>
}

function matchXlogEntry(title: string, mapping: Record<string, XlogMappingEntry>): MatchedXlogEntry | null {
  const candidates = new Set([
    title.trim(),
    `《${title.trim()}》读书笔记`,
  ])

  for (const [slug, entry] of Object.entries(mapping)) {
    const entryTitle = entry.title?.trim()
    if (entryTitle && candidates.has(entryTitle))
      return { slug, entry }
  }

  return null
}

function extractWereadBookTitle(body: string, fallbackTitle: string) {
  for (const line of body.split(/\r?\n/)) {
    if (line.startsWith('> [!abstract]'))
      return line.replace('> [!abstract]', '').trim() || fallbackTitle
  }

  return fallbackTitle
}

function extractWereadSummary(body: string) {
  const lines = body.split(/\r?\n/)
  const start = lines.findIndex(line => line.startsWith('> - 简介：'))
  if (start < 0)
    return undefined

  const summaryLines: string[] = []

  for (let index = start; index < lines.length; index++) {
    const line = lines[index]

    if (index === start) {
      const first = line.replace(/^> - 简介：\s*/, '').trim()
      if (first)
        summaryLines.push(first)
      continue
    }

    if (!line.startsWith('> '))
      break
    if (/^> - [^：]+：/.test(line))
      break

    const next = line.replace(/^>\s?/, '').trim()
    if (next)
      summaryLines.push(next)
  }

  const summary = summaryLines.join(' ').trim()
  return summary || undefined
}

function stripMarkdownImageSizeSyntax(body: string) {
  return body.replace(/!\[([^\]]*?)\|(\d+(?:x\d+)?)\]\(([^)]+)\)/g, '![$1]($3)')
}

function normalizeMarkdownWhitespace(body: string) {
  return body
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .split(/\r?\n/)
    .map(line => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

function sanitizeSummary(summary: string | undefined) {
  return summary
    ?.replace(/\s+/g, ' ')
    .trim()
    || undefined
}

function extractPostSummary(body: string) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith('>') || paragraph.startsWith('#') || paragraph.startsWith('$$') || paragraph.startsWith('!['))
      continue

    const plainText = paragraph
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`>#]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (plainText)
      return plainText
  }

  return undefined
}

function resolveAssetUrl(slug: string, assetName: string) {
  return `/article-assets/${slug}/${encodeURIComponent(assetName)}`
}

function rewriteObsidianEmbeds(body: string, slug: string, availableAssets: Set<string>) {
  return body
    .replace(/!\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g, (_matched, assetName: string) => {
      const trimmed = assetName.trim()
      if (!availableAssets.has(trimmed))
        return trimmed
      return `![${trimmed}](${resolveAssetUrl(slug, trimmed)})`
    })
    .replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (_matched, target: string, label?: string) => {
      const trimmed = target.trim()
      if (!availableAssets.has(trimmed))
        return label?.trim() || trimmed
      const text = label?.trim() || trimmed
      return `[${text}](${resolveAssetUrl(slug, trimmed)})`
    })
}

function rewriteLegacyPostLinks(body: string) {
  return body.replace(
    /https:\/\/pi-dal\.com\/posts\/STR-Four-Vector\b/g,
    '/posts/STR-Four-Vector-Basic-Transformation',
  )
}

async function copyAssets(assetNames: Iterable<string>, sourceDir: string, publicDir: string, slug: string) {
  const copiedAssets: string[] = []
  const targetDir = join(publicDir, 'article-assets', slug)

  for (const assetName of assetNames) {
    const sourcePath = join(sourceDir, assetName)
    if (!await fs.pathExists(sourcePath))
      continue

    await fs.ensureDir(targetDir)
    await fs.copy(sourcePath, join(targetDir, assetName))
    copiedAssets.push(`${slug}/${assetName}`)
  }

  return copiedAssets
}

function getReferencedAssets(body: string) {
  const assets = new Set<string>()
  const matches = body.matchAll(/!\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g)

  for (const match of matches) {
    const assetName = match[1]?.trim()
    if (assetName)
      assets.add(assetName)
  }

  return assets
}

async function importWereadNotes(
  wereadDir: string,
  outputDir: string,
  mapping: Record<string, XlogMappingEntry>,
) {
  const importedBooks: string[] = []
  const targetDir = join(outputDir, 'pages/books')

  if (!await fs.pathExists(wereadDir))
    return importedBooks

  await fs.ensureDir(targetDir)

  const markdownFiles = (await fs.readdir(wereadDir))
    .filter(name => extname(name) === '.md')
    .sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'))

  for (const filename of markdownFiles) {
    const sourcePath = join(wereadDir, filename)
    const raw = await readFile(sourcePath, 'utf8')
    const parsed = matter(raw)
    const rawTitle = extractWereadBookTitle(parsed.content, basename(filename, '.md'))
    const matched = matchXlogEntry(rawTitle, mapping)
    const title = matched?.entry.title?.trim() || `《${rawTitle}》读书笔记`
    const slug = matched?.slug || slugify(rawTitle)
    const date = matched?.entry.date || String(parsed.data.finishedDate || parsed.data.lastReadDate || parsed.data.readingDate || '')
    const summary = sanitizeSummary(extractWereadSummary(parsed.content))
    const body = normalizeMarkdownWhitespace(stripMarkdownImageSizeSyntax(parsed.content))

    const record: ImportedArticleRecord = {
      title,
      slug,
      date: date || undefined,
      summary,
      tags: [],
      type: 'book',
    }

    await fs.outputFile(join(targetDir, `${slug}.md`), toFrontmatter(record, body))
    importedBooks.push(slug)
  }

  return importedBooks
}

async function importFourVectorPosts(
  personalDir: string,
  outputDir: string,
  publicDir: string,
  mapping: Record<string, XlogMappingEntry>,
) {
  const importedPosts: string[] = []
  const copiedAssets: string[] = []
  const targetDir = join(outputDir, 'pages/posts')

  await fs.ensureDir(targetDir)

  for (const post of FOUR_VECTOR_POSTS) {
    const sourcePath = join(personalDir, post.filename)
    if (!await fs.pathExists(sourcePath))
      continue

    const raw = await readFile(sourcePath, 'utf8')
    const bodyAssets = getReferencedAssets(raw)
    const assetNames = new Set([...bodyAssets].filter(assetName => fs.existsSync(join(personalDir, assetName))))
    const matched = matchXlogEntry(post.fallbackTitle, mapping)
    const title = matched?.entry.title?.trim() || post.fallbackTitle
    const slug = matched?.slug || post.fallbackSlug
    const date = matched?.entry.date || post.fallbackDate
    const summary = sanitizeSummary(extractPostSummary(raw))
    const body = normalizeMarkdownWhitespace(rewriteLegacyPostLinks(rewriteObsidianEmbeds(raw, slug, assetNames)))

    const record: ImportedArticleRecord = {
      title,
      slug,
      date,
      summary,
      tags: [],
      type: 'post',
    }

    await fs.outputFile(join(targetDir, `${slug}.md`), toFrontmatter(record, body))
    importedPosts.push(slug)
    copiedAssets.push(...await copyAssets(assetNames, personalDir, publicDir, slug))
  }

  return {
    copiedAssets,
    importedPosts,
  }
}

export async function importPersonalContent(options: ImportPersonalContentOptions = {}): Promise<ImportPersonalContentResult> {
  const rootDir = resolve(options.outputDir || process.cwd())
  const publicDir = resolve(options.publicDir || join(rootDir, 'public'))
  const personalDir = resolve(options.personalDir || '/Users/pi-dal/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal')
  const xlogMappingPath = resolve(options.xlogMappingPath || join(rootDir, 'public/og/xlog-mapping.json'))
  const wereadDir = join(personalDir, 'WeRead')
  const mapping = await loadXlogMapping(xlogMappingPath)

  await fs.ensureDir(join(rootDir, 'pages/books'))
  await fs.ensureDir(join(rootDir, 'pages/posts'))
  await fs.ensureDir(join(publicDir, 'article-assets'))

  const importedBooks = await importWereadNotes(wereadDir, rootDir, mapping)
  const importedPostResult = await importFourVectorPosts(personalDir, rootDir, publicDir, mapping)

  return {
    importedBooks,
    importedPosts: importedPostResult.importedPosts,
    copiedAssets: importedPostResult.copiedAssets,
  }
}

async function run() {
  const result = await importPersonalContent()
  console.log(`Imported books: ${result.importedBooks.length}`)
  console.log(`Imported posts: ${result.importedPosts.length}`)
  console.log(`Copied assets: ${result.copiedAssets.length}`)
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : ''
const currentPath = fileURLToPath(import.meta.url)

if (entryPath && currentPath === entryPath)
  void run()
