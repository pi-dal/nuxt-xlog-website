import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

// Shared MSW server instance. Handlers will be provided by individual tests.
export const mswServer = setupServer()

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())
