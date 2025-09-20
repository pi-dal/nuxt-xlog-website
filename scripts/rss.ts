import type { FeedOptions, Item } from 'feed'
import type { XLogPost, XLogSite } from '../src/types'
import { dirname } from 'node:path'
import { Feed } from 'feed'
import fs from 'fs-extra'
import MarkdownIt from 'markdown-it'
import { buildAbsoluteUrl, resolveAuthorHandle, resolveSiteUrl } from '../src/logics/site-meta'
import { getAllPostsDirect, getBooksDirect, getSiteInfoDirect } from '../src/logics/xlog-direct'

interface FeedAuthor {
  name: string
  link: string
  email?: string
}

interface FeedContext {
  domain: string
  author: FeedAuthor
  site: XLogSite
}

const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

async function run() {
  console.log('🚀 Starting RSS generation...')

  const siteInfo = await getSiteInfoDirect()
  if (!siteInfo) {
    console.error('❌ Failed to get site info')
    return
  }

  const context = createFeedContext(siteInfo)
  console.log(`📝 Generating RSS for site: ${context.author.name} (${context.domain})`)

  await buildAllPostsRSS(context)
  await buildBlogPostsRSS(context)
  await buildReadingNotesRSS(context)

  console.log('✅ RSS generation completed!')
}

function createFeedContext(siteInfo: XLogSite): FeedContext {
  const domain = resolveSiteUrl(siteInfo, siteInfo.subdomain)
  const authorHandle = resolveAuthorHandle(siteInfo)
  const authorEmail = process.env.AUTHOR_EMAIL?.trim()

  const author: FeedAuthor = {
    name: siteInfo.name || authorHandle,
    link: domain,
    ...(authorEmail ? { email: authorEmail } : {}),
  }

  return {
    domain,
    author,
    site: siteInfo,
  }
}

async function buildAllPostsRSS(context: FeedContext) {
  console.log('📚 Building all posts RSS...')

  try {
    const [blogPosts, readingNotes] = await Promise.all([
      getAllPostsDirect(),
      getBooksDirect(),
    ])

    const allPosts = [...blogPosts, ...readingNotes]
    console.log(`📝 Found ${blogPosts.length} blog posts and ${readingNotes.length} reading notes`)

    if (allPosts.length === 0)
      console.warn('⚠️  No posts found! RSS will be empty.')

    const options: FeedOptions = {
      title: context.site.name || context.author.name,
      description: `${context.author.name}'s Blog & Reading Notes`,
      id: buildAbsoluteUrl(context.domain, '/'),
      link: buildAbsoluteUrl(context.domain, '/'),
      copyright: `CC BY-NC-SA 4.0 ${new Date().getFullYear()} © ${context.author.name}`,
      feedLinks: {
        rss: buildAbsoluteUrl(context.domain, '/feed.xml'),
      },
    }

    const items = await convertXLogPostsToFeedItems(allPosts, context)
    console.log(`🔄 Converted ${items.length} posts to feed items`)

    await writeFeed('feed', options, items, context)
  }
  catch (error) {
    console.error('❌ Error building all posts RSS:', error)
    console.error('Stack trace:', (error as Error).stack)
  }
}

async function buildBlogPostsRSS(context: FeedContext) {
  console.log('📝 Building blog posts RSS...')

  try {
    const posts = await getAllPostsDirect()
    console.log(`📝 Found ${posts.length} blog posts`)

    if (posts.length === 0)
      console.warn('⚠️  No blog posts found! RSS will be empty.')

    const options: FeedOptions = {
      title: `${context.author.name} - Blog Posts`,
      description: `${context.author.name}'s Blog Posts`,
      id: buildAbsoluteUrl(context.domain, '/posts/'),
      link: buildAbsoluteUrl(context.domain, '/posts/'),
      copyright: `CC BY-NC-SA 4.0 ${new Date().getFullYear()} © ${context.author.name}`,
      feedLinks: {
        rss: buildAbsoluteUrl(context.domain, '/blog-feed.xml'),
      },
    }

    const items = await convertXLogPostsToFeedItems(posts, context)
    console.log(`🔄 Converted ${items.length} blog posts to feed items`)

    await writeFeed('blog-feed', options, items, context)
  }
  catch (error) {
    console.error('❌ Error building blog posts RSS:', error)
    console.error('Stack trace:', (error as Error).stack)
  }
}

