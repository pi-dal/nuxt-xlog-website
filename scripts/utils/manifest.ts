import { createHash } from 'node:crypto'
import { join } from 'node:path'
import fs from 'fs-extra'

const cacheDir = join(process.cwd(), '.cache')

export type ManifestEntries<T> = Record<string, T>

export async function ensureCacheDir(): Promise<string> {
  await fs.ensureDir(cacheDir)
  return cacheDir
}

export async function loadManifest<T>(fileName: string): Promise<ManifestEntries<T>> {
  await ensureCacheDir()
  const filePath = join(cacheDir, fileName)
  try {
    return await fs.readJson(filePath)
  }
  catch (error: any) {
    if (error.code === 'ENOENT')
      return {}
    throw error
  }
}

export async function saveManifest<T>(fileName: string, data: ManifestEntries<T>): Promise<void> {
  const filePath = join(cacheDir, fileName)
  await fs.writeJson(filePath, data, { spaces: 2 })
}

export function hashObject(value: unknown): string {
  const hash = createHash('sha1')
  hash.update(JSON.stringify(value))
  return hash.digest('hex')
}
