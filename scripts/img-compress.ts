import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import { extname } from 'node:path'
import { promisify } from 'node:util'
import c from 'ansis'
import sharp from 'sharp'

const maxSize = 1440
const execFileAsync = promisify(execFile)
const supportedSharpFormats = new Set(['jpeg', 'png', 'webp'])

export function isCompressibleImagePath(file: string) {
  return /\.(?:png|jpe?g|webp|gif)$/i.test(file)
}

export function resolveCompressionFormat(format: string | undefined, inFile: string) {
  if (format && supportedSharpFormats.has(format))
    return format

  if (extname(inFile).toLowerCase() === '.gif')
    return 'gif'

  throw new Error(`Unsupported format ${format || extname(inFile) || '<unknown>'} of ${inFile}`)
}

export function buildGifCompressionArgs(inFile: string, outFile: string) {
  return [
    '-y',
    '-v',
    'error',
    '-i',
    inFile,
    '-vf',
    'fps=15,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
    '-loop',
    '0',
    outFile,
  ]
}

export async function compressSharp(image: sharp.Sharp, inBuffer: Buffer, inFile: string, outFile: string) {
  const { format, width, height } = await image.metadata()
  if (!width || !height)
    throw new Error(`Could not determine size of ${inFile}`)

  const resolvedFormat = resolveCompressionFormat(format, inFile)
  if (resolvedFormat === 'gif')
    throw new Error(`GIF should be compressed via ffmpeg: ${inFile}`)

  if (width > maxSize || height > maxSize)
    image = image.resize(maxSize)

  image = image[resolvedFormat]({
    quality: resolvedFormat === 'png' ? 100 : 80,
    compressionLevel: 9,
  })

  const outBuffer = await image.withMetadata().toBuffer()
  const size = inBuffer.byteLength
  const outSize = outBuffer.byteLength

  const percent = (outSize - size) / size
  return {
    image,
    outBuffer,
    size,
    outSize,
    percent,
    inFile,
    outFile,
  }
}

export async function compressGif(inFile: string, outFile: string) {
  const tempFile = `${outFile}.tmp.gif`

  try {
    await execFileAsync('ffmpeg', buildGifCompressionArgs(inFile, tempFile))

    const [inputStat, outputStat] = await Promise.all([
      fs.stat(inFile),
      fs.stat(tempFile),
    ])
    const outBuffer = await fs.readFile(tempFile)
    const percent = (outputStat.size - inputStat.size) / inputStat.size

    return {
      image: null,
      outBuffer,
      size: inputStat.size,
      outSize: outputStat.size,
      percent,
      inFile,
      outFile,
    }
  }
  finally {
    await fs.rm(tempFile, { force: true }).catch(() => {})
  }
}

export async function compressImages(files: string[]) {
  await Promise.all(files.map(async (file) => {
    const compression = extname(file).toLowerCase() === '.gif'
      ? await compressGif(file, file)
      : await (async () => {
          const buffer = await fs.readFile(file)
          const image = sharp(buffer)
          return compressSharp(image, buffer, file, file)
        })()

    const {
      percent,
      size,
      outSize,
      inFile,
      outFile,
      outBuffer,
    } = compression

    if (percent > -0.10) {
      console.log(c.dim`[SKIP] ${bytesToHuman(size)} -> ${bytesToHuman(outSize)} ${(percent * 100).toFixed(1).padStart(5, ' ')}%  ${inFile}`)
    }
    else {
      await fs.writeFile(outFile, outBuffer)
      console.log(`[COMP] ${bytesToHuman(size)} -> ${bytesToHuman(outSize)} ${c.green`${(percent * 100).toFixed(1).padStart(5, ' ')}%`}  ${inFile}`)
    }
  }))
}

function bytesToHuman(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return `${(size / 1024 ** i).toFixed(2)} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`.padStart(10, ' ')
}
