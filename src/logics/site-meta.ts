import type { SocialLink, XLogSite } from '~/types'
import type { ContentType } from '~/types/content'
import { siteConfig } from '~/site/config'

interface CollectionPageHeadOptions {
  collection: 'books' | 'posts'
  description: string
  path: string
  title: string
}

interface ContentPageHeadOptions {
  date?: string
  description: string
  image: string
  lang?: string
  path: string
  title: string
  type: ContentType
}

function normalizeSiteUrl(url: string): string {
  let normalized = url.trim()
  if (!normalized)
    return ''

  if (!/^https?:\/\//i.test(normalized))
    normalized = `https://${normalized}`

  // Remove trailing slash to make it easy to concatenate paths later
  return normalized.replace(/\/+$/, '')
}

function extractWebsite(site?: XLogSite | null): string | undefined {
  if (!site)
    return undefined

  const direct = site.custom_domain?.trim()
  if (direct)
    return direct

  const websiteLink = findSocialLink(site.social_links, ['website', 'site', 'blog', 'home'])
  if (websiteLink?.url)
    return websiteLink.url

  return undefined
}

function findSocialLink(links: SocialLink[] | undefined, candidates: string[]): SocialLink | undefined {
  if (!links?.length)
    return undefined

  const target = candidates.map(name => name.toLowerCase())
  return links.find(link => target.includes(link.platform.toLowerCase()))
}

function getEnvSiteUrl(): string | undefined {
  // Vite injects import.meta.env on both client & SSR builds
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env
    return env.PUBLIC_SITE_URL || env.SITE_URL || env.VITE_PUBLIC_SITE_URL
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env.PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL
  }

  return undefined
}

export function resolveSiteUrl(site?: XLogSite | null, fallbackHandle: string = 'pi-dal'): string {
  const envUrl = getEnvSiteUrl()
  if (envUrl)
    return normalizeSiteUrl(envUrl)

  const website = extractWebsite(site)
  if (website)
    return normalizeSiteUrl(website)

  return normalizeSiteUrl(siteConfig.url || fallbackHandle)
}

export function buildAbsoluteUrl(baseUrl: string, path: string): string {
  if (!baseUrl) {
    return path
  }
  if (!path)
    return baseUrl

  if (/^https?:\/\//i.test(path))
    return path

  if (!path.startsWith('/'))
    path = `/${path}`

  return `${baseUrl}${path}`
}

function normalizePagePath(path: string): string {
  if (!path)
    return '/'

  return path.startsWith('/') ? path : `/${path}`
}

function buildCanonicalUrl(path: string): string {
  return buildAbsoluteUrl(resolveSiteUrl(), normalizePagePath(path))
}

function buildPageTitle(title: string) {
  return title === siteConfig.title ? title : `${title} - ${siteConfig.title}`
}

function buildJsonLdScript(payload: Record<string, any>) {
  return {
    type: 'application/ld+json',
    textContent: JSON.stringify(payload),
  }
}

export function buildCollectionPageHead(options: CollectionPageHeadOptions) {
  const url = buildCanonicalUrl(options.path)
  const title = buildPageTitle(options.title)
  const image = buildAbsoluteUrl(resolveSiteUrl(), `/og/${options.collection}.png`)

  return {
    title,
    link: [
      { rel: 'canonical', href: url },
    ],
    meta: [
      { name: 'description', content: options.description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: options.description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: options.description },
      { name: 'twitter:image', content: image },
    ],
    script: [
      buildJsonLdScript({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': options.title,
        'description': options.description,
        'url': url,
      }),
    ],
  }
}

export function buildContentPageHead(options: ContentPageHeadOptions) {
  const url = buildCanonicalUrl(options.path)
  const title = buildPageTitle(options.title)
  const isArticle = ['book', 'post'].includes(options.type)

  return {
    title,
    link: [
      { rel: 'canonical', href: url },
    ],
    meta: [
      { name: 'description', content: options.description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: options.description },
      { property: 'og:image', content: options.image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: isArticle ? 'article' : 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: options.description },
      { name: 'twitter:image', content: options.image },
    ],
    script: [
      buildJsonLdScript({
        '@context': 'https://schema.org',
        '@type': isArticle ? 'BlogPosting' : 'WebPage',
        'headline': options.title,
        'description': options.description,
        'url': url,
        'image': [options.image],
        'datePublished': options.date,
        'inLanguage': options.lang,
        'author': {
          '@type': 'Person',
          'name': siteConfig.author.name,
          'url': siteConfig.url,
        },
      }),
    ],
  }
}

function extractHandleFromUrl(url: string): string | null {
  const match = url.match(/(?:x\.com|twitter\.com)\/(?:#!\/)?@?([\w.-]+)/i)
  if (match?.[1])
    return match[1]
  return null
}

export function resolveAuthorHandle(site?: XLogSite | null): string {
  const twitterLink = findSocialLink(site?.social_links, ['twitter', 'x'])
  if (twitterLink?.url) {
    const handle = extractHandleFromUrl(twitterLink.url)
    if (handle)
      return handle
  }

  if (site?.subdomain)
    return site.subdomain

  return siteConfig.author.handle
}
