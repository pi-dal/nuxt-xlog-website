/**
 * Generates src/content/content-entries.ts with all content entries
 * including locale pages. This data is used by useContentRoutes
 * instead of relying on lazy-loaded route meta at runtime.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { resolveMarkdownRoutePath, resolvePathBasedRoutePath } from '~/logics/content-route-path';
/** Check if file is a collection index page (e.g., posts/index.md) */
function isIndexFile(filePath) {
    return /\/index\.[a-z]+$/i.test(filePath);
}
function isLocalePath(segs) {
    return segs.length >= 1 && ['en', 'zh', 'ja'].includes(segs[0]);
}
function upsertEntry(entries, entry, priority) {
    const existing = entries.get(entry.path);
    if (!existing || priority > existing.priority)
        entries.set(entry.path, { entry, priority });
}
/**
 * Extract metadata from a content file.
 * Handles:
 * - Standard .md files with YAML frontmatter (---
 * - .vue files with <route lang="yaml"> blocks
 */
function extractMeta(filePath) {
    try {
        const raw = readFileSync(filePath, 'utf8');
        // Standard YAML frontmatter
        if (raw.startsWith('---')) {
            const { data } = matter(raw);
            return { slug: data.slug || null, fm: data };
        }
        // .vue files: parse <route lang="yaml"> blocks for frontmatter
        if (filePath.endsWith('.vue')) {
            const routeMatch = raw.match(/<route\s+lang="yaml">([\s\S]*?)<\/route>/);
            if (routeMatch) {
                const yaml = routeMatch[1];
                // Extract frontmatter fields from YAML
                const fmLine = yaml.match(/frontmatter:\s*\n([\s\S]*?)(?:^\s\S|\n\n|\n$)/m);
                if (fmLine) {
                    const fmBlock = fmLine[1];
                    const fm = {};
                    for (const line of fmBlock.split('\n')) {
                        const match = line.match(/^\s+(\w+):\s*(.*)/);
                        if (match) {
                            const val = match[2].trim();
                            // Remove quotes
                            fm[match[1]] = val.replace(/^['"]|['"]$/g, '');
                        }
                    }
                    return { slug: fm.slug || null, fm };
                }
            }
        }
    }
    catch { }
    // Fall back to filename
    const name = filePath.split('/').pop() || '';
    return { slug: name.replace(/\.(md|vue)$/, ''), fm: {} };
}
async function run() {
    const rootDir = process.cwd();
    const outDir = resolve(rootDir, 'src/content');
    const entries = new Map();
    // Scan all locale content files
    const patterns = [
        'pages/posts/*.md',
        'pages/posts/*.vue',
        'pages/zh/posts/*.md',
        'pages/zh/posts/*.vue',
        'pages/en/posts/*.md',
        'pages/en/posts/*.vue',
        'pages/ja/posts/*.md',
        'pages/ja/posts/*.vue',
        'pages/books/*.md',
        'pages/zh/books/*.md',
        'pages/en/books/*.md',
        'pages/ja/books/*.md',
    ];
    for (const pattern of patterns) {
        const files = await fg.glob(pattern, { cwd: rootDir });
        for (const file of files) {
            const absPath = resolve(rootDir, file);
            // Skip collection index files (posts/index.md, etc.)
            if (isIndexFile(file))
                continue;
            const { slug, fm } = extractMeta(absPath);
            if (!slug)
                continue;
            // Determine locale and collection from path
            const relPath = file.replace(/^pages\//, '');
            const segs = relPath.split('/');
            const localePath = isLocalePath(segs);
            const pathLocale = localePath ? segs[0] : 'zh';
            // Collection is segs[0] for root paths (posts/xxx), segs[1] for locale paths (zh/posts/xxx)
            const collection = localePath
                ? (segs[1] || 'posts')
                : (['posts', 'books'].includes(segs[0]) ? segs[0] : 'posts');
            const path = file.endsWith('.vue')
                ? resolvePathBasedRoutePath({
                    filePath: absPath,
                    frontmatter: fm,
                    rootDir,
                })
                : resolveMarkdownRoutePath({
                    filePath: absPath,
                    frontmatter: fm,
                    rootDir,
                });
            const entry = {
                ...(fm.draft ? { draft: true } : {}),
                path,
                title: fm.title || slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                slug,
                lang: fm.lang || pathLocale,
                date: fm.date || '',
                summary: fm.summary || '',
                type: fm.type || 'post',
                collection,
            };
            upsertEntry(entries, entry, localePath ? 2 : 1);
        }
    }
    // Generate TypeScript file with the entries array
    const ts = `/* eslint-disable style/quote-props, style/quotes, style/comma-dangle */
// Auto-generated by scripts/generate-content-entries.ts
// Do not edit manually. Run \`pnpm build\` to regenerate.

export interface StaticContentEntry {
  draft?: boolean
  path: string
  title: string
  slug: string
  lang: string
  date: string
  summary: string
  type: string
  collection: string
}

export const contentEntries: StaticContentEntry[] = ${JSON.stringify([...entries.values()].map(({ entry }) => entry), null, 2)}
`;
    writeFileSync(`${outDir}/content-entries.ts`, ts, 'utf8');
    console.log(`✅ Generated ${entries.size} content entries in src/content/content-entries.ts`);
}
void run();
