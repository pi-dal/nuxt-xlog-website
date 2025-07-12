export interface Post {
  path: string
  title: string
  place?: string
  date: string
  lang?: string
  desc?: string
  platform?: string
  duration?: string
  recording?: string
  radio?: boolean
  video?: boolean
  inperson?: boolean
  redirect?: string
}

export interface Talk {
  title: string
  description?: string
  series?: string
  lang?: string
  presentations: TalkPresentation[]
}

export interface TalkPresentation {
  lang?: string
  date: string
  location?: string
  conference: string
  conferenceUrl: string
  recording?: string
  transcript?: string
  pdf?: string
  spa?: string
}

export interface UpcomingTalk {
  title: string
  date: string
  platform: string
  url: string
}

// xLog API Types
export interface XLogPost {
  id: string
  characterId?: string
  title: string
  content: string
  excerpt: string
  slug: string
  date_published: string
  date_updated: string
  summary?: string
  cover?: string
  views?: number
  comments?: XLogComment[]
  external_urls?: string[]
  author?: XLogAuthor
  tags?: string[]
}

// Raw API response types for transformation
export interface RawXLogPost {
  id?: string
  characterId?: string
  title?: string
  content?: string
  excerpt?: string
  summary?: string
  slug?: string
  date_published?: string
  date_updated?: string
  created_at?: string
  updated_at?: string
  cover?: string
  views?: number
  comments?: number | XLogComment[]
  external_urls?: string[]
  author?: RawXLogAuthor
  tags?: string[]
}

export interface RawXLogSite {
  id?: string
  name?: string
  subdomain?: string
  custom_domain?: string
  description?: string
  bio?: string
  avatar?: string
  cover?: string
  navigation?: XLogNavigation[]
  css?: string
  ga?: string
  ua?: string
  social_platforms?: Record<string, string>
  social_links?: SocialLink[]
}

export interface RawXLogAuthor {
  id?: string
  name?: string
  username?: string
  avatar?: string
  bio?: string
}

export interface XLogSite {
  id: string
  name: string
  subdomain: string
  custom_domain?: string
  description?: string
  bio?: string
  avatar?: string
  cover?: string
  navigation?: XLogNavigation[]
  css?: string
  ga?: string
  ua?: string
  social_platforms?: Record<string, string>
  social_links?: SocialLink[]
}

export interface XLogAuthor {
  id: string
  name: string
  username: string
  avatar?: string
  bio?: string
}

export interface XLogNavigation {
  id: string
  label: string
  url: string
}

export interface XLogPaginatedPosts {
  posts: XLogPost[]
  total: number
  hasMore: boolean
  cursor?: string
}

export interface XLogComment {
  id: string
  author: XLogAuthor
  content: string
  date_published: string
}

export interface SocialLink {
  platform: string
  url: string
}

export interface XLogPortfolio {
  id: string
  title: string
  content?: string
  excerpt: string
  slug: string
  date_published: string
  cover?: string
  characterId?: string
  author?: XLogAuthor
}

// Metadata supplements for enhancing xLog posts
export interface MetadataSupplements {
  title?: string
  description?: string
  image?: string
  art?: string
  place?: string
  duration?: string
  lang?: string
  // Additional typed fields
  category?: string
  tags?: string[]
  featured?: boolean
  priority?: number
  external_links?: string[]
  related_posts?: string[]
  seo_title?: string
  seo_description?: string
  canonical_url?: string
  // Allow additional string or primitive values only
  [key: string]: string | number | boolean | string[] | undefined
}

export interface MetadataSupplementsConfig {
  [slug: string]: MetadataSupplements
}

// Enhanced XLogPost with merged metadata
export interface EnhancedXLogPost extends XLogPost {
  // Additional fields from supplements
  description?: string
  image?: string
  art?: string
  place?: string
  duration?: string
  lang?: string
}

// Error handling types
export interface XLogError extends Error {
  code?: string
  status?: number
  details?: any
  category?: string
  context?: any
  originalError?: Error
}

export type XLogOperation = 'getSiteInfo' | 'getAllPosts' | 'getPosts' | 'getPostBySlug' | 'getPostById' | 'getSiteStats'

// API client configuration
export interface XLogClientConfig {
  handle: string
  retries?: number
  timeout?: number
  baseURL?: string
}

// Constants
export const XLOG_CONSTANTS = {
  DEFAULT_HANDLE: 'pi-dal',
  STORAGE_KEY: 'xlog-handle',
  ENV_KEY: 'XLOG_HANDLE',
  DEFAULT_LIMIT: 10,
  MAX_RETRIES: 3,
  TIMEOUT: 5000,
} as const

export type XLogConstant = keyof typeof XLOG_CONSTANTS
