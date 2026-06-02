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

function parseAcceptLanguage(acceptLanguage) {
  if (!acceptLanguage)
    return null
  const langs = acceptLanguage
    .split(',')
    .map((l) => {
      const [lang, q = 'q=1'] = l.trim().split(';')
      const quality = Number.parseFloat(q.replace('q=', '')) || 1
      return { lang: lang.trim(), quality }
    })
    .sort((a, b) => b.quality - a.quality)
  return langs[0]?.lang || null
}

function resolveLocalePath(acceptLanguage) {
  const lang = parseAcceptLanguage(acceptLanguage)
  if (!lang)
    return null
  // Try exact match first, then prefix match
  if (LOCALE_PATHS[lang])
    return LOCALE_PATHS[lang]
  const prefix = lang.split('-')[0]
  if (LOCALE_PATHS[prefix])
    return LOCALE_PATHS[prefix]
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

  // Locale auto-redirect for root path
  if (url.pathname === '/') {
    const cookieLocale = getLocaleCookie(context.request)
    if (cookieLocale && LOCALE_PATHS[cookieLocale]) {
      return Response.redirect(new URL(LOCALE_PATHS[cookieLocale], url.origin).href, 302)
    }
    const acceptLang = context.request.headers.get('Accept-Language')
    const localePath = resolveLocalePath(acceptLang)
    if (localePath) {
      const redirectUrl = new URL(localePath, url.origin)
      redirectUrl.search = url.search
      return Response.redirect(redirectUrl.href, 302)
    }
  }

  const response = await context.next()
  const headers = new Headers(response.headers)

  if (shouldAttachDiscoveryHeaders(url, response))
    headers.set('Link', getDiscoveryLinkHeaderValue())

  if (!wantsMarkdown(context.request, response))
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
