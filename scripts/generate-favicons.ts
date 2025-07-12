import fs from 'fs-extra'
import { join } from 'pathe'
import sharp from 'sharp'

const publicDir = join(process.cwd(), 'public')
const avatarPath = join(publicDir, 'avatar.webp')

async function generateFavicons() {
  console.log('Generating favicons from avatar.webp...')

  // Check if avatar.webp exists
  if (!await fs.pathExists(avatarPath)) {
    console.error('avatar.webp not found in public directory')
    process.exit(1)
  }

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'favicon.png', size: 32 },
    { name: 'icon.png', size: 32 },
    { name: 'logo.png', size: 128 },
  ]

  for (const { name, size } of sizes) {
    const outputPath = join(publicDir, name)
    console.log(`Generating ${name} (${size}x${size})...`)

    await sharp(avatarPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toFile(outputPath)

    console.log(`✓ Generated ${name}`)
  }

  // Generate favicon.ico using multiple sizes
  console.log('Generating favicon.ico...')
  const icoPath = join(publicDir, 'favicon.ico')

  // Create a 32x32 PNG first for ICO conversion
  const tempIcoSource = join(publicDir, 'temp-ico-32.png')
  await sharp(avatarPath)
    .resize(32, 32, {
      fit: 'cover',
      position: 'center',
    })
    .png()
    .toFile(tempIcoSource)

  // Convert PNG to ICO using ffmpeg
  const { execSync } = await import('node:child_process')
  try {
    execSync(`ffmpeg -y -i "${tempIcoSource}" "${icoPath}"`)
    console.log('✓ Generated favicon.ico')
  }
  catch {
    console.warn('Failed to generate favicon.ico with ffmpeg, copying PNG as fallback')
    await fs.copy(tempIcoSource, icoPath)
  }

  // Clean up temp file
  await fs.remove(tempIcoSource)

  console.log('✅ All favicons generated successfully!')
}

generateFavicons().catch(console.error)