async function buildReadingNotesRSS(context: FeedContext) {
  console.log('📖 Building reading notes RSS...')

  try {
    const posts = await getBooksDirect()
    console.log(`📖 Found ${posts.length} reading notes`)

    if (posts.length === 0)
      console.warn('⚠️  No reading notes found! RSS will be empty.')

    const options: FeedOptions = {
      title: `${context.author.name} - Reading Notes`,
      description: `${context.author.name}'s Reading Notes`,
      id: buildAbsoluteUrl(context.domain, '/books/'),
      link: buildAbsoluteUrl(context.domain, '/books/'),
      copyright: `CC BY-NC-SA 4.0 ${new Date().getFullYear()} © ${context.author.name}`,
      feedLinks: {
        rss: buildAbsoluteUrl(context.domain, '/books-feed.xml'),
      },
    }

    const items = await convertXLogPostsToFeedItems(posts, context)
    console.log(`🔄 Converted ${items.length} reading notes to feed items`)

    await writeFeed('books-feed', options, items, context)
  }
  catch (error) {
    console.error('❌ Error building reading notes RSS:', error)
    console.error('Stack trace:', (error as Error).stack)
  }
}

async function convertXLogPostsToFeedItems(posts: XLogPost[], context: FeedContext): Promise<Item[]> {
  const items: Item[] = []

  for (const post of posts) {
    try {
      const content = post.content || ''

      const html = markdown.render(content)
        .replace(/src="\/([^"]+)"/g, `src="${context.domain}/$1`)
        .replace(/href="\/([^"]+)"/g, `href="${context.domain}/$1`)

      let image = post.cover || ''
      if (image && !image.startsWith('http'))
        image = image.startsWith('/') ? `${context.domain}${image}` : `${context.domain}/${image}`

      const isBookReview = post.tags?.includes('微信读书')
      const isPost = post.tags?.includes('post')

      let postUrl: string
      if (isBookReview)
        postUrl = buildAbsoluteUrl(context.domain, `/books/${post.slug}`)
      else if (isPost)
        postUrl = buildAbsoluteUrl(context.domain, `/posts/${post.slug}`)
      else
        postUrl = buildAbsoluteUrl(context.domain, `/posts/${post.slug}`)

      const item: Item = {
        title: post.title || 'Untitled',
        id: post.id || postUrl,
        link: postUrl,
        description: post.excerpt || post.content?.substring(0, 200) || '',
        content: html,
        author: [context.author],
        date: new Date(post.date_published || post.date_updated || new Date()),
        image: image || undefined,
      }

      items.push(item)
    }
    catch (error) {
      console.warn(`⚠️ Error processing post: ${post.title}`, error)
    }
  }

  items.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())

  return items
}

async function writeFeed(name: string, options: FeedOptions, items: Item[], context: FeedContext) {
  options.author = context.author
  options.image = context.site.avatar || buildAbsoluteUrl(context.domain, '/avatar.webp')
  options.favicon = buildAbsoluteUrl(context.domain, '/favicon.ico')

  const feed = new Feed(options)
  items.forEach(item => feed.addItem(item))

  await fs.ensureDir(dirname(`./dist/${name}`))
  await fs.writeFile(`./dist/${name}.xml`, feed.rss2(), 'utf-8')
  console.log(`📝 Generated RSS file: ${name}.xml`)

  if (name === 'feed') {
    await fs.ensureDir('./dist/zh')
    await fs.writeFile('./dist/zh/index.xml', feed.rss2(), 'utf-8')
    console.log('📝 Generated compatibility RSS file: zh/index.xml')
  }
}

run()
