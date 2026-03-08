import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'

describe('book summaries', () => {
  it('ensures every book page has a summary for the books index', async () => {
    const files = await fg('pages/books/*.md', { cwd: process.cwd(), absolute: true })
    const missing = files
      .filter(file => basename(file) !== 'index.md')
      .map((file) => {
        const { data } = matter(readFileSync(file, 'utf8'))
        return {
          file: basename(file),
          summary: typeof data.summary === 'string' ? data.summary.trim() : '',
        }
      })
      .filter(entry => !entry.summary)

    expect(missing).toEqual([])
  })
})
