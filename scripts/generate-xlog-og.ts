import fs from 'fs-extra'
import { join } from 'pathe'
import { generateOGImage } from './og'

const publicDir = join(process.cwd(), 'public')
const ogDir = join(publicDir, 'og')

// xLog GraphQL API endpoint
const XLOG_API_URL = 'https://indexer.crossbell.io/v1/graphql'

// GraphQL query to get posts
const GET_POSTS_QUERY = `
  query getPosts($characterId: Int!, $limit: Int!) {
    notes(
      where: {
        characterId: { equals: $characterId }
        deleted: { equals: false }
      }
      orderBy: [{ createdAt: desc }]
      take: $limit
    ) {
      noteId
      characterId
      createdAt
      updatedAt
      publishedAt
      metadata {
        uri
        content
      }
      character {
        characterId
        handle
        metadata {
          content
        }
      }
    }
  }
`

// GraphQL query to get character by handle
const GET_CHARACTER_QUERY = `
  query getCharacter($handle: String!) {
    characters(where: { handle: { equals: $handle } }) {
      characterId
      handle
      metadata {
        content
      }
    }
  }
`

async function fetchCharacterByHandle(handle: string) {
  const response = await fetch(XLOG_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_CHARACTER_QUERY,
      variables: { handle },
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  return result.data?.characters?.[0] || null
}

async function fetchXLogPosts(characterId: number, limit: number = 100) {
  console.log(`🔍 Fetching posts for characterId: ${characterId}, limit: ${limit}`)

  const response = await fetch(XLOG_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_POSTS_QUERY,
      variables: { characterId, limit },
    }),
  })

  console.log(`📡 API Response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`❌ API Error response:`, errorText)
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()

  if (result.errors) {
    console.error(`❌ GraphQL errors:`, result.errors)
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  console.log(`✅ Successfully fetched ${result.data?.notes?.length || 0} notes`)
  return result.data?.notes || []
}

async function generateXLogOGImages() {
  console.log('🎨 Generating OG images for xLog posts...')

  try {
    // Ensure OG directory exists
    await fs.ensureDir(ogDir)

    // Get xLog handle from environment
    const xlogHandle = process.env.XLOG_HANDLE || 'pi-dal'
    console.log(`📝 Fetching posts from xLog handle: ${xlogHandle}`)

    // First, get the character ID
    const character = await fetchCharacterByHandle(xlogHandle)
    if (!character) {
      console.log(`❌ Character not found for handle: ${xlogHandle}`)
      return
    }

    console.log(`👤 Found character: ${character.handle} (ID: ${character.characterId})`)

    // Fetch all notes for this character
    const notes = await fetchXLogPosts(Number(character.characterId), 100)

    if (!notes || notes.length === 0) {
      console.log('📭 No notes found')
      return
    }

    console.log(`📄 Found ${notes.length} notes`)

    // Parse character metadata to get author name
    let authorName = xlogHandle
    try {
      if (character.metadata?.content) {
        const metadata = JSON.parse(character.metadata.content)
        authorName = metadata.name || metadata.display_name || authorName
      }
    }
    catch {
      // Use default if parsing fails
    }

    console.log(`👤 Author name: ${authorName}`)

    // Generate OG images for each post
    let generated = 0
    let skipped = 0
    let processed = 0

    for (const note of notes) {
      // Parse note metadata to get post information
      const content = note.metadata?.content || {}

      // Skip notes without title (these are usually not blog posts)
      if (!content.title) {
        continue
      }

      // Extract slug from attributes
      const attributes = content.attributes || []
      const xlogSlugAttr = attributes.find((attr: any) => attr.trait_type === 'xlog_slug')
      const slug = xlogSlugAttr?.value || content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      if (!slug) {
        console.log(`⚠️  Skipping post without slug: ${note.noteId} - "${content.title}"`)
        continue
      }

      processed++
      console.log(`📝 Processing: "${content.title}" (slug: ${slug})`)

      const ogPath = join(ogDir, `${slug}.png`)

      // Skip if OG image already exists
      if (await fs.pathExists(ogPath)) {
        console.log(`⏩ Skipping existing OG image: ${slug}.png`)
        skipped++
        continue
      }

      try {
        console.log(`🎨 Generating OG image for: ${content.title}`)

        await generateOGImage({
          title: content.title,
          author: authorName,
        }, ogPath)

        generated++
        console.log(`✅ Generated: ${slug}.png`)
      }
      catch (error) {
        console.error(`❌ Failed to generate OG image for ${slug}:`, error)
      }
    }

    console.log(`🎉 OG image generation complete!`)
    console.log(`📊 Processed: ${processed}, Generated: ${generated}, Skipped: ${skipped}`)

    // Generate a mapping file for reference
    const mapping: Record<string, any> = {}
    for (const note of notes) {
      const content = note.metadata?.content || {}
      if (!content.title)
        continue

      const attributes = content.attributes || []
      const xlogSlugAttr = attributes.find((attr: any) => attr.trait_type === 'xlog_slug')
      const slug = xlogSlugAttr?.value || content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      if (slug) {
        mapping[slug] = {
          title: content.title,
          author: authorName,
          date: note.publishedAt || note.createdAt,
          ogImage: `https://pi-dal.com/og/${slug}.png`,
        }
      }
    }

    const mappingPath = join(ogDir, 'xlog-mapping.json')
    await fs.writeJSON(mappingPath, mapping, { spaces: 2 })
    console.log(`📋 Created mapping file with ${Object.keys(mapping).length} entries: ${mappingPath}`)
  }
  catch (error) {
    console.error('❌ Failed to generate xLog OG images:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateXLogOGImages().catch(console.error)
}

export { generateXLogOGImages }
