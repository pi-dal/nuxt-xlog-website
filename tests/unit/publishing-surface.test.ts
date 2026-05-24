import { execFile } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const createdDirs: string[] = []
const repoRoot = resolve(process.cwd())

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map(dir => import('fs-extra').then(fs => fs.remove(dir))))
})

describe('publishing surface', () => {
  it('declares the generated sitemap in robots.txt', async () => {
    const robots = await readFile(resolve(process.cwd(), 'public/robots.txt'), 'utf8')

    expect(robots).toContain('Sitemap: https://pi-dal.com/sitemap.xml')
    expect(robots).toContain('Content-Signal: ai-train=no, search=yes, ai-input=no')
  })

  it('generates a sitemap with canonical publishing URLs for content and collection roots', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'publishing-surface-'))
    createdDirs.push(rootDir)

    await import('fs-extra').then(fs => Promise.all([
      fs.ensureDir(join(rootDir, 'pages/posts')),
      fs.ensureDir(join(rootDir, 'pages/books')),
      fs.ensureDir(join(rootDir, 'pages/docs')),
    ]))

    await writeFile(join(rootDir, 'pages/posts/hello-world.md'), `---
title: Hello World
date: 2024-03-01
slug: hello-world
summary: First post
type: post
---

Hello world
`)

    await writeFile(join(rootDir, 'pages/books/reading-notes.md'), `---
title: Reading Notes
date: 2024-02-15
slug: reading-notes
summary: Book notes
type: book
---

Book notes
`)

    await writeFile(join(rootDir, 'pages/chat.md'), `---
title: Chat
slug: chat
type: page
---

Chat landing page
`)

    await writeFile(join(rootDir, 'pages/docs/api.md'), `---
title: API Docs
slug: api
type: page
---

API docs
`)

    await writeFile(join(rootDir, 'pages/posts/visual-guide.vue'), `<template><article>Visual guide</article></template>
`)

    await execFileAsync('pnpm', ['--dir', repoRoot, 'exec', 'tsx', resolve(repoRoot, 'scripts/rss.ts')], {
      cwd: rootDir,
      env: {
        ...process.env,
        CONTENT_ROOT_DIR: rootDir,
        PUBLISH_DIST_DIR: join(rootDir, 'dist'),
      },
    })

    const sitemap = await readFile(join(rootDir, 'dist/sitemap.xml'), 'utf8')

    expect(sitemap).toContain('<loc>https://pi-dal.com/</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/posts/</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/books/</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/posts/hello-world</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/books/reading-notes</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/chat</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/docs/api</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/posts/visual-guide</loc>')
  })
})
