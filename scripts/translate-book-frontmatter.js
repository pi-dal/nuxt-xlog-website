import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
const ALL_LOCALES = ['en', 'ja'];
function extractZhBookCoreTitle(title) {
    const match = title.match(/^《(.+)》读书笔记$/);
    return match ? match[1] : title.replace(/读书笔记$/, '').trim();
}
function wrapLocaleTitle(locale, coreTitle) {
    if (locale === 'en')
        return `${coreTitle} - Reading Notes`;
    return `『${coreTitle}』読書ノート`;
}
async function translateText(text, target) {
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', 'zh-CN');
    url.searchParams.set('tl', target);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', text);
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
        },
    });
    if (!response.ok)
        throw new Error(`translate failed (${target}): ${response.status}`);
    const payload = await response.json();
    return (payload[0] || []).map((chunk) => chunk[0]).join('').trim();
}
async function translateTextWithRetry(text, target, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await translateText(text, target);
        }
        catch (error) {
            lastError = error;
            if (attempt === attempts)
                break;
            await new Promise(resolve => setTimeout(resolve, attempt * 300));
        }
    }
    throw lastError;
}
function normalizeDate(value) {
    if (value instanceof Date)
        return value.toISOString();
    return String(value || '');
}
async function translateBook(source, locale) {
    const translatedCoreTitle = await translateTextWithRetry(extractZhBookCoreTitle(source.title), locale);
    const translatedSummary = await translateTextWithRetry(source.summary, locale);
    const outPath = resolve(process.cwd(), `pages/${locale}/books/${source.slug}.md`);
    const raw = readFileSync(outPath, 'utf8');
    const parsed = matter(raw);
    parsed.data.lang = locale;
    parsed.data.title = wrapLocaleTitle(locale, translatedCoreTitle);
    parsed.data.slug = source.slug;
    parsed.data.type = 'book';
    parsed.data.date = source.date;
    parsed.data.summary = translatedSummary;
    // Keep locale body placeholder minimal and locale-pure until full note translation exists.
    const body = locale === 'en' ? 'Reading notes.' : '読書ノート。';
    const next = matter.stringify(body, parsed.data);
    writeFileSync(outPath, next, 'utf8');
}
async function main() {
    const locales = process.argv.slice(2);
    const targetLocales = locales.length > 0 ? locales : ALL_LOCALES;
    const sourceFiles = fg.sync('pages/books/*.md', { cwd: process.cwd() });
    const sources = sourceFiles.map((file) => {
        const raw = readFileSync(resolve(process.cwd(), file), 'utf8');
        const parsed = matter(raw);
        return {
            date: normalizeDate(parsed.data.date),
            slug: String(parsed.data.slug || ''),
            summary: String(parsed.data.summary || ''),
            title: String(parsed.data.title || ''),
        };
    });
    for (const locale of targetLocales) {
        for (const source of sources) {
            if (!source.slug || !source.title || !source.summary)
                continue;
            console.log(`[${locale}] ${source.slug}`);
            await translateBook(source, locale);
        }
    }
}
void main();
