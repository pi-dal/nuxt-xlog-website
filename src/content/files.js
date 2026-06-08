import { readFile } from 'node:fs/promises';
import fg from 'fast-glob';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { resolveMarkdownRoutePath } from '~/logics/content-route-path';
const markdown = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
});
function buildAbsoluteUrl(baseUrl, path) {
    if (/^https?:\/\//i.test(path))
        return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl.replace(/\/+$/, '')}${normalizedPath}`;
}
function absolutizeHtml(baseUrl, html) {
    return html
        .replace(/src="\/([^"]+)"/g, `src="${baseUrl.replace(/\/+$/, '')}/$1"`)
        .replace(/href="\/([^"]+)"/g, `href="${baseUrl.replace(/\/+$/, '')}/$1"`);
}
export async function loadMarkdownContentEntries(options) {
    const rootDir = options.rootDir || process.cwd();
    const filePaths = await fg(options.patterns, {
        cwd: rootDir,
        absolute: true,
    });
    const entries = await Promise.all(filePaths.map(async (filePath) => {
        const raw = await readFile(filePath, 'utf8');
        // Skip Vue-enhanced .md files without frontmatter (start with <script setup> or <template>)
        if (raw.startsWith('<script') || raw.startsWith('<template'))
            return null;
        const { data, content } = matter(raw);
        if (data.draft)
            return null;
        const routePath = resolveMarkdownRoutePath({
            filePath,
            frontmatter: data,
            rootDir,
        });
        const html = absolutizeHtml(options.baseUrl, markdown.render(content));
        return {
            filePath,
            content,
            html,
            url: buildAbsoluteUrl(options.baseUrl, routePath),
            frontmatter: data,
        };
    }));
    return entries.filter((entry) => Boolean(entry));
}
