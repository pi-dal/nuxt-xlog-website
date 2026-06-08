import { contentEntries } from '~/content/content-entries';
import { normalizeContentType } from '~/types/content';
export function useContentRoutes(options = {}) {
    const filtered = computed(() => {
        // Get all matching entries
        const all = contentEntries
            .filter(entry => !options.collection || entry.collection === options.collection)
            .filter(entry => !options.lang || entry.lang === options.lang)
            .filter(entry => !entry.draft)
            .map(entry => ({
            path: entry.path,
            title: entry.title,
            slug: entry.slug,
            lang: entry.lang,
            date: entry.date,
            summary: entry.summary,
            type: normalizeContentType(entry.type),
            tags: [],
            draft: false,
        }));
        // Deduplicate by slug: prefer locale-prefixed paths
        const bySlug = new Map();
        for (const entry of all) {
            // Always prefer locale-prefixed paths (/zh/posts/xxx > /posts/xxx)
            const existing = bySlug.get(entry.slug);
            if (!existing) {
                bySlug.set(entry.slug, entry);
            }
            else {
                const entryHasLocale = entry.path.split('/').filter(Boolean).length >= 2 && ['en', 'zh', 'ja'].includes(entry.path.split('/').filter(Boolean)[0]);
                const existingHasLocale = existing.path.split('/').filter(Boolean).length >= 2 && ['en', 'zh', 'ja'].includes(existing.path.split('/').filter(Boolean)[0]);
                // Only replace if the new entry has a locale prefix and the existing doesn't
                if (entryHasLocale && !existingHasLocale) {
                    bySlug.set(entry.slug, entry);
                }
            }
        }
        return [...bySlug.values()]
            .sort((a, b) => {
            if (!a.date && !b.date)
                return a.title.localeCompare(b.title);
            if (!a.date)
                return 1;
            if (!b.date)
                return -1;
            return +new Date(b.date) - +new Date(a.date);
        });
    });
    return filtered;
}
