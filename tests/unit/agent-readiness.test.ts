import { describe, expect, it } from 'vitest'

describe('agent readiness response layer', () => {
  it('adds discovery Link headers to the homepage response', async () => {
    const { onRequest } = await import('../../functions/_middleware.js')

    const response = await onRequest({
      next: async () => new Response('<html><body>Home</body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/'),
    })

    const linkHeader = response.headers.get('Link') || ''

    expect(linkHeader).toContain('</.well-known/api-catalog>; rel="api-catalog"')
    expect(linkHeader).toContain('</openapi/creem-checkout.openapi.json>; rel="service-desc"')
    expect(linkHeader).toContain('</docs/api>; rel="service-doc"')
    expect(linkHeader).toContain('</.well-known/agent-skills/index.json>; rel="describedby"')
  })

  it('returns markdown when the request prefers text/markdown', async () => {
    const { onRequest } = await import('../../functions/_middleware.js')

    const response = await onRequest({
      next: async () => new Response('<html><body><main><h1>Home</h1><p>Hello world.</p></main></body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/', {
        headers: {
          Accept: 'text/markdown, text/html;q=0.8',
        },
      }),
    })

    expect(response.headers.get('Content-Type')).toContain('text/markdown')
    expect(response.headers.get('x-markdown-tokens')).toBeTruthy()
    await expect(response.text()).resolves.toContain('# Home')
  })

  it('serves the API catalog as linkset JSON', async () => {
    const { onRequestGet } = await import('../../functions/.well-known/api-catalog.js')

    const response = await onRequestGet({
      request: new Request('https://pi-dal.com/.well-known/api-catalog'),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/linkset+json')

    const body = await response.json()

    expect(Array.isArray(body.linkset)).toBe(true)
    expect(body.linkset).toContainEqual({
      'anchor': 'https://pi-dal.com/functions/creem-checkout',
      'service-desc': [
        {
          href: 'https://pi-dal.com/openapi/creem-checkout.openapi.json',
        },
      ],
      'service-doc': [
        {
          href: 'https://pi-dal.com/docs/api',
        },
      ],
      'status': [
        {
          href: 'https://pi-dal.com/api/health',
        },
      ],
    })
  })

  it('registers WebMCP tools when navigator.modelContext is available', async () => {
    const registeredTools: string[] = []
    const unregisterSignals: AbortSignal[] = []

    const registerTool = (name: string, definition: Record<string, any>, options?: { signal?: AbortSignal }) => {
      registeredTools.push(name)
      unregisterSignals.push(options?.signal as AbortSignal)
      expect(definition.description).toBeTruthy()
      expect(definition.inputSchema).toBeTruthy()
      expect(typeof definition.execute).toBe('function')
    }

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        modelContext: {
          registerTool,
        },
      },
    })
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: globalThis,
    })

    const { registerWebMcpTools } = await import('~/logics/webmcp')

    const cleanup = registerWebMcpTools()

    expect(registeredTools).toContain('site.navigate')
    expect(registeredTools).toContain('content.listRecent')
    expect(registeredTools).toContain('content.getByPath')
    expect(unregisterSignals.every(signal => signal instanceof AbortSignal)).toBe(true)

    cleanup()
  })
})
