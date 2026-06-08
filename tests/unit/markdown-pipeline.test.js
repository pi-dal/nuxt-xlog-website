import MarkdownIt from 'markdown-it';
import { describe, expect, it } from 'vitest';
import { applyMarkdownPipeline, buildMarkdownPipelineConfig, convertIpfsUrls } from '~/logics/markdown-pipeline';
describe('markdown pipeline', () => {
    it('normalizes ipfs urls to the crossbell gateway', () => {
        const markdown = [
            '![cover](ipfs://bafy-test-cid)',
            '![legacy](https://ipfs.io/ipfs/QmLegacyCid)',
        ].join('\n');
        expect(convertIpfsUrls(markdown)).toContain('https://ipfs.crossbell.io/ipfs/bafy-test-cid');
        expect(convertIpfsUrls(markdown)).toContain('https://ipfs.crossbell.io/ipfs/QmLegacyCid');
    });
    it('defaults twoslash off unless explicitly enabled', () => {
        const defaultConfig = buildMarkdownPipelineConfig();
        const explicitConfig = buildMarkdownPipelineConfig({ enableTwoslash: true });
        expect(defaultConfig.markdownItOptions.quotes).toBe('""\'\'');
        expect(defaultConfig.shiki.transformers).toHaveLength(3);
        expect(explicitConfig.shiki.transformers).toHaveLength(4);
    });
    it('keeps twoslash disabled when explicitly set to false', () => {
        const config = buildMarkdownPipelineConfig({ enableTwoslash: false });
        expect(config.shiki.transformers).toHaveLength(3);
    });
    it('maps obsidian abstract callouts to supported github alerts', async () => {
        const md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
            quotes: '""\'\'',
        });
        await applyMarkdownPipeline(md);
        const html = md.render('> [!abstract] Summary\n> body\n');
        expect(html).toContain('markdown-alert');
        expect(html).toContain('markdown-alert-note');
        expect(html).not.toContain('[!abstract]');
    });
});
