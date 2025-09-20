import type { SocialLink, XLogSite } from '~/types'

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

  if (site.subdomain)
    return `${site.subdomain}.xlog.app`

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

  return normalizeSiteUrl(`${fallbackHandle}.xlog.app`)
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

  return 'xlog'
}
