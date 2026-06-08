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

  it('generates a sitemap with locale-prefixed canonical publishing URLs for content collections', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'publishing-surface-'))
    createdDirs.push(rootDir)

    await import('fs-extra').then(fs => Promise.all([
      fs.ensureDir(join(rootDir, 'pages/posts')),
      fs.ensureDir(join(rootDir, 'pages/books')),
      fs.ensureDir(join(rootDir, 'pages/en/posts')),
      fs.ensureDir(join(rootDir, 'pages/ja/posts')),
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
lang: zh
---

Book notes
`)

    await writeFile(join(rootDir, 'pages/en/posts/hello-world.md'), `---
title: Hello World
date: 2024-03-01
slug: hello-world
summary: First post
type: post
lang: en
---

Hello world
`)

    await writeFile(join(rootDir, 'pages/ja/posts/hello-world.md'), `---
title: Hello World
date: 2024-03-01
slug: hello-world
summary: First post
type: post
lang: ja
---

Hello world
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
    expect(sitemap).toContain('<loc>https://pi-dal.com/zh/</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/zh/posts</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/zh/books</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/zh/posts/hello-world</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/zh/books/reading-notes</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/en/posts/hello-world</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/ja/posts/hello-world</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/chat</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/docs/api</loc>')
    expect(sitemap).toContain('<loc>https://pi-dal.com/zh/posts/visual-guide</loc>')
    expect(sitemap).not.toContain('<loc>https://pi-dal.com/posts/')
    expect(sitemap).not.toContain('<loc>https://pi-dal.com/books/')
  })

  it('generates AI discovery artifacts without legacy root collection URLs', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'agent-surface-'))
    createdDirs.push(rootDir)

    await import('fs-extra').then(fs => Promise.all([
      fs.ensureDir(join(rootDir, 'pages/posts')),
      fs.ensureDir(join(rootDir, 'pages/books')),
      fs.ensureDir(join(rootDir, 'public/.well-known/agent-skills')),
      fs.ensureDir(join(rootDir, 'dist')),
    ]))

    await writeFile(join(rootDir, 'public/.well-known/agent-skills/site-navigation.md'), '# Site navigation\n')

    await writeFile(join(rootDir, 'pages/posts/hello-world.md'), `---
title: Hello World
date: 2024-03-01
slug: hello-world
summary: First post
type: post
lang: zh
---

Hello world
`)

    await writeFile(join(rootDir, 'pages/books/reading-notes.md'), `---
title: Reading Notes
date: 2024-02-15
slug: reading-notes
summary: Book notes
type: book
lang: zh
---

Book notes
`)

    await execFileAsync('pnpm', ['--dir', repoRoot, 'exec', 'tsx', resolve(repoRoot, 'scripts/generate-agent-artifacts.ts')], {
      cwd: rootDir,
      env: {
        ...process.env,
        CONTENT_ROOT_DIR: rootDir,
        PUBLISH_DIST_DIR: join(rootDir, 'dist'),
      },
    })

    const llms = await readFile(join(rootDir, 'dist/llms.txt'), 'utf8')
    const manifest = JSON.parse(await readFile(join(rootDir, 'dist/.well-known/agent-routes.json'), 'utf8')) as {
      routes: Array<{ path: string, url: string }>
    }

    expect(llms).toContain('https://pi-dal.com/zh/posts/hello-world')
    expect(llms).toContain('https://pi-dal.com/zh/books/reading-notes')
    expect(llms).not.toContain('https://pi-dal.com/posts/')
    expect(llms).not.toContain('https://pi-dal.com/books/')
    expect(manifest.routes).toContainEqual(expect.objectContaining({
      path: '/zh/posts/hello-world',
      url: 'https://pi-dal.com/zh/posts/hello-world',
    }))
    expect(manifest.routes).toContainEqual(expect.objectContaining({
      path: '/zh/books/reading-notes',
      url: 'https://pi-dal.com/zh/books/reading-notes',
    }))
    expect(manifest.routes.some(route => route.path.startsWith('/posts/') || route.path.startsWith('/books/'))).toBe(false)
  })
})
