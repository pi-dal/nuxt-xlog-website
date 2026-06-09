import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = resolve(__dirname, '../..')

describe('global performance guards', () => {
  it('keeps FloatingVue out of the global app shell', () => {
    const entry = readFileSync(resolve(rootDir, 'src/main.ts'), 'utf-8')

    expect(entry).not.toContain('import FloatingVue from \'floating-vue\'')
    expect(entry).not.toContain('import \'floating-vue/dist/style.css\'')
    expect(entry).not.toContain('app.use(FloatingVue)')
  })

  it('does not force-enable twoslash in the Vite markdown pipeline', () => {
    const viteConfig = readFileSync(resolve(rootDir, 'vite.config.ts'), 'utf-8')

    expect(viteConfig).not.toContain('applyMarkdownPipeline(md, { enableTwoslash: true })')
    expect(viteConfig).toContain('await applyMarkdownPipeline(md)')
  })

  it('mounts ArtPlum background with viewport-aware gating', () => {
    const appShell = readFileSync(resolve(rootDir, 'src/App.vue'), 'utf-8')

    // Desktop: all pages show ambient; Mobile: only home page shows
    expect(appShell).toContain('v-if="isDesktop ? true : route.path === \'/\'"')
    expect(appShell).toContain(':mode="isDesktop ? \'ambient\' : \'static\'"')
    expect(appShell).toContain(':duration-ms=')
    expect(appShell).toContain(':seed-count=')
    expect(appShell).toContain(':stroke-opacity=')
    expect(appShell).toContain(':dot-opacity=')
  })
})
