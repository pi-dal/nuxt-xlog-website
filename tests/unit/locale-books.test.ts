import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'

function readFrontmatter(rel: string) {
  const raw = readFileSync(join(process.cwd(), rel), 'utf8')
  return matter(raw).data as Record<string, string>
}

function containsCJK(value: string | undefined) {
  return /[\u4E00-\u9FFF]/u.test(value || '')
}

function extractZhBookCoreTitle(title: string | undefined) {
  const match = (title || '').match(/^《(.+)》读书笔记$/)
  return match ? match[1] : (title || '')
}

function extractJaBookCoreTitle(title: string | undefined) {
  const match = (title || '').match(/^『(.+)』読書ノート$/)
  return match ? match[1] : (title || '')
}

describe('locale book metadata quality', () => {
  it('keeps english book titles and summaries out of Chinese', () => {
    const offenders: string[] = []
    const files = fg.sync('pages/en/books/*.md', { cwd: process.cwd() })
      .filter(file => !file.endsWith('/index.md'))

    for (const file of files) {
      const fm = readFrontmatter(file)
      if (containsCJK(fm.title) || containsCJK(fm.summary))
        offenders.push(file)
    }

    expect(offenders).toEqual([])
  })

  it('keeps japanese book metadata distinct from zh source and free of placeholder corruption', () => {
    const zhFiles = fg.sync('pages/books/*.md', { cwd: process.cwd() })
      .filter(file => !file.endsWith('/index.md'))
    const zhBySlug = new Map<string, { title: string, summary: string }>()

    for (const file of zhFiles) {
      const fm = readFrontmatter(file)
      zhBySlug.set(String(fm.slug), {
        title: String(fm.title || ''),
        summary: String(fm.summary || ''),
      })
    }

    const offenders: string[] = []
    const jaFiles = fg.sync('pages/ja/books/*.md', { cwd: process.cwd() })
      .filter(file => !file.endsWith('/index.md'))

    for (const file of jaFiles) {
      const fm = readFrontmatter(file)
      const zh = zhBySlug.get(String(fm.slug))
      if (!zh)
        continue

      const zhCoreTitle = extractZhBookCoreTitle(zh.title)
      const jaCoreTitle = extractJaBookCoreTitle(String(fm.title || ''))
      const summary = String(fm.summary || '')

      if (
        summary.includes('>-')
        || String(fm.title || '').includes('>-')
        || summary === zh.summary
        || (containsCJK(zhCoreTitle) && jaCoreTitle === zhCoreTitle)
      ) {
        offenders.push(file)
      }
    }

    expect(offenders).toEqual([])
  })
})
