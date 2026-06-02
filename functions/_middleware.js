import {
  estimateMarkdownTokens,
  getDiscoveryLinkHeaderValue,
  htmlToMarkdown,
} from '../src/logics/agent-readiness-runtime.ts'

const LOCALE_MAP = {
  'zh': 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'ja': 'ja',
  'ja-JP': 'ja',
}

// Map bare paths to their collection names
const PATH_COLLECTION = {
  '/': '',
  '/home': '',
  '/home/': '',
  '/posts': 'posts',
  '/posts/': 'posts',
  '/books': 'books',
  '/books/': 'books',
  '/projects': 'projects',
  '/projects/': 'projects',
  '/chat': 'chat',
  '/chat/': 'chat',
}

function bestLocale(acceptLanguage) {
  if (!acceptLanguage)
    return null
  const langs = acceptLanguage.split(',')
  for (const entry of langs) {
    const [lang] = entry.trim().split(';')
    const code = lang.trim()
    if (LOCALE_MAP[code])
      return LOCALE_MAP[code]
    const prefix = code.split('-')[0]
    if (LOCALE_MAP[prefix])
      return LOCALE_MAP[prefix]
  }
  return null
}

function wantsMarkdown(request, response) {
  const accept = request.headers.get('Accept') || ''
  const contentType = response.headers.get('Content-Type') || ''
  return accept.includes('text/markdown') && contentType.includes('text/html')
}

function shouldAttachDiscoveryHeaders(url, response) {
  const contentType = response.headers.get('Content-Type') || ''
  return url.pathname === '/' && response.status >= 200 && response.status < 400 && contentType.includes('text/html')
}

function getLocaleCookie(request) {
  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.match(/locale=([^;]+)/)
  return match ? match[1] : null
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const request = context.request

  // Redirect bare entry paths to locale-specific collection pages
  // Always redirects — never serves these as entity pages
  const collection = PATH_COLLECTION[url.pathname]
  if (collection !== undefined) {
    function localePath(locale) {
      if (!collection)
        return `/${locale}`
      return `/${locale}/${collection}`
    }
    const cookieLocale = getLocaleCookie(request)
    if (cookieLocale && LOCALE_MAP[cookieLocale]) {
      return new Response(null, {
        status: 302,
        headers: { Location: localePath(cookieLocale) },
      })
    }
    const localeCode = bestLocale(request.headers.get('Accept-Language'))
    if (localeCode) {
      const headers = { Location: localePath(localeCode) }
      headers['Set-Cookie'] = `locale=${localeCode}; Path=/; Max-Age=31536000; SameSite=Lax`
      return new Response(null, { status: 302, headers })
    }
    // Fallback: always redirect, never serve entity page
    return new Response(null, { status: 302, headers: { Location: '/zh/posts' } })
  }

  const response = await context.next()
  const headers = new Headers(response.headers)

  if (shouldAttachDiscoveryHeaders(url, response))
    headers.set('Link', getDiscoveryLinkHeaderValue())

  // Set locale cookie from URL for non-root pages
  const segs = url.pathname.split('/').filter(Boolean)
  if (segs.length >= 1 && ['en', 'zh', 'ja'].includes(segs[0])) {
    headers.append('Set-Cookie', `locale=${segs[0]}; Path=/; Max-Age=31536000; SameSite=Lax`)
  }

  if (!wantsMarkdown(request, response))
    return new Response(response.body, { headers, status: response.status, statusText: response.statusText })

  const html = await response.text()
  const markdown = htmlToMarkdown(html)
  headers.set('Content-Type', 'text/markdown; charset=utf-8')
  headers.set('x-markdown-tokens', String(estimateMarkdownTokens(markdown)))
  headers.delete('Content-Length')

  return new Response(markdown, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}
