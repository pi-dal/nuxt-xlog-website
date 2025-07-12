import type {
  EnhancedXLogPost,
  RawXLogPost,
  RawXLogSite,
  XLOG_CONSTANTS,
  XLogPaginatedPosts,
  XLogPost,
  XLogSite,
} from '../types'
import { CACHE_TTL, withCache } from './cache'
import { withErrorHandling } from './errors'
import { createContextLogger, perfTracker } from './logger'
import { enhancePostsWithMetadata, enhancePostWithMetadata } from './metadata'

const log = createContextLogger('xlog')

// Get xLog handle configuration
function getXLogHandle(): string {
  // Get from localStorage in client environment
  if (typeof window !== 'undefined') {
    return localStorage.getItem(XLOG_CONSTANTS.STORAGE_KEY) || XLOG_CONSTANTS.DEFAULT_HANDLE
  }
  // Get from environment variables in server environment
  return process.env[XLOG_CONSTANTS.ENV_KEY] || XLOG_CONSTANTS.DEFAULT_HANDLE
}

// Dynamically create xLog client to avoid import errors
async function createClient() {
  try {
    const { Client } = await import('sakuin')
    return new Client()
  }
  catch (error) {
    log.error('Failed to import sakuin client', error)
    return null
  }
}

// Error handling is now handled by ./errors.ts module

/**
 * 获取站点信息
 */
export async function getSiteInfo(): Promise<XLogSite | null> {
  const handle = getXLogHandle()
  if (!handle)
    return null

  return perfTracker.measure('getSiteInfo', () =>
    withCache(
      'getSiteInfo',
      { handle },
      () => withErrorHandling(async () => {
        const client = await createClient()
        if (!client)
          return null

        const site = await client.site.getInfo(handle)
        return transformSiteData(site)
      }, null, 'getSiteInfo', { retries: 2, timeout: 10000 }),
      CACHE_TTL.SITE_INFO,
    ))
}

/**
 * 获取站点统计信息
 */
export async function getSiteStats() {
  const handle = getXLogHandle()
  if (!handle)
    return null

  return withCache(
    'getSiteStats',
    { handle },
    () => withErrorHandling(async () => {
      const client = await createClient()
      if (!client)
        return null

      return await client.site.getStat(handle)
    }, null, 'getSiteStats', { retries: 1, timeout: 8000 }),
    CACHE_TTL.SITE_STATS,
  )
}

/**
 * 获取所有博客文章 (增强版，包含元数据补充)
 */
export async function getAllEnhancedPosts(): Promise<EnhancedXLogPost[]> {
  const posts = await getAllPosts()
  return await enhancePostsWithMetadata(posts)
}

/**
 * 获取所有博客文章
 */
export async function getAllPosts(): Promise<XLogPost[]> {
  const handle = getXLogHandle()
  if (!handle)
    return []

  return perfTracker.measure('getAllPosts', () =>
    withCache(
      'getAllPosts',
      { handle },
      () => withErrorHandling(async () => {
        const client = await createClient()
        if (!client)
          return []

        const posts = await client.post.getAll(handle)
        return transformPostsData(posts)
      }, [], 'getAllPosts', { retries: 2, timeout: 15000 }),
      CACHE_TTL.POSTS,
    ))
}

/**
 * 分页获取博客文章
 */
export async function getPosts(cursor?: string, limit: number = XLOG_CONSTANTS.DEFAULT_LIMIT): Promise<XLogPaginatedPosts> {
  const handle = getXLogHandle()
  const fallback = { posts: [], total: 0, hasMore: false }
  if (!handle)
    return fallback

  return withErrorHandling(async () => {
    const client = await createClient()
    if (!client)
      return fallback

    const result = await client.post.getMany(handle, {
      cursor: cursor || undefined,
      limit,
    })
    // sakuin SDK 返回的是数组，我们需要适配
    const posts = Array.isArray(result) ? result : []
    return {
      posts: transformPostsData(posts),
      total: posts.length,
      hasMore: posts.length === limit,
      cursor: posts.length > 0 ? posts[posts.length - 1]?.id : undefined,
    }
  }, fallback, 'getPosts', { retries: 1, timeout: 10000 })
}

