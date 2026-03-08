import { describe, expect, it } from 'vitest'

import { buildGifCompressionArgs, isCompressibleImagePath, resolveCompressionFormat } from '../../scripts/img-compress'

describe('img-compress helpers', () => {
  it('recognizes gif files as compressible assets', () => {
    expect(isCompressibleImagePath('demo.gif')).toBe(true)
    expect(isCompressibleImagePath('demo.png')).toBe(true)
    expect(isCompressibleImagePath('demo.md')).toBe(false)
  })

  it('falls back to gif based on the file extension when sharp metadata format is unavailable', () => {
    expect(resolveCompressionFormat(undefined, 'demo.gif')).toBe('gif')
    expect(resolveCompressionFormat('jpeg', 'demo.jpg')).toBe('jpeg')
    expect(() => resolveCompressionFormat(undefined, 'demo.avif')).toThrow('Unsupported format')
  })

  it('builds ffmpeg args that optimize animated gifs in place via a temp file', () => {
    expect(buildGifCompressionArgs('in.gif', 'out.gif')).toEqual([
      '-y',
      '-v',
      'error',
      '-i',
      'in.gif',
      '-vf',
      'fps=15,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
      '-loop',
      '0',
      'out.gif',
    ])
  })
})
