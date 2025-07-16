import type { FeedOptions, Item } from 'feed'
import type { XLogPost } from '../src/types'
import { dirname } from 'node:path'
import { Feed } from 'feed'
import fs from 'fs-extra'
import MarkdownIt from 'markdown-it'
import { getAllPostsDirect, getBooksDirect, getSiteInfoDirect } from '../src/logics/xlog-direct'

const DOMAIN = 'https://pi-dal.com'
const AUTHOR = {
  name: 'pi-dal',
  email: 'pi-dal@connect.hku.hk',
  link: DOMAIN,
}
const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

async function run() {
  console.log('🚀 Starting RSS generation...')

  // 获取站点信息
  const siteInfo = await getSiteInfoDirect()
  if (!siteInfo) {
    console.error('❌ Failed to get site info')
    return
  }

  console.log(`📝 Generating RSS for site: ${siteInfo.name}`)

  // 生成主要的RSS feeds
  await buildAllPostsRSS()
  await buildBlogPostsRSS()
  await buildReadingNotesRSS()

  console.log('✅ RSS generation completed!')
}

/**
 * 生成包含所有内容的RSS (Blog Posts + Reading Notes)
 */
async function buildAllPostsRSS() {
  console.log('📚 Building all posts RSS...')

  try {
    console.log('🔍 Fetching blog posts and reading notes...')
    const [blogPosts, readingNotes] = await Promise.all([
      getAllPostsDirect(),
      getBooksDirect(),
    ])

    console.log(`📝 Found ${blogPosts.length} blog posts`)
    console.log(`📖 Found ${readingNotes.length} reading notes`)

    // 合并所有文章
    const allPosts = [...blogPosts, ...readingNotes]
    console.log(`📄 Total posts: ${allPosts.length}`)

    if (allPosts.length === 0) {
      console.warn('⚠️  No posts found! RSS will be empty.')
    }

    const options = {
      title: 'pi-dal',
      description: 'pi-dal\'s Blog & Reading Notes',
      id: 'https://pi-dal.com/',
      link: 'https://pi-dal.com/',
      copyright: 'CC BY-NC-SA 4.0 2020 © pi-dal',
      feedLinks: {
        rss: 'https://pi-dal.com/feed.xml',
      },
    }

    const items = await convertXLogPostsToFeedItems(allPosts)
    console.log(`🔄 Converted ${items.length} posts to feed items`)

    await writeFeed('feed', options, items)

    console.log(`✅ All posts RSS generated: ${items.length} items`)
  }
  catch (error) {
    console.error('❌ Error building all posts RSS:', error)
    console.error('Stack trace:', error.stack)
  }
}

/**
 * 生成Blog Posts RSS
 */
async function buildBlogPostsRSS() {
  console.log('📝 Building blog posts RSS...')

  try {
    console.log('🔍 Fetching blog posts...')
    const posts = await getAllPostsDirect()
    console.log(`📝 Found ${posts.length} blog posts`)

    if (posts.length === 0) {
      console.warn('⚠️  No blog posts found! RSS will be empty.')
    }

    const options = {
      title: 'pi-dal - Blog Posts',
      description: 'pi-dal\'s Blog Posts',
      id: 'https://pi-dal.com/blog/',
      link: 'https://pi-dal.com/blog/',
      copyright: 'CC BY-NC-SA 4.0 2020 © pi-dal',
      feedLinks: {
        rss: 'https://pi-dal.com/blog-feed.xml',
      },
    }

    const items = await convertXLogPostsToFeedItems(posts)
    console.log(`🔄 Converted ${items.length} blog posts to feed items`)

    await writeFeed('blog-feed', options, items)

    console.log(`✅ Blog posts RSS generated: ${items.length} items`)
  }
  catch (error) {
    console.error('❌ Error building blog posts RSS:', error)
    console.error('Stack trace:', error.stack)
  }
}

