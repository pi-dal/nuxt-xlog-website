import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
describe('app bootstrap', () => {
    it('does not install a second head manager outside ViteSSG', async () => {
        const source = await readFile(resolve(process.cwd(), 'src/main.ts'), 'utf8');
        expect(source).not.toContain('createHead()');
        expect(source).not.toContain('app.use(createHead())');
    });
});
