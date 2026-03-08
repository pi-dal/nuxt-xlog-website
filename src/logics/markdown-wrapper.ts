const chunkedMarkdownPattern = /\/src\/content\/chunked-posts\//

export function isChunkedMarkdownSection(id: string) {
  return chunkedMarkdownPattern.test(id.replace(/\\/g, '/'))
}

export function resolveMarkdownWrapperComponent(id: string, _code: string) {
  if (id.includes('/demo/'))
    return 'WrapperDemo'

  if (isChunkedMarkdownSection(id))
    return null

  return 'WrapperPost'
}

export function resolveMarkdownWrapperClasses(id: string, code: string) {
  if (isChunkedMarkdownSection(id))
    return 'prose m-auto slide-enter-content'

  return code.includes('@layout-full-width')
    ? ''
    : 'prose m-auto slide-enter-content'
}
