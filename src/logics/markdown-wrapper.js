const chunkedMarkdownPattern = /\/src\/content\/chunked-posts\//;
export function isChunkedMarkdownSection(id) {
    return chunkedMarkdownPattern.test(id.replace(/\\/g, '/'));
}
export function resolveMarkdownWrapperComponent(id, _code) {
    if (id.includes('/demo/'))
        return 'WrapperDemo';
    if (id.replace(/\\/g, '/').endsWith('/pages/index.md'))
        return null;
    if (isChunkedMarkdownSection(id))
        return null;
    return 'WrapperPost';
}
export function resolveMarkdownWrapperClasses(id, code) {
    if (isChunkedMarkdownSection(id))
        return 'prose m-auto slide-enter-content';
    return code.includes('@layout-full-width')
        ? ''
        : 'prose m-auto slide-enter-content';
}
