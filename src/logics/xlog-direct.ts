import type { EnhancedXLogPost, SocialLink, XLogAuthor, XLogComment, XLogPortfolio, XLogPost, XLogSite } from '../types'
import { logger } from './logger'
import { enhancePostsWithMetadata, enhancePostWithMetadata } from './metadata'
import { useSiteInfo } from './useSiteInfo'

// 获取xLog handle配置
function getXLogHandle(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('xlog-handle') || 'pi-dal'
  }
  return process.env.XLOG_HANDLE || 'pi-dal'
}

// xLog GraphQL API endpoint
const XLOG_API_URL = 'https://indexer.crossbell.io/v1/graphql'

// GraphQL 查询：获取站点信息
const GET_SITE_QUERY = `
  query getSite($handle: String!) {
    characters(where: { handle: { equals: $handle } }) {
      characterId
      handle
      primary
      uri
      socialToken
      operator
      owner
      fromAddress
      createdAt
      updatedAt
      deletedAt
      transactionHash
      blockNumber
      logIndex
      updatedTransactionHash
      updatedBlockNumber
      updatedLogIndex
      metadata {
        uri
        content
      }
    }
  }
`

// GraphQL 查询：获取文章列表（简化版）
const GET_POSTS_QUERY = `
  query getPosts($characterId: Int!) {
    notes(
      where: {
        characterId: { equals: $characterId }
        deleted: { equals: false }
      }
      orderBy: [{ createdAt: desc }]
      take: 1000
    ) {
      noteId
      characterId
      createdAt
      updatedAt
      publishedAt
      metadata {
        uri
        content
      }
    }
  }
`

// GraphQL 查询：获取评论
const GET_COMMENTS_QUERY = `
  query getComments($characterId: Int!, $noteId: Int!) {
    notes(
      where: {
        toCharacterId: { equals: $characterId },
        toNoteId: { equals: $noteId },
        metadata: {
          content: {
            path: ["tags"],
            array_contains: ["comment"]
          }
        }
      },
      orderBy: { createdAt: asc },
      take: 100
    ) {
      noteId
      owner
      createdAt
      metadata {
        content
      }
      character {
        handle
        characterId
        metadata {
          content
        }
      }
    }
  }
`

// GraphQL 查询：根据 slug 获取页面
const GET_PAGE_BY_SLUG_QUERY = `
  query getPageBySlug($characterId: Int!, $slug: String!) {
    notes(
      where: {
        characterId: { equals: $characterId },
        deleted: { equals: false },
        metadata: {
          content: {
            path: ["attributes"],
            array_contains: [{
              trait_type: "xlog_slug",
              value: $slug
            }]
          }
        }
      },
      take: 1
    ) {
      noteId
      characterId
      createdAt
      updatedAt
      publishedAt
      metadata {
        uri
        content
      }
    }
  }
`

/**
 * 直接调用 xLog GraphQL API
 */
