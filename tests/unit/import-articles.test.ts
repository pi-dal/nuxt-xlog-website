import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { importArticles } from '../../scripts/import-articles'

const fixturesDir = join(process.cwd(), 'tests/fixtures/articles')
const createdDirs: string[] = []

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map(dir => import('fs-extra').then(fs => fs.remove(dir))))
})

describe('importArticles', () => {
  it('imports published posts, keeps drafts as local markdown, rewrites assets, and skips untitled files', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'import-articles-'))
    createdDirs.push(outputDir)

    const result = await importArticles({
      csvPath: join(fixturesDir, 'export.csv'),
      sourceDir: fixturesDir,
      outputDir,
      publicDir: join(outputDir, 'public'),
    })

    expect(result.importedPosts).toEqual(['2022-Hunan-Travelling'])
    expect(result.importedPages).toEqual(['about'])
    expect(result.importedDrafts).toEqual(['如何使用'])
    expect(result.skippedDrafts).toEqual([])
    expect(result.skippedUntitled).toHaveLength(1)

    const postPath = join(outputDir, 'pages/posts/2022-Hunan-Travelling.md')
    const draftPath = join(outputDir, 'drafts/posts/如何使用.md')
    const pagePath = join(outputDir, 'pages/about.md')
    const assetPath = join(outputDir, 'public/article-assets/2022-Hunan-Travelling/photo.jpeg')

    await expect(stat(postPath)).resolves.toBeTruthy()
    await expect(stat(draftPath)).resolves.toBeTruthy()
    await expect(stat(pagePath)).resolves.toBeTruthy()
    await expect(stat(assetPath)).resolves.toBeTruthy()

    const postContent = await readFile(postPath, 'utf8')
    expect(postContent).toContain('title: 2022湖南之旅')
    expect(postContent).toContain('slug: 2022-Hunan-Travelling')
    expect(postContent).toContain('summary: 2022年暑假我开始了湖南之旅')
    expect(postContent).toContain('tags:')
    expect(postContent).toContain('/article-assets/2022-Hunan-Travelling/photo.jpeg')

    const pageContent = await readFile(pagePath, 'utf8')
    expect(pageContent).toContain('title: About')
    expect(pageContent).toContain('type: page')
    const draftContent = await readFile(draftPath, 'utf8')
    expect(draftContent).toContain('title: iPod现代使用指北')
    expect(draftContent).toContain('slug: 如何使用')
    expect(draftContent).toContain('draft: true')
    await expect(stat(join(outputDir, 'pages/posts/如何使用.md'))).rejects.toThrow()

    await expect(stat(join(outputDir, 'pages/posts/Untitled.md'))).rejects.toThrow()
  })

  it('skips recreating the legacy about page when the homepage markdown already exists', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'import-articles-homepage-'))
    createdDirs.push(outputDir)

    await import('fs-extra').then(fs => fs.ensureDir(join(outputDir, 'pages')))
    await writeFile(join(outputDir, 'pages/index.md'), '# Home\n')

    const result = await importArticles({
      csvPath: join(fixturesDir, 'export.csv'),
      sourceDir: fixturesDir,
      outputDir,
      publicDir: join(outputDir, 'public'),
    })

    expect(result.importedPages).toEqual([])
    await expect(stat(join(outputDir, 'pages/about.md'))).rejects.toThrow()
  })
})
