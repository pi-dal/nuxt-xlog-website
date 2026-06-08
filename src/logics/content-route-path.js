import { relative, resolve } from 'node:path';
function normalizeSlug(slug) {
    const normalized = slug?.trim().replace(/^\/+|\/+$/g, '');
    return normalized || undefined;
}
function requireSlug(filePath, frontmatter) {
    const slug = normalizeSlug(frontmatter.slug);
    if (slug)
        return slug;
    throw new Error(`Missing frontmatter slug for ${filePath}`);
}
function isIndexFile(filePath) {
    return /\/index\.(?:md|vue)$/i.test(filePath.replace(/\\/g, '/'));
}
function toRootRelativeMarkdownPath(rootDir, filePath) {
    return relative(resolve(rootDir, 'pages'), filePath).replace(/\\/g, '/');
}
function removePageExtension(path) {
    return path.replace(/\.(md|vue)$/i, '');
}
export function isLegacyRootCollectionPath(relativePath) {
    return /^(?:posts|books)(?:\/|$)/.test(relativePath);
}
function localeFromFrontmatter(frontmatter) {
    return typeof frontmatter.lang === 'string' && frontmatter.lang.trim()
        ? frontmatter.lang.trim()
        : 'zh';
}
function toCanonicalContentPath(relativePath, frontmatter, slug) {
    const segments = relativePath.split('/');
    if (isLegacyRootCollectionPath(relativePath)) {
        segments.unshift(localeFromFrontmatter(frontmatter));
    }
    if (slug)
        segments[segments.length - 1] = slug;
    return `/${segments.join('/')}`.replace(/\/+/g, '/');
}
export function resolvePathBasedRoutePath(options) {
    const rootDir = options.rootDir || process.cwd();
    const relativePath = removePageExtension(toRootRelativeMarkdownPath(rootDir, options.filePath));
    return toCanonicalContentPath(relativePath, options.frontmatter);
}
export function resolveRoutePathOverride(options) {
    const rootDir = options.rootDir || process.cwd();
    const relativePath = toRootRelativeMarkdownPath(rootDir, options.filePath);
    if (isIndexFile(options.filePath) && !isLegacyRootCollectionPath(relativePath))
        return undefined;
    return resolveMarkdownRoutePath(options);
}
export function resolveMarkdownRoutePath(options) {
    const rootDir = options.rootDir || process.cwd();
    const relativePath = toRootRelativeMarkdownPath(rootDir, options.filePath);
    if (isIndexFile(options.filePath)) {
        const clean = relativePath.replace(/\/?index\.(?:md|vue)$/i, '');
        return clean ? toCanonicalContentPath(clean, options.frontmatter) : '/';
    }
    const slug = requireSlug(options.filePath, options.frontmatter);
    return toCanonicalContentPath(relativePath, options.frontmatter, slug);
}
