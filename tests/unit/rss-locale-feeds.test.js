import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';
const execFileAsync = promisify(execFile);
const createdDirs = [];
async function writeMarkdown(rootDir, relativePath, content) {
    const fs = await import('fs-extra');
    const target = join(rootDir, relativePath);
    await fs.ensureDir(join(target, '..'));
    await writeFile(target, content);
}
afterEach(async () => {
    await Promise.all(createdDirs.splice(0).map(dir => import('fs-extra').then(fs => fs.remove(dir))));
});
describe('locale rss feeds', () => {
    it('ships english and japanese feeds with localized post and book content', async () => {
        const rootDir = await mkdtemp(join(tmpdir(), 'rss-locale-content-'));
        const distDir = await mkdtemp(join(tmpdir(), 'rss-locale-dist-'));
        createdDirs.push(rootDir, distDir);
        await writeMarkdown(rootDir, 'pages/posts/knowledge-flow.md', `---
lang: zh
title: 知流
slug: knowledge-flow
type: post
date: 2026-06-08
summary: 中文文章
---

中文正文
`);
        await writeMarkdown(rootDir, 'pages/en/posts/knowledge-flow.md', `---
lang: en
title: The Knowledge Flow
slug: knowledge-flow
type: post
date: 2026-06-08
summary: English article
---

English body
`);
        await writeMarkdown(rootDir, 'pages/ja/posts/knowledge-flow.md', `---
lang: ja
title: 知流
slug: knowledge-flow
type: post
date: 2026-06-08
summary: 日本語記事
---

日本語本文
`);
        await writeMarkdown(rootDir, 'pages/books/information-networks.md', `---
lang: zh
title: 信息网络简史
slug: information-networks
type: book
date: 2026-06-07
summary: 中文读书笔记
---

中文读书笔记正文
`);
        await writeMarkdown(rootDir, 'pages/en/books/information-networks.md', `---
lang: en
title: Information Networks
slug: information-networks
type: book
date: 2026-06-07
summary: English reading note
---

English reading note body
`);
        await writeMarkdown(rootDir, 'pages/ja/books/information-networks.md', `---
lang: ja
title: 情報ネットワーク
slug: information-networks
type: book
date: 2026-06-07
summary: 日本語の読書ノート
---

日本語の読書ノート本文
`);
        await execFileAsync('pnpm', ['exec', 'tsx', './scripts/rss.ts'], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                CONTENT_ROOT_DIR: rootDir,
                PUBLISH_DIST_DIR: distDir,
            },
        });
        const enFeed = await readFile(join(distDir, 'en/feed.xml'), 'utf-8');
        const jaFeed = await readFile(join(distDir, 'ja/feed.xml'), 'utf-8');
        const enBooksFeed = await readFile(join(distDir, 'en/books-feed.xml'), 'utf-8');
        const jaBooksFeed = await readFile(join(distDir, 'ja/books-feed.xml'), 'utf-8');
        expect(enFeed).toContain('The Knowledge Flow');
        expect(enFeed).toContain('Information Networks');
        expect(enFeed).toContain('English reading note body');
        expect(jaFeed).toContain('情報ネットワーク');
        expect(jaFeed).toContain('日本語の読書ノート本文');
        expect(enBooksFeed).toContain('Information Networks');
        expect(enBooksFeed).toContain('English reading note body');
        expect(jaBooksFeed).toContain('情報ネットワーク');
        expect(jaBooksFeed).toContain('日本語の読書ノート本文');
    });
    it('exposes locale-specific books feeds in the rss menu source', async () => {
        const source = await readFile(join(process.cwd(), 'src/components/RSSMenu.vue'), 'utf-8');
        expect(source).toContain('const currentFeedPrefix = computed');
        expect(source).toContain('const currentBooksFeed = computed');
        expect(source).toContain(':href="currentBooksFeed"');
        expect(source).toContain('href="/zh/books-feed.xml"');
        expect(source).toContain('href="/en/books-feed.xml"');
        expect(source).toContain('href="/ja/books-feed.xml"');
    });
});
