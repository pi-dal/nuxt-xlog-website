import type { FeedOptions, Item } from 'feed'
import { dirname } from 'node:path'
import { Feed } from 'feed'
import fs from 'fs-extra'
import { loadMarkdownContentEntries } from '~/content/files'
import { collectCanonicalUrls } from '~/logics/agent-readiness-build'
import { siteConfig } from '~/site/config'

const AUTHOR = {
  name: siteConfig.author.name,
  link: siteConfig.url,
}
const contentRootDir = process.env.CONTENT_ROOT_DIR || process.cwd()
const distDir = process.env.PUBLISH_DIST_DIR || './dist'

function createFeedOptions(title: string, description: string, path: string, feedPath: string): FeedOptions {
  return {
    title,
    description,
    id: `${siteConfig.url}${path}`,
    link: `${siteConfig.url}${path}`,
    copyright: `CC BY-NC-SA 4.0 ${new Date().getFullYear()} © ${siteConfig.author.name}`,
    feedLinks: {
      rss: `${siteConfig.url}${feedPath}`,
    },
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

async function loadFeedItems(patterns: string[], lang?: string): Promise<Item[]> {
  const entries = await loadMarkdownContentEntries({
    baseUrl: siteConfig.url,
    patterns,
    rootDir: contentRootDir,
  })

  return entries
    .filter(entry => !entry.filePath.endsWith('/index.md'))
    .filter(entry => !lang || entry.frontmatter.lang === lang)
    .map(entry => ({
      title: entry.frontmatter.title,
      id: entry.url,
      link: entry.url,
      description: entry.frontmatter.summary || '',
      content: entry.html,
      author: [AUTHOR],
      date: new Date(entry.frontmatter.date || new Date()),
      image: entry.frontmatter.image,
    }))
    .sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0))
}

async function writeSitemap(urls: string[]) {
  const uniqueUrls = [...new Set(urls)]
  const content = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniqueUrls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n')

  await fs.ensureDir(distDir)
  await fs.writeFile(`${distDir}/sitemap.xml`, content, 'utf-8')
}

async function writeFeed(name: string, options: FeedOptions, items: Item[]) {
  const feed = new Feed({
    ...options,
    author: AUTHOR,
    image: `${siteConfig.url}${siteConfig.avatar}`,
    favicon: `${siteConfig.url}/favicon.png`,
  })

  items.forEach(item => feed.addItem(item))

  await fs.ensureDir(dirname(`${distDir}/${name}.xml`))
  await fs.writeFile(`${distDir}/${name}.xml`, feed.rss2(), 'utf-8')
  await fs.writeFile(`${distDir}/${name}.atom`, feed.atom1(), 'utf-8')
  await fs.writeFile(`${distDir}/${name}.json`, feed.json1(), 'utf-8')
}

export async function buildFeeds() {
  // Original content feeds (Chinese originals only, no locale duplicates)
  const chPostPatterns = ['pages/posts/*.md', 'pages/posts/*.vue']
  // All locale patterns for language-specific feeds
  const localePatterns = ['pages/posts/*.md', 'pages/posts/*.vue', 'pages/en/posts/*.md', 'pages/en/posts/*.vue', 'pages/ja/posts/*.md', 'pages/ja/posts/*.vue']

  const [chPostItems, bookItems] = await Promise.all([
    loadFeedItems(chPostPatterns),
    loadFeedItems(['pages/books/*.md']),
  ])
  const allItems = [...chPostItems, ...bookItems]
    .sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0))

  // Language-specific feeds (from all locale patterns, filtered by lang)
  const [zhPostItems, enPostItems, jaPostItems] = await Promise.all([
    loadFeedItems(localePatterns, 'zh'),
    loadFeedItems(localePatterns, 'en'),
    loadFeedItems(localePatterns, 'ja'),
  ])

  // Combined feeds (original Chinese content only)
  await writeFeed(
    'feed',
    createFeedOptions(siteConfig.title, `${siteConfig.author.name}'s blog and reading notes`, '/', '/feed.xml'),
    allItems,
  )
  await writeFeed(
    'blog-feed',
    createFeedOptions(`${siteConfig.author.name} - Blog Posts`, `${siteConfig.author.name}'s blog posts`, '/posts/', '/blog-feed.xml'),
    chPostItems,
  )
  await writeFeed(
    'books-feed',
    createFeedOptions(`${siteConfig.author.name} - Reading Notes`, `${siteConfig.author.name}'s reading notes`, '/books/', '/books-feed.xml'),
    bookItems,
  )

  // Language-specific RSS feeds
  await writeFeed(
    'zh/feed',
    createFeedOptions(`${siteConfig.author.name} - 中文文章`, 'pi-dal 的中文博客文章', '/zh/posts/', '/zh/feed.xml'),
    zhPostItems,
  )
  await writeFeed(
    'en/feed',
    createFeedOptions(`${siteConfig.author.name} - English Posts`, 'English blog posts from pi-dal', '/en/posts/', '/en/feed.xml'),
    enPostItems,
  )
  await writeFeed(
    'ja/feed',
    createFeedOptions(`${siteConfig.author.name} - 日本語記事`, 'pi-dal の日本語ブログ記事', '/ja/posts/', '/ja/feed.xml'),
    jaPostItems,
  )

  const canonicalUrls = await collectCanonicalUrls(siteConfig.url, {
    rootDir: contentRootDir,
  })

  await writeSitemap(canonicalUrls)
}

async function run() {
  console.log('🚀 Starting RSS generation...')
  await buildFeeds()
  console.log('✅ RSS generation completed!')
}

void run()
