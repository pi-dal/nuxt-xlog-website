import {
  estimateMarkdownTokens,
  getDiscoveryLinkHeaderValue,
  htmlToMarkdown,
} from '../src/logics/agent-readiness-runtime.ts'

const LOCALE_PATHS = {
  'zh': '/zh/posts',
  'zh-CN': '/zh/posts',
  'zh-TW': '/zh/posts',
  'en': '/en/posts',
  'en-US': '/en/posts',
  'en-GB': '/en/posts',
  'ja': '/ja/posts',
  'ja-JP': '/ja/posts',
}

function bestLocale(acceptLanguage) {
  if (!acceptLanguage)
    return null
  const langs = acceptLanguage.split(',')
  for (const entry of langs) {
    const [lang] = entry.trim().split(';')
    const code = lang.trim()
    if (LOCALE_PATHS[code])
      return LOCALE_PATHS[code]
    const prefix = code.split('-')[0]
    if (LOCALE_PATHS[prefix])
      return LOCALE_PATHS[prefix]
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

  // Redirect root, /posts, /books, /projects, /chat to locale-specific pages
  // Always redirects — never serves these as entity pages
  const REDIRECT_PATHS = ['/', '/posts', '/posts/', '/books', '/books/', '/projects', '/projects/', '/chat', '/chat/']
  if (REDIRECT_PATHS.includes(url.pathname)) {
    const cookieLocale = getLocaleCookie(request)
    if (cookieLocale && LOCALE_PATHS[cookieLocale]) {
      return new Response(null, {
        status: 302,
        headers: { Location: LOCALE_PATHS[cookieLocale] },
      })
    }
    const localePath = bestLocale(request.headers.get('Accept-Language'))
    if (localePath) {
      const locale = Object.keys(LOCALE_PATHS).find(k => LOCALE_PATHS[k] === localePath)
      const headers = { Location: localePath }
      if (locale) {
        headers['Set-Cookie'] = `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
      }
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
