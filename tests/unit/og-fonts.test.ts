import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { isSupportedFontData, readFirstCompatibleFont } from '../../scripts/og'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.map(dir => import('node:fs/promises').then(({ rm }) => rm(dir, { recursive: true, force: true }))))
  tempDirs.length = 0
})

describe('og font loading', () => {
  it('rejects woff2 buffers for Satori font embedding', () => {
    expect(isSupportedFontData(Buffer.from('wOF2test'))).toBe(false)
    expect(isSupportedFontData(Buffer.from([0x00, 0x01, 0x00, 0x00, 0x41, 0x42]))).toBe(true)
  })

  it('skips incompatible font files and keeps searching for a compatible font', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'og-fonts-'))
    tempDirs.push(dir)

    const unsupportedPath = join(dir, 'unsupported.woff2')
    const compatiblePath = join(dir, 'compatible.ttf')

    await writeFile(unsupportedPath, Buffer.from('wOF2fake'))
    await writeFile(compatiblePath, Buffer.from([0x00, 0x01, 0x00, 0x00, 0x41, 0x42]))

    const resolved = await readFirstCompatibleFont([unsupportedPath, compatiblePath])

    expect(resolved).toEqual(Buffer.from([0x00, 0x01, 0x00, 0x00, 0x41, 0x42]))
  })
})