async function callXLogAPI(query: string, variables: any) {
  try {
    const response = await fetch(XLOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors.map((e: any) => e.message).join(', ')}`)
    }

    return data.data
  }
  catch (error) {
    logger.error('xLog API call failed:', { error }, 'XLOG_API')
    throw error
  }
}

/**
 * 获取站点信息
 */
export async function getSiteInfoDirect(): Promise<XLogSite | null> {
  const handle = getXLogHandle()
  if (!handle)
    return null

  try {
    const data = await callXLogAPI(GET_SITE_QUERY, { handle })
    const characters = data.characters

    if (!characters || characters.length === 0)
      return null

    const character = characters[0] // 取第一个匹配的character
    const content = character.metadata?.content || {}

    const connectedAccounts = content.connected_accounts || []
    const socialLinks: SocialLink[] = connectedAccounts.map((account: string) => {
      // e.g. 'csb://account:handle@platform'
      const match = account.match(/^csb:\/\/account:([^@]+)@(.+)$/)
      if (match) {
        const [, handle, platform] = match
        let url = ''
        switch (platform.toLowerCase()) {
          case 'twitter':
            url = `https://x.com/${handle}`
            break
          case 'github':
            url = `https://github.com/${handle}`
            break
          case 'telegram':
            url = `https://t.me/${handle}`
            break
          case 'bilibili':
            url = `https://space.bilibili.com/${handle}`
            break
          case 'youtube':
            url = `https://www.youtube.com/@${handle}`
            break
          case 'mastodon':
            if (handle.includes('@')) {
              const [user, instance] = handle.split('@')
              url = `https://${instance}/@${user}`
            }
            else {
              url = `https://mas.to/@${handle}`
            }
            break
        }
        if (url) {
          return { platform, url }
        }
      }
      return null
    }).filter(Boolean) as SocialLink[]

    return {
      id: character.characterId?.toString() || '',
      name: content.name || handle,
      subdomain: handle,
      description: content.bio || '',
      bio: content.bio || '',
      avatar: (content.avatars?.[0] || '').replace('ipfs://', 'https://ipfs.crossbell.io/ipfs/'),
      cover: (content.banners?.[0]?.address || '').replace('ipfs://', 'https://ipfs.crossbell.io/ipfs/'),
      navigation: [],
      social_platforms: content.connected_accounts || {},
      social_links: socialLinks,
    }
  }
  catch (error) {
    logger.error('Error fetching site info:', { error, handle }, 'XLOG_SITE')
    return null
  }
}

/**
 * 获取文章列表
 */
export async function getAllEnhancedPostsDirect(): Promise<EnhancedXLogPost[]> {
  const posts = await getAllPostsDirect()
  return await enhancePostsWithMetadata(posts)
}

/**
 * 获取所有博客文章
 */
export async function getAllPostsDirect(): Promise<XLogPost[]> {
  const handle = getXLogHandle()
  if (!handle)
    return []

  try {
    // 使用缓存的siteInfo获取characterId
    const { fetchSiteInfo, getCharacterId } = useSiteInfo()
    await fetchSiteInfo()
    const characterId = getCharacterId()

    if (!characterId) {
      logger.warn('No characterId found for handle:', { handle }, 'XLOG_SITE')
      return []
    }

    logger.debug('Using cached characterId:', { characterId }, 'XLOG_POSTS')

    // 然后用characterId获取文章
    const data = await callXLogAPI(GET_POSTS_QUERY, { characterId })
    const notes = data.notes || []

    logger.debug('Raw notes from API:', { count: notes.length }, 'XLOG_POSTS')

    return notes
      .filter((note: any) => {
        const content = note.metadata?.content || {}
        if (!content.title)
          return false // 必须有标题

        const tags = content.tags || []
        // 只显示同时有 "post" 标签且不含 "portfolio" 和 "微信读书" 标签的文章
        return tags.includes('post') && !tags.includes('portfolio') && !tags.includes('微信读书')
      })
      .map((note: any) => transformNoteToPost(note))
  }
  catch (error) {
    logger.error('Error fetching posts:', { error, handle }, 'XLOG_POSTS')
    return []
  }
}

/**
 * 获取评论列表
 */
export async function getCommentsDirect(characterId: string, noteId: string): Promise<XLogComment[]> {
  if (!characterId || !noteId)
    return []

  try {
    const variables = {
      characterId: Number.parseInt(characterId),
      noteId: Number.parseInt(noteId),
    }
    const data = await callXLogAPI(GET_COMMENTS_QUERY, variables)
    const commentNotes = data.notes || []

    return commentNotes.map((note: any) => transformCommentNoteToComment(note))
  }
  catch (error) {
    logger.error('Error fetching comments:', { error, handle }, 'XLOG_COMMENTS')
    return []
  }
}

/**
 * 根据slug获取单篇文章 (增强版，包含元数据补充)
 */
export async function getEnhancedPostBySlugDirect(slug: string): Promise<EnhancedXLogPost | null> {
  const post = await getPostBySlugDirect(slug)
  if (!post)
    return null
  return await enhancePostWithMetadata(post)
}

/**
 * 根据slug获取单篇文章
 */
