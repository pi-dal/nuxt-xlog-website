import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { resolveMarkdownRoutePath, resolvePathBasedRoutePath } from './content-route-path';
import { buildAbsoluteUrl } from './site-meta';
const IGNORED_MARKDOWN_FILES = new Set([
    '[...404].vue',
]);
function normalizePath(path) {
    if (!path)
        return '/';
    return path.startsWith('/') ? path : `/${path}`;
}
function removeExtension(path) {
    return path.replace(/\.(md|vue)$/i, '');
}
function toRootRelativePagePath(rootDir, filePath) {
    return relative(resolve(rootDir, 'pages'), filePath).replace(/\\/g, '/');
}
function extractRouteFrontmatter(raw) {
    const routeMatch = raw.match(/<route\s+lang="yaml">([\s\S]*?)<\/route>/);
    if (!routeMatch)
        return {};
    const fmLine = routeMatch[1].match(/frontmatter:\s*\n([\s\S]*?)(?:^\s\S|\n\n|\n$)/m);
    if (!fmLine)
        return {};
    const frontmatter = {};
    for (const line of fmLine[1].split('\n')) {
        const match = line.match(/^\s+(\w+):\s*(.*)/);
        if (!match)
            continue;
        const [, key, rawValue] = match;
        frontmatter[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
    }
    return frontmatter;
}
function titleFromPath(path) {
    const slug = path.split('/').pop() || '';
    return slug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}
function resolveVueRoutePath(rootDir, filePath, frontmatter = {}) {
    const relativePath = toRootRelativePagePath(rootDir, filePath);
    if (IGNORED_MARKDOWN_FILES.has(relativePath))
        return null;
    const withoutExtension = removeExtension(relativePath);
    if (withoutExtension.includes('['))
        return null;
    return normalizePath(resolvePathBasedRoutePath({
        filePath,
        frontmatter,
        rootDir,
    }));
}
export async function collectCanonicalRouteEntries(options = {}) {
    const rootDir = options.rootDir || process.cwd();
    const markdownFiles = await fg(['pages/**/*.md'], {
        absolute: true,
        cwd: rootDir,
    });
    const vueFiles = await fg(['pages/**/*.vue'], {
        absolute: true,
        cwd: rootDir,
    });
    const markdownEntries = await Promise.all(markdownFiles.map(async (filePath) => {
        const raw = await readFile(filePath, 'utf8');
        // Vue-enhanced .md files without frontmatter (start with <script setup> or <template>)
        // handle them like .vue files using path-based route resolution
        if (raw.startsWith('<script') || raw.startsWith('<template')) {
            const frontmatter = extractRouteFrontmatter(raw);
            const path = resolveVueRoutePath(rootDir, filePath, frontmatter);
            if (!path)
                return null;
            return {
                path,
                title: frontmatter.title || titleFromPath(path),
                description: frontmatter.summary,
                type: 'content',
            };
        }
        const parsed = matter(raw);
        const frontmatter = parsed.data;
        if (frontmatter.draft)
            return null;
        let path;
        try {
            path = resolveMarkdownRoutePath({
                filePath,
                frontmatter,
                rootDir,
            });
        }
        catch {
            // Skip files that can't resolve a route path
            return null;
        }
        return {
            path,
            title: frontmatter.title,
            description: frontmatter.summary,
            type: (frontmatter.date || ['book', 'post'].includes(frontmatter.type || ''))
                ? 'content'
                : 'page',
        };
    }));
    const vueEntries = await Promise.all(vueFiles
        .map(async (filePath) => {
        const raw = await readFile(filePath, 'utf8');
        const frontmatter = extractRouteFrontmatter(raw);
        const path = resolveVueRoutePath(rootDir, filePath, frontmatter);
        if (!path)
            return null;
        return {
            path,
            title: frontmatter.title || titleFromPath(path),
            description: frontmatter.summary,
            type: 'content',
        };
    }));
    const deduped = new Map();
    for (const entry of [...markdownEntries, ...vueEntries]) {
        if (!entry)
            continue;
        deduped.set(entry.path, entry);
    }
    return [...deduped.values()].sort((a, b) => a.path.localeCompare(b.path));
}
export async function collectCanonicalUrls(baseUrl, options = {}) {
    const entries = await collectCanonicalRouteEntries(options);
    const urls = new Set([
        buildAbsoluteUrl(baseUrl, '/'),
    ]);
    for (const entry of entries) {
        urls.add(buildAbsoluteUrl(baseUrl, entry.path));
        const segments = entry.path.split('/').filter(Boolean);
        if (segments.length >= 2) {
            urls.add(buildAbsoluteUrl(baseUrl, `/${segments[0]}/`));
            if (['zh', 'en', 'ja'].includes(segments[0]) && ['posts', 'books'].includes(segments[1]))
                urls.add(buildAbsoluteUrl(baseUrl, `/${segments[0]}/${segments[1]}`));
        }
    }
    return [...urls];
}
