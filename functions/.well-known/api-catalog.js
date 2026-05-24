import { createApiCatalog } from '../../src/logics/agent-readiness-runtime.ts'
import { siteConfig } from '../../src/site/config.ts'

export async function onRequestGet() {
  return new Response(JSON.stringify(createApiCatalog(siteConfig.url), null, 2), {
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
    },
    status: 200,
  })
}
