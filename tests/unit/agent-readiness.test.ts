import { describe, expect, it } from 'vitest'

describe('agent readiness response layer', () => {
  it('redirects the bare homepage to a locale homepage', async () => {
    const { onRequest } = await import('../../functions/_middleware.js')

    const response = await onRequest({
      next: async () => new Response('<html><body>Home</body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/', {
        headers: {
          'Accept-Language': 'ja,en;q=0.8,zh;q=0.6',
        },
      }),
    })

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/ja')
    expect(response.headers.get('Set-Cookie')).toContain('locale=ja')
  })

  it('uses the entry pathname when falling back without cookie or language header', async () => {
    const { onRequest } = await import('../../functions/_middleware.js')

    const booksResponse = await onRequest({
      next: async () => new Response('<html><body>Books</body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/books'),
    })

    const homeResponse = await onRequest({
      next: async () => new Response('<html><body>Home</body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/'),
    })

    expect(booksResponse.status).toBe(302)
    expect(booksResponse.headers.get('Location')).toBe('/zh/books')
    expect(homeResponse.status).toBe(302)
    expect(homeResponse.headers.get('Location')).toBe('/zh')
  })

  it('treats about and friends as locale entry paths instead of falling through to the SPA shell', async () => {
    const { onRequest } = await import('../../functions/_middleware.js')

    const aboutResponse = await onRequest({
      next: async () => new Response('<html><body>About shell</body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/about', {
        headers: {
          'Accept-Language': 'ja,en;q=0.8,zh;q=0.6',
        },
      }),
    })

    const friendsResponse = await onRequest({
      next: async () => new Response('<html><body>Friends shell</body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/friends', {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }),
    })

    expect(aboutResponse.status).toBe(302)
    expect(aboutResponse.headers.get('Location')).toBe('/ja/about')
    expect(friendsResponse.status).toBe(302)
    expect(friendsResponse.headers.get('Location')).toBe('/en/friends')
  })

  it('returns markdown when the request prefers text/markdown', async () => {
    const { onRequest } = await import('../../functions/_middleware.js')

    const response = await onRequest({
      next: async () => new Response('<html><body><main><h1>Home</h1><p>Hello world.</p></main></body></html>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Host': 'pi-dal.com',
        },
        status: 200,
      }),
      request: new Request('https://pi-dal.com/en/posts', {
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
