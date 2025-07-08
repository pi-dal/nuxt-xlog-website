import type { XLogPost, XLogSite, XLogPaginatedPosts } from '../types'

// 获取xLog handle配置
function getXLogHandle(): string {
  // 在客户端环境中从localStorage获取
  if (typeof window !== 'undefined') {
    return localStorage.getItem('xlog-handle') || 'pi-dal'
  }
  // 在服务端环境中从环境变量获取（如果有的话）
  return process.env.XLOG_HANDLE || 'pi-dal'
}

// 动态创建xLog客户端，避免导入错误
async function createClient() {
  try {
    const { Client } = await import('sakuin')
    return new Client()
  } catch (error) {
    console.error('Failed to import sakuin client:', error)
    return null
  }
}

// 错误处理包装器
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`Error in ${operationName}:`, error)
    // 如果是网络错误或SDK错误，可以在这里添加特定的处理逻辑
    if (error instanceof Error) {
      console.error(`${operationName} failed:`, error.message)
    }
    return fallback
  }
}

/**
 * 获取站点信息
 */
export async function getSiteInfo(): Promise<XLogSite | null> {
  const handle = getXLogHandle()
  if (!handle) return null
  
  return withErrorHandling(async () => {
    const client = await createClient()
    if (!client) return null
    
    const site = await client.site.getInfo(handle)
    return transformSiteData(site)
  }, null, 'getSiteInfo')
}

/**
 * 获取站点统计信息
 */
export async function getSiteStats() {
  const handle = getXLogHandle()
  if (!handle) return null
  
  return withErrorHandling(async () => {
    const client = await createClient()
    if (!client) return null
    
    return await client.site.getStat(handle)
  }, null, 'getSiteStats')
}

/**
 * 获取所有博客文章
 */
export async function getAllPosts(): Promise<XLogPost[]> {
  const handle = getXLogHandle()
  if (!handle) return []
  
  return withErrorHandling(async () => {
    const client = await createClient()
    if (!client) return []
    
    const posts = await client.post.getAll(handle)
    return transformPostsData(posts)
  }, [], 'getAllPosts')
}

/**
 * 分页获取博客文章
 */
export async function getPosts(cursor?: string, limit: number = 10): Promise<XLogPaginatedPosts> {
  const handle = getXLogHandle()
  const fallback = { posts: [], total: 0, hasMore: false }
  if (!handle) return fallback
  
  return withErrorHandling(async () => {
    const client = await createClient()
    if (!client) return fallback
    
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
  }, fallback, 'getPosts')
}

/**
 * 根据slug获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<XLogPost | null> {
  const handle = getXLogHandle()
  if (!handle) return null
  
  return withErrorHandling(async () => {
    const client = await createClient()
    if (!client) return null
    
    const post = await client.post.getBySlug(handle, slug)
    return transformPostData(post)
  }, null, 'getPostBySlug')
}

/**
 * 根据ID获取单篇文章
 */
export async function getPostById(id: string): Promise<XLogPost | null> {
  const handle = getXLogHandle()
  if (!handle) return null
  
  return withErrorHandling(async () => {
    const client = await createClient()
    if (!client) return null
    
    const post = await client.post.get(handle, id)
    return transformPostData(post)
  }, null, 'getPostById')
}

/**
 * 转换站点数据格式
 */
function transformSiteData(siteData: any): XLogSite {
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
  }
}

/**
 * 转换文章数据格式
 */
function transformPostData(postData: any): XLogPost {
  return {
    id: postData.id || '',
    title: postData.title || '',
    content: postData.content || '',
    excerpt: postData.excerpt || postData.summary,
    slug: postData.slug || '',
    date_published: postData.date_published || postData.created_at,
    date_updated: postData.date_updated || postData.updated_at,
    tags: postData.tags || [],
    summary: postData.summary || postData.excerpt,
    cover: postData.cover,
    author: postData.author ? {
      id: postData.author.id || '',
      name: postData.author.name || '',
      username: postData.author.username || '',
      avatar: postData.author.avatar,
      bio: postData.author.bio,
    } : undefined,
    external_urls: postData.external_urls || [],
    views: postData.views || 0,
    comments: postData.comments || 0,
  }
}

/**
 * 转换文章列表数据格式
 */
function transformPostsData(postsData: any[]): XLogPost[] {
  return postsData.map(transformPostData)
} 