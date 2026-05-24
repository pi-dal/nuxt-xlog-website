import {
  estimateMarkdownTokens,
  getDiscoveryLinkHeaderValue,
  htmlToMarkdown,
} from '../src/logics/agent-readiness-runtime.ts'

function wantsMarkdown(request, response) {
  const accept = request.headers.get('Accept') || ''
  const contentType = response.headers.get('Content-Type') || ''
  return accept.includes('text/markdown') && contentType.includes('text/html')
}

function shouldAttachDiscoveryHeaders(url, response) {
  const contentType = response.headers.get('Content-Type') || ''
  return url.pathname === '/' && response.status >= 200 && response.status < 400 && contentType.includes('text/html')
}

export async function onRequest(context) {
  const response = await context.next()
  const url = new URL(context.request.url)
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