/**
 * 生成Reading Notes RSS
 */
async function buildReadingNotesRSS() {
  console.log('📖 Building reading notes RSS...')

  try {
    console.log('🔍 Fetching reading notes...')
    const posts = await getBooksDirect()
    console.log(`📖 Found ${posts.length} reading notes`)

    if (posts.length === 0) {
      console.warn('⚠️  No reading notes found! RSS will be empty.')
    }

    const options = {
      title: 'pi-dal - Reading Notes',
      description: 'pi-dal\'s Reading Notes',
      id: 'https://pi-dal.com/books/',
      link: 'https://pi-dal.com/books/',
      copyright: 'CC BY-NC-SA 4.0 2020 © pi-dal',
      feedLinks: {
        rss: 'https://pi-dal.com/books-feed.xml',
      },
    }

    const items = await convertXLogPostsToFeedItems(posts)
    console.log(`🔄 Converted ${items.length} reading notes to feed items`)

    await writeFeed('books-feed', options, items)

    console.log(`✅ Reading notes RSS generated: ${items.length} items`)
  }
  catch (error) {
    console.error('❌ Error building reading notes RSS:', error)
    console.error('Stack trace:', error.stack)
  }
}

/**
 * 将xLog Posts转换为Feed Items
 */
async function convertXLogPostsToFeedItems(posts: XLogPost[]): Promise<Item[]> {
  const items: Item[] = []

  for (const post of posts) {
    try {
      // 渲染markdown内容
      const content = post.content || ''

      // 使用markdown渲染器处理内容
      const html = markdown.render(content)
        .replace(/src="\/([^"]+)"/g, `src="${DOMAIN}/$1`)
        .replace(/href="\/([^"]+)"/g, `href="${DOMAIN}/$1`)

      // 处理封面图片
      let image = post.cover || ''
      if (image && !image.startsWith('http')) {
        image = image.startsWith('/') ? DOMAIN + image : `${DOMAIN}/${image}`
      }

      // 根据内容类型生成不同的URL
      const isBookReview = post.tags?.includes('微信读书')
      const isPost = post.tags?.includes('post')

      let postUrl: string
      if (isBookReview) {
        postUrl = `${DOMAIN}/books/${post.slug}`
      }
      else if (isPost) {
        postUrl = `${DOMAIN}/posts/${post.slug}`
      }
      else {
        postUrl = `${DOMAIN}/blog/${post.slug}`
      }

      // 创建feed item
      const item: Item = {
        title: post.title || 'Untitled',
        id: post.id || postUrl,
        link: postUrl,
        description: post.excerpt || post.content?.substring(0, 200) || '',
        content: html,
        author: [AUTHOR],
        date: new Date(post.date_published || post.date_updated || new Date()),
        image: image || undefined,
      }

      items.push(item)
    }
    catch (error) {
      console.warn(`⚠️ Error processing post: ${post.title}`, error)
    }
  }

  // 按日期排序
  items.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())

  return items
}

async function writeFeed(name: string, options: FeedOptions, items: Item[]) {
  options.author = AUTHOR
  options.image = 'https://pi-dal.com/avatar.webp'
  options.favicon = 'https://pi-dal.com/favicon.ico'

  const feed = new Feed(options)

  items.forEach(item => feed.addItem(item))

  await fs.ensureDir(dirname(`./dist/${name}`))

  // 只生成RSS XML格式
  await fs.writeFile(`./dist/${name}.xml`, feed.rss2(), 'utf-8')
  console.log(`📝 Generated RSS file: ${name}.xml`)

  // Generate zh/index.xml to maintain compatibility with the former setup (only for main feed)
  if (name === 'feed') {
    await fs.ensureDir('./dist/zh')
    await fs.writeFile('./dist/zh/index.xml', feed.rss2(), 'utf-8')
    console.log(`📝 Generated compatibility RSS file: zh/index.xml`)
  }
}

run()