export async function getPostBySlugDirect(slug: string): Promise<XLogPost | null> {
  try {
    const handle = getXLogHandle()
    if (!handle)
      return null

    // 使用缓存的siteInfo获取characterId和作者信息
    const { fetchSiteInfo, getCharacterId, siteInfo } = useSiteInfo()
    await fetchSiteInfo()
    const characterId = getCharacterId()

    if (!characterId || !siteInfo.value) {
      logger.warn('No characterId or siteInfo found for handle:', { handle }, 'XLOG_SITE')
      return null
    }

    const author: XLogAuthor = {
      id: siteInfo.value.id,
      username: siteInfo.value.subdomain,
      name: siteInfo.value.name,
      avatar: (siteInfo.value.avatar || '').replace('ipfs://', 'https://ipfs.crossbell.io/ipfs/'),
      bio: siteInfo.value.bio,
    }

    // 直接通过GraphQL查询特定slug的文章，不受getAllPostsDirect的过滤限制
    const data = await callXLogAPI(GET_PAGE_BY_SLUG_QUERY, { characterId, slug })
    const notes = data.notes || []

    if (notes.length === 0) {
      return null
    }

    const post = transformNoteToPost(notes[0])
    post.characterId = characterId.toString() // Attach characterId to the post object
    post.author = author // Attach author info

    return post
  }
  catch (error) {
    logger.error('Error fetching post by slug:', { error, slug }, 'XLOG_POST')
    return null
  }
}

/**
 * 根据ID获取单篇文章
 */
export async function getPostByIdDirect(id: string): Promise<XLogPost | null> {
  try {
    // 先获取所有文章，然后按ID过滤
    const allPosts = await getAllPostsDirect()
    return allPosts.find(post => post.id === id) || null
  }
  catch (error) {
    logger.error('Error fetching post by id:', { error, id }, 'XLOG_POST')
    return null
  }
}

/**
 * 转换 Crossbell Note 到 XLogPost 格式
 */
function transformNoteToPost(note: any): XLogPost {
  const content = note.metadata?.content || {}

  // 从attributes中提取xlog_slug
  const attributes = content.attributes || []
  const xlogSlugAttr = attributes.find((attr: any) => attr.trait_type === 'xlog_slug')
  const xlogSlug = xlogSlugAttr?.value || content.title || note.noteId?.toString() || ''

  return {
    id: note.noteId?.toString() || '',
    title: content.title || 'Untitled',
    content: content.content || '',
    excerpt: content.summary || extractExcerpt(content.content || ''),
    slug: xlogSlug, // 使用xLog的原始slug
    date_published: note.createdAt || note.publishedAt || new Date().toISOString(),
    date_updated: note.updatedAt || note.createdAt || new Date().toISOString(),
    summary: content.summary || '',
    cover: content.cover || '',
    views: 0, // 简化版本暂不获取浏览量
    comments: [], // 先初始化为空数组，稍后填充
    external_urls: content.external_urls || [],
    tags: content.tags || [], // 添加标签字段
  }
}

/**
 * 转换 Crossbell Comment Note 到 XLogComment 格式
 */
function transformCommentNoteToComment(note: any): XLogComment {
  const content = note.metadata?.content || {}
  const authorCharacter = note.character?.metadata?.content || {}

  return {
    id: note.noteId.toString(),
    author: {
      id: note.character?.characterId?.toString() || '',
      username: note.character?.handle || 'anonymous',
      name: authorCharacter.name || note.character?.handle || 'Anonymous',
      avatar: (authorCharacter.avatars?.[0] || '').replace('ipfs://', 'https://ipfs.crossbell.io/ipfs/'),
      bio: authorCharacter.bio || '',
    },
    content: content.content || '',
    date_published: note.createdAt || new Date().toISOString(),
  }
}

/**
 * 从内容中提取摘要
 */
