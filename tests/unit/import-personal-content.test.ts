import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import fs from 'fs-extra'
import { afterEach, describe, expect, it } from 'vitest'

import { importPersonalContent } from '../../scripts/import-personal-content'

const createdDirs: string[] = []

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map(dir => fs.remove(dir)))
})

describe('importPersonalContent', () => {
  it('imports weread notes as books and rewrites four-vector assets into post content', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'import-personal-content-'))
    const personalDir = join(outputDir, 'Personal')
    const wereadDir = join(personalDir, 'WeRead')
    const publicDir = join(outputDir, 'public')
    const xlogMappingPath = join(outputDir, 'xlog-mapping.json')
    createdDirs.push(outputDir)

    await fs.ensureDir(wereadDir)

    await writeFile(join(wereadDir, 'Sample Book.md'), `---
readingDate: 2025-01-01
finishedDate: 2025-02-02
---
# 元数据
> [!abstract] Sample Book
> - 作者： Someone
> - 简介： This is a long summary.
>   It continues on the next line.

# 高亮划线
`)

    await writeFile(join(personalDir, '如何用四维矢量来解决狭义相对论问题（基础的时空与碰撞的变换）.md'), `>引言

这里是摘要段落。

![[pair_annihilation_hd.gif]]
`)

    await writeFile(join(personalDir, '如何用四维矢量来解决狭义相对论问题（电磁学与动力学）.md'), `[上一篇文章](https://pi-dal.com/posts/STR-Four-Vector)

第二篇正文。
`)

    await writeFile(join(personalDir, 'pair_annihilation_hd.gif'), 'gif-data')

    await writeFile(xlogMappingPath, JSON.stringify({
      'sample-book': {
        title: '《Sample Book》读书笔记',
        date: '2025-03-03T00:00:00.000Z',
      },
      'STR-Four-Vector-Basic-Transformation': {
        title: '如何用四维矢量来解决狭义相对论问题（基础的时空与碰撞的变换）',
        date: '2025-07-20T10:58:41.139Z',
      },
      'STR-Four-Vector-Electromagnetism-and-Dynamics': {
        title: '如何用四维矢量来解决狭义相对论问题（电磁学与动力学）',
        date: '2025-10-19T00:20:14.881Z',
      },
    }))

    const result = await importPersonalContent({
      outputDir,
      personalDir,
      publicDir,
      xlogMappingPath,
    })

    expect(result.importedBooks).toEqual(['sample-book'])
    expect(result.importedPosts).toEqual([
      'STR-Four-Vector-Basic-Transformation',
      'STR-Four-Vector-Electromagnetism-and-Dynamics',
    ])
    expect(result.copiedAssets).toEqual(['STR-Four-Vector-Basic-Transformation/pair_annihilation_hd.gif'])

    const bookPath = join(outputDir, 'pages/books/sample-book.md')
    const firstPostPath = join(outputDir, 'pages/posts/STR-Four-Vector-Basic-Transformation.md')
    const secondPostPath = join(outputDir, 'pages/posts/STR-Four-Vector-Electromagnetism-and-Dynamics.md')
    const assetPath = join(outputDir, 'public/article-assets/STR-Four-Vector-Basic-Transformation/pair_annihilation_hd.gif')

    await expect(stat(bookPath)).resolves.toBeTruthy()
    await expect(stat(firstPostPath)).resolves.toBeTruthy()
    await expect(stat(secondPostPath)).resolves.toBeTruthy()
    await expect(stat(assetPath)).resolves.toBeTruthy()

    const bookContent = await readFile(bookPath, 'utf8')
    expect(bookContent).toContain('title: "《Sample Book》读书笔记"')
    expect(bookContent).toContain('slug: "sample-book"')
    expect(bookContent).toContain('date: "2025-03-03T00:00:00.000Z"')
    expect(bookContent).toContain('summary: "This is a long summary. It continues on the next line."')

    const firstPostContent = await readFile(firstPostPath, 'utf8')
    expect(firstPostContent).toContain('summary: "这里是摘要段落。"')
    expect(firstPostContent).toContain('![pair_annihilation_hd.gif](/article-assets/STR-Four-Vector-Basic-Transformation/pair_annihilation_hd.gif)')

    const secondPostContent = await readFile(secondPostPath, 'utf8')
    expect(secondPostContent).toContain('[上一篇文章](/posts/STR-Four-Vector-Basic-Transformation)')
  })
})
