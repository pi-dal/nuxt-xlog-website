/**
 * Auto-translation pipeline for articles
 *
 * Scans source articles in `pages/posts/*.md` and checks which have
 * missing translations in `pages/en/posts/`, `pages/ja/posts/`.
 *
 * Usage: pnpm exec tsx scripts/translate-articles.ts
 *
 * For now, this shows missing translations. Actual LLM translation
 * requires an API key environment variable.
 */
import { existsSync, readFileSync } from 'node:fs';
import { globSync } from 'fast-glob';
import matter from 'gray-matter';
const SOURCE_DIR = 'pages/posts';
const TARGET_LOCALES = ['en', 'ja'];
function findMissingTranslations() {
    const sourceFiles = globSync(`${SOURCE_DIR}/*.md`, { cwd: process.cwd() })
        .filter(f => !f.endsWith('/index.md'));
    const missing = [];
    for (const file of sourceFiles) {
        const raw = readFileSync(file, 'utf8');
        if (raw.startsWith('<script'))
            continue;
        const { data } = matter(raw);
        if (data.draft)
            continue;
        const slug = data.slug;
        if (!slug)
            continue;
        for (const locale of TARGET_LOCALES) {
            const targetPath = `pages/${locale}/posts/${slug}.md`;
            if (!existsSync(targetPath)) {
                missing.push({
                    slug,
                    title: data.title || slug,
                    locale,
                    targetPath,
                });
            }
        }
    }
    return missing;
}
function main() {
    console.log('🔍 Checking for missing translations...');
    const missing = findMissingTranslations();
    if (missing.length === 0) {
        console.log('✅ All articles have translations for all target locales.');
        return;
    }
    console.log(`\n⚠️  ${missing.length} missing translations found:\n`);
    for (const m of missing) {
        console.log(`  [${m.locale}] ${m.title} → ${m.targetPath}`);
    }
    console.log('\nTo fill translations, create the target markdown files with:');
    console.log('  - Same slug, date, tags as source');
    console.log('  - Translated title, summary, and body');
    console.log('  - lang: en | ja in frontmatter');
}
main();
