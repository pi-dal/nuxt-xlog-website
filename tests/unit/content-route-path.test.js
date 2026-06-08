import { describe, expect, it } from 'vitest';
import { resolveMarkdownRoutePath, resolveRoutePathOverride } from '~/logics/content-route-path';
describe('resolveRoutePathOverride', () => {
    it('uses locale-prefixed canonical paths for legacy root collection content', () => {
        expect(resolveRoutePathOverride({
            filePath: '/workspace/pages/posts/legacy-file-name.md',
            frontmatter: {
                slug: 'nas-from-frontmatter',
            },
            rootDir: '/workspace',
        })).toBe('/zh/posts/nas-from-frontmatter');
        expect(resolveRoutePathOverride({
            filePath: '/workspace/pages/books/legacy-file-name.md',
            frontmatter: {
                slug: 'book-from-frontmatter',
            },
            rootDir: '/workspace',
        })).toBe('/zh/books/book-from-frontmatter');
        expect(resolveRoutePathOverride({
            filePath: '/workspace/pages/about.md',
            frontmatter: {
                slug: 'about-me',
            },
            rootDir: '/workspace',
        })).toBe('/about-me');
        expect(resolveRoutePathOverride({
            filePath: '/workspace/pages/posts/index.md',
            frontmatter: {
                slug: 'posts',
            },
            rootDir: '/workspace',
        })).toBe('/zh/posts');
        expect(() => resolveRoutePathOverride({
            filePath: '/workspace/pages/posts/legacy-file-name.md',
            frontmatter: {},
            rootDir: '/workspace',
        })).toThrow(/slug/i);
        expect(resolveMarkdownRoutePath({
            filePath: '/workspace/pages/posts/legacy-file-name.md',
            frontmatter: {
                slug: 'nas-from-frontmatter',
            },
            rootDir: '/workspace',
        })).toBe('/zh/posts/nas-from-frontmatter');
        expect(resolveMarkdownRoutePath({
            filePath: '/workspace/pages/about.md',
            frontmatter: {
                slug: 'about-me',
            },
            rootDir: '/workspace',
        })).toBe('/about-me');
        expect(resolveMarkdownRoutePath({
            filePath: '/workspace/pages/posts/index.md',
            frontmatter: {
                slug: 'posts',
            },
            rootDir: '/workspace',
        })).toBe('/zh/posts');
        expect(resolveMarkdownRoutePath({
            filePath: '/workspace/pages/zh/posts/localized-file-name.md',
            frontmatter: {
                slug: 'localized-from-frontmatter',
            },
            rootDir: '/workspace',
        })).toBe('/zh/posts/localized-from-frontmatter');
        expect(() => resolveMarkdownRoutePath({
            filePath: '/workspace/pages/posts/legacy-file-name.md',
            frontmatter: {},
            rootDir: '/workspace',
        })).toThrow(/slug/i);
    });
});
