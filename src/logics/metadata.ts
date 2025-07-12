import type { EnhancedXLogPost, MetadataSupplementsConfig, XLogPost } from '~/types'
import { createContextLogger } from './logger'

// Import the supplements configuration with singleton pattern
class MetadataConfigManager {
  private static instance: MetadataConfigManager
  private config: MetadataSupplementsConfig = {}
  private loaded = false

  static getInstance(): MetadataConfigManager {
    if (!MetadataConfigManager.instance) {
      MetadataConfigManager.instance = new MetadataConfigManager()
    }
    return MetadataConfigManager.instance
  }

  async getConfig(): Promise<MetadataSupplementsConfig> {
    if (this.loaded) {
      return this.config
    }

    try {
      const module = await import('~/metadata/supplements.json')
      this.config = module.default || module
      this.loaded = true
    }
    catch {
      createContextLogger('metadata').warn('No metadata supplements file found, using empty config')
      this.config = {}
      this.loaded = true
    }

    return this.config
  }

  getConfigSync(): MetadataSupplementsConfig {
    return this.config
  }

  isLoaded(): boolean {
    return this.loaded
  }
}

const configManager = MetadataConfigManager.getInstance()

// Helper function to load supplements config
async function loadSupplementsConfig(): Promise<MetadataSupplementsConfig> {
  return await configManager.getConfig()
}

/**
 * Enhance an xLog post with additional metadata from supplements
 */
const log = createContextLogger('metadata')

export async function enhancePostWithMetadata(post: XLogPost): Promise<EnhancedXLogPost> {
  if (!post?.slug) {
    log.warn('Post missing slug, cannot enhance with metadata')
    return { ...post }
  }

  const config = await loadSupplementsConfig()
  const supplements = config[post.slug] || {}

  // Create enhanced post by merging xLog data with supplements
  const enhancedPost: EnhancedXLogPost = {
    ...post,
    // Map xLog fields to common names
    description: supplements.description || post.excerpt || post.summary,
    image: supplements.image || post.cover,
    // Add supplement-specific fields
    art: supplements.art,
    place: supplements.place,
    duration: supplements.duration,
    lang: supplements.lang,
    // Override title if specified in supplements
    title: supplements.title || post.title,
    // Merge any additional custom fields safely
    ...Object.fromEntries(
      Object.entries(supplements).filter(([key]) =>
        !['title', 'description', 'image', 'art', 'place', 'duration', 'lang'].includes(key),
      ),
    ),
  }

  return enhancedPost
}

/**
 * Enhance multiple posts with metadata
 */
export async function enhancePostsWithMetadata(posts: XLogPost[]): Promise<EnhancedXLogPost[]> {
  return Promise.all(posts.map(enhancePostWithMetadata))
}

/**
 * Get metadata supplement for a specific slug
 */
export async function getMetadataSupplementForSlug(slug: string) {
  if (!slug?.trim()) {
    log.warn('Invalid slug provided to getMetadataSupplementForSlug')
    return {}
  }

  const config = await loadSupplementsConfig()
  return config[slug] || {}
}

/**
 * Check if a post has custom metadata supplements
 */
export async function hasMetadataSupplements(slug: string): Promise<boolean> {
  if (!slug?.trim()) {
    return false
  }

  const config = await loadSupplementsConfig()
  return !!config[slug] && Object.keys(config[slug]).length > 0
}

/**
 * Get all available supplement slugs
 */
export async function getAvailableSupplementSlugs(): Promise<string[]> {
  const config = await loadSupplementsConfig()
  return Object.keys(config)
}

/**
 * Preload metadata configuration for performance
 */
export async function preloadMetadataConfig(): Promise<void> {
  await loadSupplementsConfig()
}
