import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { loadMarkdownContentEntries } from '~/content/files'

const createdDirs: string[] = []

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map(dir => import('fs-extra').then(fs => fs.remove(dir))))
})

describe('loadMarkdownContentEntries', () => {
  it('loads markdown posts, resolves absolute URLs, and skips drafts', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'markdown-content-'))
    createdDirs.push(rootDir)

    const postsDir = join(rootDir, 'pages/posts')
    await import('fs-extra').then(fs => fs.ensureDir(postsDir))

    await writeFile(join(postsDir, 'published.md'), `---
title: Published
date: 2024-03-01
slug: published
summary: Summary
type: post
---

![cover](/article-assets/published/cover.png)

[Internal](/posts/published)
`)

    await writeFile(join(postsDir, 'draft.md'), `---
title: Draft
date: 2024-03-02
slug: draft
draft: true
type: post
---

Nope
`)

    const entries = await loadMarkdownContentEntries({
      baseUrl: 'https://pi-dal.com',
      patterns: ['pages/posts/*.md'],
      rootDir,
    })

    expect(entries).toHaveLength(1)
    expect(entries[0].frontmatter.title).toBe('Published')
    expect(entries[0].url).toBe('https://pi-dal.com/posts/published')
    expect(entries[0].html).toContain('src="https://pi-dal.com/article-assets/published/cover.png"')
    expect(entries[0].html).toContain('href="https://pi-dal.com/posts/published"')
  })
})
