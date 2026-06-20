import fs from 'fs-extra'
import { join } from 'pathe'
import { loadMarkdownContentEntries } from '~/content/files'
import { siteConfig } from '~/site/config'
import { buildOgManifestSignature, generateOGImage, loadOgTemplateSignature } from './og'
import { loadManifest, saveManifest } from './utils/manifest'

const publicDir = join(process.cwd(), 'public')
const ogDir = join(publicDir, 'og')

interface OgManifestEntry {
  file: string
  generatedAt: string
  signature: string
}

async function run() {
  console.log('🎨 Generating OG images from markdown content...')
  await fs.ensureDir(ogDir)

  const manifest = await loadManifest<OgManifestEntry>('og-manifest.json')
  const nextManifest: Record<string, OgManifestEntry> = {}
  const templateSignature = await loadOgTemplateSignature()

  const entries = await loadMarkdownContentEntries({
    baseUrl: siteConfig.url,
    patterns: ['pages/index.md', 'pages/posts/*.md', 'pages/books/*.md', 'pages/chat.md', 'pages/projects.md'],
  })

  for (const entry of entries) {
    const slug = entry.frontmatter.slug?.trim()
    const title = entry.frontmatter.title?.trim()

    if (!slug || !title)
      continue

    const signature = buildOgManifestSignature({
      content: entry.content,
      date: entry.frontmatter.date,
      slug,
      templateSignature,
      title,
    })
    const outputFile = `${slug}.png`
    const outputPath = join(ogDir, outputFile)

    if (manifest[slug]?.signature !== signature || !await fs.pathExists(outputPath)) {
      await generateOGImage({
        title,
        author: siteConfig.author.name,
        website: siteConfig.url,
      }, outputPath)
    }

    nextManifest[slug] = {
      file: outputFile,
      generatedAt: new Date().toISOString(),
      signature,
    }
  }

  await saveManifest('og-manifest.json', nextManifest)
  console.log(`✅ Generated OG images for ${Object.keys(nextManifest).length} entries`)
}

void run()