function extractExcerpt(content: string, maxLength: number = 200): string {
  if (!content)
    return ''

  // 移除 markdown 标记
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
    .replace(/[#*`_~]/g, '') // 移除 markdown 符号
    .replace(/\n+/g, ' ') // 换行转空格
    .trim()

  return plainText.length > maxLength
    ? `${plainText.substring(0, maxLength)}...`
    : plainText
}

/**
 * 生成文章 slug
 */
function generateSlug(title: string): string {
  // 对于中文标题，我们使用更简单的方法：直接使用encodeURIComponent或者简化处理
  // 但为了URL友好，我们先尝试转换为拼音或使用文章ID

  // 简单处理：移除特殊字符，保留中文、英文、数字
  const slug = title
    .trim()
    .replace(/[^\w\u4E00-\u9FFF\s-]/g, '') // 保留中文、英文、数字、空格、连字符
    .replace(/\s+/g, '-') // 空格转连字符
    .replace(/-+/g, '-') // 多个连字符合并
    .replace(/^-|-$/g, '') // 移除首尾连字符

  return slug || 'untitled'
}

/**
 * 根据 slug 获取单个页面 (如 about)
 */

export async function getPageBySlugDirect(slug: string): Promise<XLogPost | null> {
  const handle = getXLogHandle()
  if (!handle)
    return null

  try {
    // 使用缓存的siteInfo获取characterId
    const { fetchSiteInfo, getCharacterId } = useSiteInfo()
    await fetchSiteInfo()
    const characterId = getCharacterId()

    if (!characterId) {
      logger.warn('No characterId found for handle:', { handle }, 'XLOG_SITE')
      return null
    }

    const data = await callXLogAPI(GET_PAGE_BY_SLUG_QUERY, { characterId, slug })
    const notes = data.notes || []

    if (notes.length === 0) {
      return null
    }

    return transformNoteToPost(notes[0])
  }
  catch (error) {
    logger.error(`Error fetching page with slug "${slug}":`, { error, slug }, 'XLOG_PAGE')
    return null
  }
}

/**
 * 获取作品集列表 - 查找带有 "portfolio" 标签的 notes
 */
const GET_PORTFOLIOS_QUERY = `
  query getPortfolios($characterId: Int!) {
    notes(
      where: {
        characterId: { equals: $characterId }
        deleted: { equals: false }
      }
      orderBy: [{ createdAt: desc }]
      take: 1000
    ) {
      noteId
      characterId
      createdAt
      updatedAt
      publishedAt
      metadata {
        uri
        content
      }
    }
  }
`

export async function getPortfolioDirect(): Promise<XLogPortfolio[]> {
  const handle = getXLogHandle()
  if (!handle)
    return []

  try {
    // 使用缓存的siteInfo获取characterId
    const { fetchSiteInfo, getCharacterId } = useSiteInfo()
    await fetchSiteInfo()
    const characterId = getCharacterId()

    if (!characterId) {
      logger.warn('No characterId found for handle:', { handle }, 'XLOG_PORTFOLIO')
      return []
    }

    const data = await callXLogAPI(GET_PORTFOLIOS_QUERY, { characterId })
    const notes = data.notes || []

    // 过滤出带有 "portfolio" 标签的文章
    const portfolioNotes = notes.filter((note: any) => {
      const content = note.metadata?.content || {}
      const tags = content.tags || []

      // 检查是否包含 "portfolio" 标签
      return tags.includes('portfolio')
    })

    logger.debug(`Found ${portfolioNotes.length} portfolio item(s) with "portfolio" tag out of ${notes.length} total notes`, { portfolioCount: portfolioNotes.length, totalNotes: notes.length }, 'XLOG_PORTFOLIO')
    return portfolioNotes.map((note: any) => transformNoteToPortfolio(note))
  }
  catch (error) {
    logger.error('Error fetching portfolio:', { error, handle }, 'XLOG_PORTFOLIO')
    return []
  }
}

/**
 * 获取微信读书文章
 */
export async function getBooksDirect(): Promise<XLogPost[]> {
  const handle = getXLogHandle()
  if (!handle)
    return []

  try {
    // 使用缓存的siteInfo获取characterId
    const { fetchSiteInfo, getCharacterId } = useSiteInfo()
    await fetchSiteInfo()
    const characterId = getCharacterId()

    if (!characterId) {
      logger.warn('No characterId found for handle:', { handle }, 'XLOG_BOOKS')
      return []
    }

    const data = await callXLogAPI(GET_POSTS_QUERY, { characterId })
    const notes = data.notes || []

    // 过滤出带有 "微信读书" 标签的文章
    const bookNotes = notes.filter((note: any) => {
      const content = note.metadata?.content || {}
      if (!content.title)
        return false // 必须有标题

      const tags = content.tags || []
      // 检查是否包含 "微信读书" 标签
      return tags.includes('微信读书')
    })

    logger.debug(`Found ${bookNotes.length} book item(s) with "微信读书" tag out of ${notes.length} total notes`, { bookCount: bookNotes.length, totalNotes: notes.length }, 'XLOG_BOOKS')
    return bookNotes.map((note: any) => transformNoteToPost(note))
  }
  catch (error) {
    logger.error('Error fetching books:', { error, handle }, 'XLOG_BOOKS')
    return []
  }
}

/**
 * 转换 Note 到 Portfolio 格式
 */
function transformNoteToPortfolio(note: any): XLogPortfolio {
  const content = note.metadata?.content || {}
  const attributes = content.attributes || []
  const xlogSlugAttr = attributes.find((attr: any) => attr.trait_type === 'xlog_slug')

  // 对于作品集，如果没有自定义 slug，就用 noteId 或生成一个
  const slug = xlogSlugAttr?.value || `portfolio-${note.noteId}` || generateSlug(content.title || 'untitled')

  return {
    id: note.noteId?.toString() || '',
    title: content.title || 'Untitled',
    excerpt: content.summary || extractExcerpt(content.content || ''),
    slug,
    date_published: note.createdAt || note.publishedAt || new Date().toISOString(),
    cover: (content.cover || content.attachments?.[0]?.address || '').replace('ipfs://', 'https://ipfs.crossbell.io/ipfs/'),
    characterId: note.characterId?.toString() || '',
  }
}

/**
 * 根据标签获取文章
 */
export async function getPostsByTagDirect(tag: string): Promise<XLogPost[]> {
  const handle = getXLogHandle()
  if (!handle)
    return []

  try {
    // 使用缓存的siteInfo获取characterId
    const { fetchSiteInfo, getCharacterId } = useSiteInfo()
    await fetchSiteInfo()
    const characterId = getCharacterId()

    if (!characterId) {
      logger.warn('No characterId found for handle:', { handle }, 'XLOG_SITE')
      return []
    }

    logger.debug('Using cached characterId:', { characterId, tag }, 'XLOG_TAGS')

    // 然后用characterId获取文章
    const data = await callXLogAPI(GET_POSTS_QUERY, { characterId })
    const notes = data.notes || []

    logger.debug('Raw notes from API:', { count: notes.length }, 'XLOG_POSTS')

    return notes
      .filter((note: any) => {
        const content = note.metadata?.content || {}
        if (!content.title)
          return false // 必须有标题

        const tags = content.tags || []
        // 检查是否包含指定标签（不区分大小写）
        return tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
      })
      .map((note: any) => transformNoteToPost(note))
  }
  catch (error) {
    logger.error('Error fetching posts by tag:', { error, tag }, 'XLOG_TAGS')
    return []
  }
}

/**
 * 获取 AI 生成的摘要
 */
export async function getAiSummary(characterId: string, noteId: string): Promise<string | null> {
  if (!characterId || !noteId)
    return null

  try {
    const targetUrl = `https://xlog.app/api/ai/summary?characterId=${characterId}&noteId=${noteId}`
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    const response = await fetch(proxyUrl)

    if (!response.ok)
      throw new Error(`Failed to fetch AI summary with status: ${response.status}`)

    const data = await response.json()
    return data.summary || null
  }
  catch (error) {
    logger.warn('Error fetching AI summary:', { error, content }, 'XLOG_AI')
    return null
  }
}
