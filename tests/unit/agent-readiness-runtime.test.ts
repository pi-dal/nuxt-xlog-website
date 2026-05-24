import { describe, expect, it } from 'vitest'

describe('agent readiness runtime helpers', () => {
  it('exposes worker-safe API discovery and markdown helpers', async () => {
    const runtime = await import('~/logics/agent-readiness-runtime')

    expect(runtime.getDiscoveryLinkHeaderValue()).toContain('rel="api-catalog"')

    const markdown = runtime.htmlToMarkdown('<main><h1>Home</h1><p>Hello world.</p></main>')

    expect(markdown).toBe('# Home\n\nHello world.\n')
    expect(runtime.estimateMarkdownTokens(markdown)).toBe(4)

    expect(runtime.createApiCatalog('https://pi-dal.com')).toEqual({
      linkset: [
        {
          'anchor': 'https://pi-dal.com/functions/creem-checkout',
          'service-desc': [
            { href: 'https://pi-dal.com/openapi/creem-checkout.openapi.json' },
          ],
          'service-doc': [
            { href: 'https://pi-dal.com/docs/api' },
          ],
          'status': [
            { href: 'https://pi-dal.com/api/health' },
          ],
        },
      ],
    })
  })
})
