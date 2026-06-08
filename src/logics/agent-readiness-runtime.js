import { buildAbsoluteUrl } from './site-meta';
export function createApiCatalog(baseUrl) {
    return {
        linkset: [
            {
                'anchor': buildAbsoluteUrl(baseUrl, '/functions/creem-checkout'),
                'service-desc': [
                    { href: buildAbsoluteUrl(baseUrl, '/openapi/creem-checkout.openapi.json') },
                ],
                'service-doc': [
                    { href: buildAbsoluteUrl(baseUrl, '/docs/api') },
                ],
                'status': [
                    { href: buildAbsoluteUrl(baseUrl, '/api/health') },
                ],
            },
        ],
    };
}
export function getDiscoveryLinkHeaderValue() {
    return [
        '</.well-known/api-catalog>; rel="api-catalog"',
        '</openapi/creem-checkout.openapi.json>; rel="service-desc"',
        '</docs/api>; rel="service-doc"',
        '</.well-known/agent-skills/index.json>; rel="describedby"',
    ].join(', ');
}
export function htmlToMarkdown(html) {
    const heading = html.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
    const paragraphs = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gi)]
        .map(match => match[1].replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);
    const lines = [];
    if (heading)
        lines.push(`# ${heading}`);
    lines.push(...paragraphs);
    return `${lines.join('\n\n').trim()}\n`;
}
export function estimateMarkdownTokens(markdown) {
    const normalized = markdown.trim();
    if (!normalized)
        return 0;
    return normalized.split(/\s+/).length;
}
