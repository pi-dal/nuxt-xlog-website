import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import sharp from 'sharp'

const _dirname = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))
const TEMPLATE_PATH = resolve(_dirname, 'og-template.svg')

interface OGImageOptions {
  title: string
  author?: string
  website?: string
}

/**
 * Escape XML special chars for safe SVG text injection
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Split a title into two lines at a natural break point.
 * Falls back to a hard character split if no natural break is found.
 */
function splitTitle(title: string): [string, string] {
  const maxChars = 28

  if (title.length <= maxChars)
    return [title, '']

  // Try to split at punctuation or space
  const breakPoints = [
    title.lastIndexOf(' — ', maxChars),
    title.lastIndexOf(' – ', maxChars),
    title.lastIndexOf(' - ', maxChars),
    title.lastIndexOf('：', maxChars),
    title.lastIndexOf('——', maxChars),
    title.lastIndexOf(' ', maxChars),
  ]

  for (const pos of breakPoints) {
    if (pos > 0) {
      const line1 = title.slice(0, pos).trim()
      const line2 = title.slice(pos).trim()
      if (line1 && line2 && line1.length <= maxChars + 10)
        return [line1, line2]
    }
  }

  // Hard split at maxChars
  return [
    title.slice(0, maxChars).trim(),
    title.slice(maxChars).trim(),
  ]
}

export async function generateOGImage(options: OGImageOptions, outputPath: string) {
  const { title, author = 'pi-dal' } = options

  // Read SVG template
  let svg = await fs.readFile(TEMPLATE_PATH, 'utf8')

  // Split title into two lines
  const [line1, line2] = splitTitle(title)

  // Replace placeholders
  svg = svg
    .replace('{{author}}', escapeXml(author))
    .replace('{{title1}}', escapeXml(line1))
    .replace('{{title2}}', escapeXml(line2))
    .replace('{{title2}}', '')

  // Ensure output directory exists
  await fs.ensureDir(dirname(outputPath))

  // Convert SVG to PNG using Sharp
  const png = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  // Write to file
  await fs.writeFile(outputPath, png)
}
