import { dirname } from 'node:path';
import { Feed } from 'feed';
import fs from 'fs-extra';
import { loadMarkdownContentEntries } from '~/content/files';
import { collectCanonicalUrls } from '~/logics/agent-readiness-build';
import { siteConfig } from '~/site/config';
const AUTHOR = {
    name: siteConfig.author.name,
    link: siteConfig.url,
};
const contentRootDir = process.env.CONTENT_ROOT_DIR || process.cwd();
const distDir = process.env.PUBLISH_DIST_DIR || './dist';
function createFeedOptions(title, description, path, feedPath) {
    return {
        title,
        description,
        id: `${siteConfig.url}${path}`,
        link: `${siteConfig.url}${path}`,
        copyright: `CC BY-NC-SA 4.0 ${new Date().getFullYear()} © ${siteConfig.author.name}`,
        feedLinks: {
            rss: `${siteConfig.url}${feedPath}`,
        },
    };
}
function escapeXml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll('\'', '&apos;');
}
async function loadFeedItems(patterns, lang) {
    const entries = await loadMarkdownContentEntries({
        baseUrl: siteConfig.url,
        patterns,
        rootDir: contentRootDir,
    });
    return entries
        .filter(entry => !entry.filePath.endsWith('/index.md'))
        .filter(entry => !lang || entry.frontmatter.lang === lang)
        .map(entry => ({
        title: entry.frontmatter.title,
        id: entry.url,
        link: entry.url,
        description: entry.frontmatter.summary || '',
        content: entry.html,
        author: [AUTHOR],
        date: new Date(entry.frontmatter.date || new Date()),
        image: entry.frontmatter.image,
    }))
        .sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0));
}
function sortItems(items) {
    return items.sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0));
}
async function writeSitemap(urls) {
    const uniqueUrls = [...new Set(urls)];
    const content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...uniqueUrls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`),
        '</urlset>',
        '',
    ].join('\n');
    await fs.ensureDir(distDir);
    await fs.writeFile(`${distDir}/sitemap.xml`, content, 'utf-8');
}
async function writeFeed(name, options, items) {
    const feed = new Feed({
        ...options,
        author: AUTHOR,
        image: `${siteConfig.url}${siteConfig.avatar}`,
        favicon: `${siteConfig.url}/favicon.png`,
    });
    items.forEach(item => feed.addItem(item));
    await fs.ensureDir(dirname(`${distDir}/${name}.xml`));
    await fs.writeFile(`${distDir}/${name}.xml`, feed.rss2(), 'utf-8');
    await fs.writeFile(`${distDir}/${name}.atom`, feed.atom1(), 'utf-8');
    await fs.writeFile(`${distDir}/${name}.json`, feed.json1(), 'utf-8');
}
export async function buildFeeds() {
    // Original content feeds (Chinese originals only, no locale duplicates)
    const chPostPatterns = ['pages/posts/*.md', 'pages/posts/*.vue', 'pages/zh/posts/*.md', 'pages/zh/posts/*.vue'];
    const chBookPatterns = ['pages/books/*.md', 'pages/zh/books/*.md'];
    const localePostPatterns = ['pages/posts/*.md', 'pages/posts/*.vue', 'pages/zh/posts/*.md', 'pages/zh/posts/*.vue', 'pages/en/posts/*.md', 'pages/en/posts/*.vue', 'pages/ja/posts/*.md', 'pages/ja/posts/*.vue'];
    const localeBookPatterns = ['pages/books/*.md', 'pages/zh/books/*.md', 'pages/en/books/*.md', 'pages/ja/books/*.md'];
    const [chPostItems, bookItems] = await Promise.all([
        loadFeedItems(chPostPatterns, 'zh'),
        loadFeedItems(chBookPatterns, 'zh'),
    ]);
    const allItems = sortItems([...chPostItems, ...bookItems]);
    const [zhPostItems, enPostItems, jaPostItems, zhBookItems, enBookItems, jaBookItems] = await Promise.all([
        loadFeedItems(localePostPatterns, 'zh'),
        loadFeedItems(localePostPatterns, 'en'),
        loadFeedItems(localePostPatterns, 'ja'),
        loadFeedItems(localeBookPatterns, 'zh'),
        loadFeedItems(localeBookPatterns, 'en'),
        loadFeedItems(localeBookPatterns, 'ja'),
    ]);
    const zhItems = sortItems([...zhPostItems, ...zhBookItems]);
    const enItems = sortItems([...enPostItems, ...enBookItems]);
    const jaItems = sortItems([...jaPostItems, ...jaBookItems]);
    // Combined feeds (original Chinese content only)
    await writeFeed('feed', createFeedOptions(siteConfig.title, `${siteConfig.author.name}'s blog and reading notes`, '/', '/feed.xml'), allItems);
    await writeFeed('blog-feed', createFeedOptions(`${siteConfig.author.name} - Blog Posts`, `${siteConfig.author.name}'s blog posts`, '/zh/posts/', '/blog-feed.xml'), chPostItems);
    await writeFeed('books-feed', createFeedOptions(`${siteConfig.author.name} - Reading Notes`, `${siteConfig.author.name}'s reading notes`, '/zh/books/', '/books-feed.xml'), bookItems);
    // Language-specific combined content feeds
    await writeFeed('zh/feed', createFeedOptions(`${siteConfig.author.name} - 中文内容`, 'pi-dal 的中文博客与读书笔记', '/zh/', '/zh/feed.xml'), zhItems);
    await writeFeed('en/feed', createFeedOptions(`${siteConfig.author.name} - English Content`, 'English blog posts and reading notes from pi-dal', '/en/', '/en/feed.xml'), enItems);
    await writeFeed('ja/feed', createFeedOptions(`${siteConfig.author.name} - 日本語コンテンツ`, 'pi-dal の日本語ブログ記事と読書ノート', '/ja/', '/ja/feed.xml'), jaItems);
    // Language-specific post-only feeds
    await writeFeed('zh/blog-feed', createFeedOptions(`${siteConfig.author.name} - 中文文章`, 'pi-dal 的中文博客文章', '/zh/posts/', '/zh/blog-feed.xml'), zhPostItems);
    await writeFeed('en/blog-feed', createFeedOptions(`${siteConfig.author.name} - English Posts`, 'English blog posts from pi-dal', '/en/posts/', '/en/blog-feed.xml'), enPostItems);
    await writeFeed('ja/blog-feed', createFeedOptions(`${siteConfig.author.name} - 日本語記事`, 'pi-dal の日本語ブログ記事', '/ja/posts/', '/ja/blog-feed.xml'), jaPostItems);
    // Language-specific book-only feeds
    await writeFeed('zh/books-feed', createFeedOptions(`${siteConfig.author.name} - 中文读书笔记`, 'pi-dal 的中文读书笔记', '/zh/books/', '/zh/books-feed.xml'), zhBookItems);
    await writeFeed('en/books-feed', createFeedOptions(`${siteConfig.author.name} - English Reading Notes`, 'English reading notes from pi-dal', '/en/books/', '/en/books-feed.xml'), enBookItems);
    await writeFeed('ja/books-feed', createFeedOptions(`${siteConfig.author.name} - 日本語読書ノート`, 'pi-dal の日本語読書ノート', '/ja/books/', '/ja/books-feed.xml'), jaBookItems);
    const canonicalUrls = await collectCanonicalUrls(siteConfig.url, {
        rootDir: contentRootDir,
    });
    await writeSitemap(canonicalUrls);
}
async function run() {
    console.log('🚀 Starting RSS generation...');
    await buildFeeds();
    console.log('✅ RSS generation completed!');
}
void run();
