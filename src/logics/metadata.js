import { createContextLogger } from './logger';
// Import the supplements configuration with singleton pattern
class MetadataConfigManager {
    static instance;
    config = {};
    loaded = false;
    static getInstance() {
        if (!MetadataConfigManager.instance) {
            MetadataConfigManager.instance = new MetadataConfigManager();
        }
        return MetadataConfigManager.instance;
    }
    async getConfig() {
        if (this.loaded) {
            return this.config;
        }
        try {
            const module = await import('~/metadata/supplements.json');
            this.config = module.default || module;
            this.loaded = true;
        }
        catch {
            createContextLogger('metadata').warn('No metadata supplements file found, using empty config');
            this.config = {};
            this.loaded = true;
        }
        return this.config;
    }
    getConfigSync() {
        return this.config;
    }
    isLoaded() {
        return this.loaded;
    }
}
const configManager = MetadataConfigManager.getInstance();
// Helper function to load supplements config
async function loadSupplementsConfig() {
    return await configManager.getConfig();
}
/**
 * Enhance an xLog post with additional metadata from supplements
 */
const log = createContextLogger('metadata');
export async function enhancePostWithMetadata(post) {
    if (!post?.slug) {
        log.warn('Post missing slug, cannot enhance with metadata');
        return { ...post };
    }
    const config = await loadSupplementsConfig();
    const supplements = config[post.slug] || {};
    // Create enhanced post by merging xLog data with supplements
    const enhancedPost = {
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
        ...Object.fromEntries(Object.entries(supplements).filter(([key]) => !['title', 'description', 'image', 'art', 'place', 'duration', 'lang'].includes(key))),
    };
    return enhancedPost;
}
/**
 * Enhance multiple posts with metadata
 */
export async function enhancePostsWithMetadata(posts) {
    return Promise.all(posts.map(enhancePostWithMetadata));
}
/**
 * Get metadata supplement for a specific slug
 */
export async function getMetadataSupplementForSlug(slug) {
    if (!slug?.trim()) {
        log.warn('Invalid slug provided to getMetadataSupplementForSlug');
        return {};
    }
    const config = await loadSupplementsConfig();
    return config[slug] || {};
}
/**
 * Check if a post has custom metadata supplements
 */
export async function hasMetadataSupplements(slug) {
    if (!slug?.trim()) {
        return false;
    }
    const config = await loadSupplementsConfig();
    return !!config[slug] && Object.keys(config[slug]).length > 0;
}
/**
 * Get all available supplement slugs
 */
export async function getAvailableSupplementSlugs() {
    const config = await loadSupplementsConfig();
    return Object.keys(config);
}
/**
 * Preload metadata configuration for performance
 */
export async function preloadMetadataConfig() {
    await loadSupplementsConfig();
}
