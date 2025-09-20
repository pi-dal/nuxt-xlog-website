import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'

// Shared MSW server instance. Handlers will be provided by individual tests.
export const mswServer = setupServer()

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())
