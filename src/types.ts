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
  social_links: SocialLink[]
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
