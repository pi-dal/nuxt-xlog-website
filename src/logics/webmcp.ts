interface WebMcpToolDefinition {
  description: string
  execute: (input: any) => any
  inputSchema: Record<string, any>
}

interface AgentRouteRecord {
  path: string
  title?: string
  type: string
  url: string
}

async function loadRouteManifest(): Promise<AgentRouteRecord[]> {
  const response = await fetch('/.well-known/agent-routes.json')
  if (!response.ok)
    return []
  const payload = await response.json()
  return Array.isArray(payload.routes) ? payload.routes : []
}

export function registerWebMcpTools() {
  const modelContext = (navigator as any)?.modelContext
  if (!modelContext?.registerTool)
    return () => {}

  const controller = new AbortController()

  const tools: Array<[string, WebMcpToolDefinition]> = [
    ['site.navigate', {
      description: 'Navigate to a route on the pi-dal website.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
        },
        required: ['path'],
      },
      execute: async ({ path }: { path: string }) => {
        window.location.assign(path)
        return { ok: true, path }
      },
    }],
    ['content.listRecent', {
      description: 'List recent public content routes from the generated route manifest.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 20 },
        },
      },
      execute: async ({ limit = 10 }: { limit?: number }) => {
        const routes = await loadRouteManifest()
        return {
          items: routes.slice(0, limit),
        }
      },
    }],
    ['content.getByPath', {
      description: 'Look up one route from the generated route manifest.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
        },
        required: ['path'],
      },
      execute: async ({ path }: { path: string }) => {
        const routes = await loadRouteManifest()
        const match = routes.find(route => route.path === path)
        return match || null
      },
    }],
  ]

  for (const [name, definition] of tools)
    modelContext.registerTool(name, definition, { signal: controller.signal })

  return () => controller.abort()
}
