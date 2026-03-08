import type { ImportedArticleRecord } from '~/types/content'
import { readFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { normalizeContentType } from '~/types/content'

export interface ImportArticlesOptions {
  csvPath?: string
  outputDir?: string
  publicDir?: string
  sourceDir?: string
}

export interface ImportArticlesResult {
  importedDrafts: string[]
  importedPages: string[]
  importedPosts: string[]
  skippedDrafts: string[]
  skippedUntitled: string[]
}

interface CsvRow {
  date?: string
  slug?: string
  status?: string
  summary?: string
  tags?: string
  title?: string
  type?: string
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i++
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function parseCsv(content: string): CsvRow[] {
  const [headerLine, ...rows] = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
  const headers = parseCsvLine(headerLine)

  return rows.map((line) => {
    const values = parseCsvLine(line)
    return headers.reduce<CsvRow>((acc, header, index) => {
      acc[header as keyof CsvRow] = values[index] || ''
      return acc
    }, {})
  })
}

function parseLegacyMarkdown(raw: string) {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/)
  const titleLine = lines[0] || ''
  const title = titleLine.replace(/^#\s+/, '').trim()

  let index = 1
  while (index < lines.length && lines[index] === '')
    index++

  const metadata: Record<string, string> = {}
  while (index < lines.length) {
    const line = lines[index]
    const separatorIndex = line.indexOf(':')
    if (separatorIndex <= 0)
      break

    const key = line.slice(0, separatorIndex).trim()
    if (!/^[a-z_]+$/i.test(key))
      break

    metadata[key] = line.slice(separatorIndex + 1).trim()
    index++
  }

  while (index < lines.length && lines[index] === '')
    index++

  const body = lines.slice(index).join('\n')
  return {
    title,
    metadata,
    body,
  }
}

function normalizeTags(value: string | undefined) {
  return (value || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

function rewriteAssetLinks(slug: string, body: string) {
  return body.replace(/(!?\[[^[\]]*\]\()([^)]+)(\))/g, (_match, prefix, rawPath, suffix) => {
    if (/^(?:https?:)?\/\//i.test(rawPath) || rawPath.startsWith('/'))
      return `${prefix}${rawPath}${suffix}`

    const decodedPath = decodeURIComponent(rawPath)
    const filename = basename(decodedPath)
    return `${prefix}/article-assets/${slug}/${filename}${suffix}`
  })
}

function toFrontmatter(record: ImportedArticleRecord, body: string) {
  const frontmatterLines = [
    '---',
    `title: ${record.title}`,
    `slug: ${record.slug}`,
    `type: ${record.type}`,
  ]

  if (record.date)
    frontmatterLines.push(`date: ${record.date}`)
  if (record.summary)
    frontmatterLines.push(`summary: ${record.summary}`)
  if (record.draft)
    frontmatterLines.push('draft: true')
  if (record.tags?.length) {
    frontmatterLines.push('tags:')
    for (const tag of record.tags)
      frontmatterLines.push(`  - ${tag}`)
  }
  frontmatterLines.push('---', '', body.trim(), '')
  return frontmatterLines.join('\n')
}

async function copyAssetDirectory(slug: string, sourceMarkdownPath: string, publicDir: string) {
  const markdownDir = dirname(sourceMarkdownPath)
  const articleDir = join(markdownDir, basename(sourceMarkdownPath, '.md').replace(/\s+[0-9a-f]{32}$/i, ''))
  if (!await fs.pathExists(articleDir))
    return

  const targetDir = join(publicDir, 'article-assets', slug)
  await fs.ensureDir(targetDir)
  await fs.copy(articleDir, targetDir)
}

function createImportedRecord(row: CsvRow, parsed: ReturnType<typeof parseLegacyMarkdown>): ImportedArticleRecord | null {
  const slug = (row.slug || parsed.metadata.slug || '').trim()
  if (!slug || parsed.title === 'Untitled')
    return null

  return {
    title: row.title?.trim() || parsed.title,
    draft: (row.status || parsed.metadata.status || '').trim().toLowerCase() === 'draft',
    slug,
    date: (row.date || parsed.metadata.date || '').trim() || undefined,
    summary: (row.summary || parsed.metadata.summary || '').trim() || undefined,
    tags: normalizeTags(row.tags || parsed.metadata.tags),
    status: (row.status || parsed.metadata.status || '').trim() || undefined,
    type: normalizeContentType(row.type || parsed.metadata.type || 'post'),
  }
}

export async function importArticles(options: ImportArticlesOptions = {}): Promise<ImportArticlesResult> {
  const rootDir = resolve(options.outputDir || process.cwd())
  const sourceDir = resolve(options.sourceDir || join(process.cwd(), 'Articles', `pi-dal's Blog`))
  const publicDir = resolve(options.publicDir || join(rootDir, 'public'))
  const csvPath = resolve(options.csvPath || join(process.cwd(), 'Articles', `pi-dal's Blog 81bcf076da0a4bd492e85de090c409c9.csv`))

  const csv = parseCsv(await readFile(csvPath, 'utf8'))
  const rowsByTitle = new Map(csv.map(row => [row.title?.trim(), row]))
  const markdownPaths = (await fs.readdir(sourceDir))
    .filter(name => name.endsWith('.md'))
    .map(name => join(sourceDir, name))

  const result: ImportArticlesResult = {
    importedDrafts: [],
    importedPosts: [],
    importedPages: [],
    skippedDrafts: [],
    skippedUntitled: [],
  }

  await fs.ensureDir(join(rootDir, 'pages/posts'))
  await fs.ensureDir(join(rootDir, 'drafts/posts'))
  await fs.ensureDir(join(publicDir, 'article-assets'))

  for (const markdownPath of markdownPaths) {
    const raw = await readFile(markdownPath, 'utf8')
    const parsed = parseLegacyMarkdown(raw)
    const row = rowsByTitle.get(parsed.title) || {}
    const record = createImportedRecord(row, parsed)

    if (!record) {
      result.skippedUntitled.push(markdownPath)
      continue
    }

    const body = rewriteAssetLinks(record.slug, parsed.body)
    const fileContent = toFrontmatter(record, body)

    if (record.type === 'page') {
      if (record.slug === 'about' && await fs.pathExists(join(rootDir, 'pages/index.md')))
        continue
      await fs.outputFile(join(rootDir, 'pages', `${record.slug}.md`), fileContent)
      result.importedPages.push(record.slug)
    }
    else {
      const targetDir = record.draft ? join(rootDir, 'drafts/posts') : join(rootDir, 'pages/posts')
      await fs.outputFile(join(targetDir, `${record.slug}.md`), fileContent)
      if (record.draft)
        result.importedDrafts.push(record.slug)
      else
        result.importedPosts.push(record.slug)
    }

    await copyAssetDirectory(record.slug, markdownPath, publicDir)
  }

  return result
}

async function run() {
  const result = await importArticles()
  console.log(`Imported posts: ${result.importedPosts.length}`)
  console.log(`Imported drafts: ${result.importedDrafts.length}`)
  console.log(`Imported pages: ${result.importedPages.length}`)
  console.log(`Skipped drafts: ${result.skippedDrafts.length}`)
  console.log(`Skipped untitled: ${result.skippedUntitled.length}`)
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : ''
const currentPath = fileURLToPath(import.meta.url)

if (entryPath && currentPath === entryPath)
  void run()