/**
 * 根据slug获取单篇文章 (增强版，包含元数据补充)
 */
export async function getEnhancedPostBySlug(slug: string): Promise<EnhancedXLogPost | null> {
  const post = await getPostBySlug(slug)
  if (!post)
    return null
  return await enhancePostWithMetadata(post)
}

/**
 * 根据标签获取文章
 */
export async function getPostsByTag(tag: string): Promise<XLogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter(post =>
    post.tags && post.tags.some(t =>
      t.toLowerCase() === tag.toLowerCase(),
    ),
  )
}

/**
 * 根据标签获取文章 (增强版，包含元数据补充)
 */
export async function getEnhancedPostsByTag(tag: string): Promise<EnhancedXLogPost[]> {
  const posts = await getPostsByTag(tag)
  return await enhancePostsWithMetadata(posts)
}

/**
 * 根据slug获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<XLogPost | null> {
  const handle = getXLogHandle()
  if (!handle || !slug?.trim())
    return null

  return perfTracker.measure(`getPostBySlug:${slug}`, () =>
    withCache(
      'getPostBySlug',
      { handle, slug },
      () => withErrorHandling(async () => {
        const client = await createClient()
        if (!client)
          return null

        const post = await client.post.getBySlug(handle, slug)
        return transformPostData(post)
      }, null, 'getPostBySlug', { retries: 1, timeout: 8000 }),
      CACHE_TTL.SINGLE_POST,
    ))
}

/**
 * 根据ID获取单篇文章
 */
export async function getPostById(id: string): Promise<XLogPost | null> {
  const handle = getXLogHandle()
  if (!handle || !id?.trim())
    return null

  return withCache(
    'getPostById',
    { handle, id },
    () => withErrorHandling(async () => {
      const client = await createClient()
      if (!client)
        return null

      const post = await client.post.get(handle, id)
      return transformPostData(post)
    }, null, 'getPostById', { retries: 1, timeout: 8000 }),
    CACHE_TTL.SINGLE_POST,
  )
}

/**
 * 转换站点数据格式
 */
function transformSiteData(siteData: RawXLogSite): XLogSite {
  return {
    id: siteData.id || '',
    name: siteData.name || '',
    subdomain: siteData.subdomain || '',
    custom_domain: siteData.custom_domain,
    description: siteData.description,
    bio: siteData.bio,
    avatar: siteData.avatar,
    cover: siteData.cover,
    navigation: siteData.navigation || [],
    css: siteData.css,
    ga: siteData.ga,
    ua: siteData.ua,
    social_platforms: siteData.social_platforms || {},
    social_links: siteData.social_links || [],
  }
}

/**
 * 转换文章数据格式
 */
function transformPostData(postData: RawXLogPost): XLogPost {
  return {
    id: postData.id || '',
    characterId: postData.characterId,
    title: postData.title || '',
    content: postData.content || '',
    excerpt: postData.excerpt || postData.summary || '',
    slug: postData.slug || '',
    date_published: postData.date_published || postData.created_at || '',
    date_updated: postData.date_updated || postData.updated_at || '',
    tags: postData.tags || [],
    summary: postData.summary || postData.excerpt,
    cover: postData.cover,
    author: postData.author
      ? {
          id: postData.author.id || '',
          name: postData.author.name || '',
          username: postData.author.username || '',
          avatar: postData.author.avatar,
          bio: postData.author.bio,
        }
      : undefined,
    external_urls: postData.external_urls || [],
    views: postData.views || 0,
    comments: Array.isArray(postData.comments)
      ? postData.comments
      : [],
  }
}

/**
 * 转换文章列表数据格式
 */
function transformPostsData(postsData: RawXLogPost[]): XLogPost[] {
  return postsData.map(transformPostData)
}
