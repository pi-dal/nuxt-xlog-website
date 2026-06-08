import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
const rootDir = resolve(__dirname, '../..');
describe('global performance guards', () => {
    it('keeps FloatingVue out of the global app shell', () => {
        const entry = readFileSync(resolve(rootDir, 'src/main.ts'), 'utf-8');
        expect(entry).not.toContain('import FloatingVue from \'floating-vue\'');
        expect(entry).not.toContain('import \'floating-vue/dist/style.css\'');
        expect(entry).not.toContain('app.use(FloatingVue)');
    });
    it('does not force-enable twoslash in the Vite markdown pipeline', () => {
        const viteConfig = readFileSync(resolve(rootDir, 'vite.config.ts'), 'utf-8');
        expect(viteConfig).not.toContain('applyMarkdownPipeline(md, { enableTwoslash: true })');
        expect(viteConfig).toContain('await applyMarkdownPipeline(md)');
    });
    it('only mounts the decorative ArtPlum background on the home route', () => {
        const appShell = readFileSync(resolve(rootDir, 'src/App.vue'), 'utf-8');
        expect(appShell).toContain('<ArtPlum v-if="route.path === \'/\'" />');
    });
});
