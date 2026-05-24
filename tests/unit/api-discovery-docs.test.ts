import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('api discovery documentation', () => {
  it('documents the current unauthenticated API surface and discovery limits', async () => {
    const apiDoc = await readFile(resolve(process.cwd(), 'pages/docs/api.md'), 'utf8')
    const openapi = await readFile(resolve(process.cwd(), 'public/openapi/creem-checkout.openapi.json'), 'utf8')

    expect(apiDoc).toContain('The site currently exposes two public, unauthenticated API surfaces:')
    expect(apiDoc).toContain('This site does not currently publish OAuth/OIDC discovery metadata')
    expect(apiDoc).toContain('It also does not currently publish an MCP Server Card')

    expect(openapi).toContain('"security": []')
    expect(openapi).toContain('"description": "Proxies checkout creation to Creem using the site\'s configured API key. This endpoint is currently unauthenticated."')
  })
})
