import { describe, expect, it } from 'vitest';
import { contentEntries } from '~/content/content-entries';
describe('content entries', () => {
    it('loads content entries from build-time manifest with proper metadata', () => {
        // Verify the manifest has all expected entries
        expect(contentEntries.length).toBeGreaterThan(20);
        // Check EN posts exist with real titles and dates
        const enPosts = contentEntries.filter(e => e.lang === 'en' && e.collection === 'posts' && e.slug !== 'posts');
        expect(enPosts.length).toBeGreaterThanOrEqual(6);
        expect(enPosts.some(e => e.title.includes('ArozOS'))).toBe(true);
        expect(enPosts.some(e => e.date && e.date.length > 0)).toBe(true);
        // Check JA posts exist
        const jaPosts = contentEntries.filter(e => e.lang === 'ja' && e.collection === 'posts' && e.slug !== 'posts');
        expect(jaPosts.length).toBeGreaterThanOrEqual(6);
        expect(jaPosts.some(e => e.date && e.date.length > 0)).toBe(true);
        // Check ZH posts exist
        const zhPosts = contentEntries.filter(e => e.lang === 'zh' && e.collection === 'posts' && e.slug !== 'posts');
        expect(zhPosts.length).toBeGreaterThanOrEqual(6);
    });
    it('publishes zh posts and books only through locale-prefixed canonical paths', () => {
        const zhPosts = contentEntries.filter(e => e.lang === 'zh' && e.collection === 'posts' && e.slug !== 'posts');
        const zhBooks = contentEntries.filter(e => e.lang === 'zh' && e.collection === 'books' && e.slug !== 'books');
        expect(zhPosts.length).toBeGreaterThanOrEqual(6);
        expect(zhBooks.length).toBeGreaterThanOrEqual(80);
        expect(zhPosts.every(entry => entry.path.startsWith('/zh/posts/'))).toBe(true);
        expect(zhBooks.every(entry => entry.path.startsWith('/zh/books/'))).toBe(true);
        expect(contentEntries.some(entry => entry.path.startsWith('/posts/'))).toBe(false);
        expect(contentEntries.some(entry => entry.path.startsWith('/books/'))).toBe(false);
    });
});
