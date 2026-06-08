import { createHash } from 'node:crypto';
import { join } from 'node:path';
import fs from 'fs-extra';
const cacheDir = join(process.cwd(), '.cache');
export async function ensureCacheDir() {
    await fs.ensureDir(cacheDir);
    return cacheDir;
}
export async function loadManifest(fileName) {
    await ensureCacheDir();
    const filePath = join(cacheDir, fileName);
    try {
        return await fs.readJson(filePath);
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return {};
        throw error;
    }
}
export async function saveManifest(fileName, data) {
    const filePath = join(cacheDir, fileName);
    await fs.writeJson(filePath, data, { spaces: 2 });
}
export function hashObject(value) {
    const hash = createHash('sha1');
    hash.update(JSON.stringify(value));
    return hash.digest('hex');
}
