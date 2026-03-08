import type { FeedOptions, Item } from 'feed'
import { dirname } from 'node:path'
import { Feed } from 'feed'
import fs from 'fs-extra'
import { loadMarkdownContentEntries } from '~/content/files'
import { siteConfig } from '~/site/config'

const AUTHOR = {
  name: siteConfig.author.name,
  link: siteConfig.url,
}

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

async function loadFeedItems(patterns: string[]): Promise<Item[]> {
  const entries = await loadMarkdownContentEntries({
    baseUrl: siteConfig.url,
    patterns,
  })

  return entries
    .filter(entry => !entry.filePath.endsWith('/index.md'))
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

async function writeFeed(name: string, options: FeedOptions, items: Item[]) {
  const feed = new Feed({
    ...options,
    author: AUTHOR,
    image: `${siteConfig.url}${siteConfig.avatar}`,
    favicon: `${siteConfig.url}/favicon.png`,
  })

  items.forEach(item => feed.addItem(item))

  await fs.ensureDir(dirname(`./dist/${name}.xml`))
  await fs.writeFile(`./dist/${name}.xml`, feed.rss2(), 'utf-8')
  await fs.writeFile(`./dist/${name}.atom`, feed.atom1(), 'utf-8')
  await fs.writeFile(`./dist/${name}.json`, feed.json1(), 'utf-8')
}

export async function buildFeeds() {
  const [postItems, bookItems] = await Promise.all([
    loadFeedItems(['pages/posts/*.md']),
    loadFeedItems(['pages/books/*.md']),
  ])
  const allItems = [...postItems, ...bookItems]
    .sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0))

  await writeFeed(
    'feed',
    createFeedOptions(siteConfig.title, `${siteConfig.author.name}'s blog and reading notes`, '/', '/feed.xml'),
    allItems,
  )
  await writeFeed(
    'blog-feed',
    createFeedOptions(`${siteConfig.author.name} - Blog Posts`, `${siteConfig.author.name}'s blog posts`, '/posts/', '/blog-feed.xml'),
    postItems,
  )
  await writeFeed(
    'books-feed',
    createFeedOptions(`${siteConfig.author.name} - Reading Notes`, `${siteConfig.author.name}'s reading notes`, '/books/', '/books-feed.xml'),
    bookItems,
  )
}

async function run() {
  console.log('🚀 Starting RSS generation...')
  await buildFeeds()
  console.log('✅ RSS generation completed!')
}

void run()
