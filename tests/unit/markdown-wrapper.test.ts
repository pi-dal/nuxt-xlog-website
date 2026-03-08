import { describe, expect, it } from 'vitest'

import { resolveMarkdownWrapperClasses, resolveMarkdownWrapperComponent } from '~/logics/markdown-wrapper'

describe('markdown wrapper resolution', () => {
  it('uses the demo wrapper for demo markdown', () => {
    expect(resolveMarkdownWrapperComponent('/project/demo/example.md', '')).toBe('WrapperDemo')
  })

  it('uses the post wrapper for normal markdown pages', () => {
    expect(resolveMarkdownWrapperComponent('/project/pages/posts/example.md', '')).toBe('WrapperPost')
    expect(resolveMarkdownWrapperClasses('/project/pages/posts/example.md', 'plain content')).toBe('prose m-auto slide-enter-content')
  })

  it('keeps prose classes for chunked markdown sections while skipping WrapperPost', () => {
    const id = '/project/src/content/chunked-posts/example/01-section.md'

    expect(resolveMarkdownWrapperComponent(id, '')).toBeNull()
    expect(resolveMarkdownWrapperClasses(id, 'plain content')).toBe('prose m-auto slide-enter-content')
  })

  it('keeps full-width markdown pages wrapper-free when requested in source', () => {
    expect(resolveMarkdownWrapperClasses('/project/pages/posts/example.md', '@layout-full-width')).toBe('')
  })
})
