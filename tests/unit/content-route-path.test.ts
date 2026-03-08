import { describe, expect, it } from 'vitest'

import { resolveMarkdownRoutePath, resolveRoutePathOverride } from '~/logics/content-route-path'

describe('resolveRoutePathOverride', () => {
  it('uses frontmatter slug for content pages but preserves index routes', () => {
    expect(resolveRoutePathOverride({
      filePath: '/workspace/pages/posts/legacy-file-name.md',
      frontmatter: {
        slug: 'nas-from-frontmatter',
      },
      rootDir: '/workspace',
    })).toBe('/posts/nas-from-frontmatter')

    expect(resolveRoutePathOverride({
      filePath: '/workspace/pages/about.md',
      frontmatter: {
        slug: 'about-me',
      },
      rootDir: '/workspace',
    })).toBe('/about-me')

    expect(resolveRoutePathOverride({
      filePath: '/workspace/pages/posts/index.md',
      frontmatter: {
        slug: 'posts',
      },
      rootDir: '/workspace',
    })).toBeUndefined()

    expect(() => resolveRoutePathOverride({
      filePath: '/workspace/pages/posts/legacy-file-name.md',
      frontmatter: {},
      rootDir: '/workspace',
    })).toThrow(/slug/i)

    expect(resolveMarkdownRoutePath({
      filePath: '/workspace/pages/posts/legacy-file-name.md',
      frontmatter: {
        slug: 'nas-from-frontmatter',
      },
      rootDir: '/workspace',
    })).toBe('/posts/nas-from-frontmatter')

    expect(resolveMarkdownRoutePath({
      filePath: '/workspace/pages/about.md',
      frontmatter: {
        slug: 'about-me',
      },
      rootDir: '/workspace',
    })).toBe('/about-me')

    expect(resolveMarkdownRoutePath({
      filePath: '/workspace/pages/posts/index.md',
      frontmatter: {
        slug: 'posts',
      },
      rootDir: '/workspace',
    })).toBe('/posts')

    expect(() => resolveMarkdownRoutePath({
      filePath: '/workspace/pages/posts/legacy-file-name.md',
      frontmatter: {},
      rootDir: '/workspace',
    })).toThrow(/slug/i)
  })
})
