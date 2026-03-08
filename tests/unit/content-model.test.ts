import { describe, expect, it } from 'vitest'

import { isContentType, normalizeContentType } from '~/types/content'

describe('content model', () => {
  it('normalizes known content types', () => {
    expect(normalizeContentType('post')).toBe('post')
    expect(normalizeContentType('Page')).toBe('page')
    expect(normalizeContentType('BOOK')).toBe('book')
  })

  it('rejects unsupported content types', () => {
    expect(() => normalizeContentType('portfolio')).toThrowError(/Unsupported content type/)
    expect(isContentType('portfolio')).toBe(false)
  })

  it('treats page entries as routable content without requiring a date', () => {
    expect(isContentType('page')).toBe(true)
  })
})
