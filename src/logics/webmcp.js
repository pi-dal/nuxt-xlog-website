async function loadRouteManifest() {
    const response = await fetch('/.well-known/agent-routes.json');
    if (!response.ok)
        return [];
    const payload = await response.json();
    return Array.isArray(payload.routes) ? payload.routes : [];
}
export function registerWebMcpTools() {
    const modelContext = navigator?.modelContext;
    if (!modelContext?.registerTool)
        return () => { };
    const controller = new AbortController();
    const tools = [
        ['site.navigate', {
                description: 'Navigate to a route on the pi-dal website.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                    },
                    required: ['path'],
                },
                execute: async ({ path }) => {
                    window.location.assign(path);
                    return { ok: true, path };
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
                execute: async ({ limit = 10 }) => {
                    const routes = await loadRouteManifest();
                    return {
                        items: routes.slice(0, limit),
                    };
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
                execute: async ({ path }) => {
                    const routes = await loadRouteManifest();
                    const match = routes.find(route => route.path === path);
                    return match || null;
                },
            }],
    ];
    for (const [name, definition] of tools)
        modelContext.registerTool(name, definition, { signal: controller.signal });
    return () => controller.abort();
}
