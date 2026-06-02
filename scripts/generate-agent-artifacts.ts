import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { collectCanonicalRouteEntries } from '~/logics/agent-readiness-build'
import { siteConfig } from '~/site/config'

const rootDir = process.env.CONTENT_ROOT_DIR || process.cwd()
const distDir = process.env.PUBLISH_DIST_DIR || './dist'
const SITE_URL = siteConfig.url.replace(/\/+$/, '')

function sha256(value: string) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

async function generateAgentSkillsIndex() {
  const skillPath = resolve(rootDir, 'public/.well-known/agent-skills/site-navigation.md')
  const content = await fs.readFile(skillPath, 'utf8')

  const payload = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'site-navigation',
        type: 'skill-md',
        description: 'Navigate the pi-dal site and discover machine-readable resources.',
        url: `${SITE_URL}/.well-known/agent-skills/site-navigation.md`,
        digest: sha256(content),
      },
    ],
  }

  const outputPath = resolve(distDir, '.well-known/agent-skills/index.json')
  await fs.ensureDir(resolve(distDir, '.well-known/agent-skills'))
  await fs.writeJson(outputPath, payload, { spaces: 2 })
}

async function generateRouteManifest() {
  const entries = await collectCanonicalRouteEntries({ rootDir })
  const outputPath = resolve(distDir, '.well-known/agent-routes.json')
  await fs.ensureDir(resolve(distDir, '.well-known'))
  await fs.writeJson(outputPath, {
    routes: entries.map(entry => ({
      path: entry.path,
      title: entry.title,
      type: entry.type,
      url: `${SITE_URL}${entry.path === '/' ? '' : entry.path}`,
    })),
  }, { spaces: 2 })
  return entries
}

function categorizeEntry(path: string): 'posts' | 'books' | 'other' {
  if (path.startsWith('/posts/') || path === '/posts')
    return 'posts'
  if (path.startsWith('/books/') || path === '/books')
    return 'books'
  return 'other'
}

async function generateLlmsTxt(entries: Awaited<ReturnType<typeof collectCanonicalRouteEntries>>) {
  const lines: string[] = []

  // H1
  lines.push(`# ${siteConfig.title}`)
  lines.push('')
  // Blockquote summary
  lines.push(`> ${siteConfig.description}`)
  lines.push('')

  // Categorize entries — exclude index/collection pages
  const posts: typeof entries = []
  const books: typeof entries = []
  const pages: typeof entries = []

  for (const entry of entries) {
    // Skip index/collection pages
    if (['/posts', '/books', '/'].includes(entry.path))
      continue

    const cat = categorizeEntry(entry.path)
    if (cat === 'posts')
      posts.push(entry)
    else if (cat === 'books')
      books.push(entry)
    else if (entry.path !== '/' && entry.path !== '/posts' && entry.path !== '/books')
      pages.push(entry)
  }

  // Posts section
  if (posts.length > 0) {
    lines.push('## Posts')
    lines.push('')
    for (const post of posts) {
      const url = `${SITE_URL}${post.path}`
      const title = post.title || post.path.split('/').pop() || 'Untitled'
      const desc = post.description || post.title || 'Blog post'
      lines.push(`- [${title}](${url}): ${desc}.`)
    }
    lines.push('')
  }

  // Books section
  if (books.length > 0) {
    lines.push('## Books')
    lines.push('')
    for (const book of books) {
      const url = `${SITE_URL}${book.path}`
      const title = book.title || book.path.split('/').pop() || 'Untitled'
      const desc = book.description || `Reading notes on ${title}`
      lines.push(`- [${title}](${url}): ${desc}.`)
    }
    lines.push('')
  }

  // Pages section (non-content static pages)
  if (pages.length > 0) {
    lines.push('## Pages')
    lines.push('')
    for (const page of pages) {
      const url = `${SITE_URL}${page.path}`
      const title = page.title || page.path.split('/').pop() || 'Untitled'
      // Skip 404 and other meta pages
      if (title.startsWith('[...'))
        continue
      const desc = page.description || title
      lines.push(`- [${title}](${url}): ${desc}.`)
    }
    lines.push('')
  }

  // Static sections (feeds, well-known resources)
  lines.push('## Feeds and Machine-Readable Resources')
  lines.push('')
  lines.push(`- [Sitemap](${SITE_URL}/sitemap.xml): Full XML sitemap of all pages.`)
  lines.push(`- [Main Feed (RSS)](${SITE_URL}/feed.xml): Combined blog + books feed (RSS).`)
  lines.push(`- [Main Feed (Atom)](${SITE_URL}/feed.atom): Combined blog + books feed (Atom).`)
  lines.push(`- [Main Feed (JSON)](${SITE_URL}/feed.json): Combined blog + books feed (JSON).`)
  lines.push(`- [Blog Feed (RSS)](${SITE_URL}/blog-feed.xml): Blog-only posts feed.`)
  lines.push(`- [Books Feed (RSS)](${SITE_URL}/books-feed.xml): Books-only reading notes feed.`)
  lines.push(`- [Agent Routes](${SITE_URL}/.well-known/agent-routes.json): Machine-readable route manifest for AI agents.`)
  lines.push(`- [Agent Skills Index](${SITE_URL}/.well-known/agent-skills/index.json): Agent skills discovery index.`)
  lines.push(`- [Site Navigation](${SITE_URL}/.well-known/agent-skills/site-navigation.md): Human-readable site navigation guide for AI agents.`)
  lines.push(`- [Robots](${SITE_URL}/robots.txt): Crawler access rules.`)
  lines.push('')

  const outputPath = resolve(distDir, 'llms.txt')
  await fs.writeFile(outputPath, lines.join('\n'), 'utf8')
  console.log(`[llms.txt] Generated with ${posts.length} posts, ${books.length} books, ${pages.length} pages`)
}

async function run() {
  await generateAgentSkillsIndex()
  const entries = await generateRouteManifest()
  await generateLlmsTxt(entries)
}

void run()
