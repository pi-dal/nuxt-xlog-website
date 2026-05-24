import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const rootDir = resolve(__dirname, '../..')

describe('global performance guards', () => {
  it('does not force-enable twoslash in the Vite markdown pipeline', () => {
    const viteConfig = readFileSync(resolve(rootDir, 'vite.config.ts'), 'utf-8')

    expect(viteConfig).not.toContain('applyMarkdownPipeline(md, { enableTwoslash: true })')
    expect(viteConfig).toContain('await applyMarkdownPipeline(md)')
  })

  it('only mounts the decorative ArtPlum background on the home route', () => {
    const appShell = readFileSync(resolve(rootDir, 'src/App.vue'), 'utf-8')

    expect(appShell).toContain('<ArtPlum v-if="route.path === \'/\'" />')
  })
})
