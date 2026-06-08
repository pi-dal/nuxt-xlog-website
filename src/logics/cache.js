import { logger } from './logger';
export class CacheManager {
    cache = new Map();
    config;
    constructor(config = {}) {
        this.config = {
            defaultTTL: 5 * 60 * 1000, // 5 minutes
            maxSize: 100,
            enablePersistence: false,
            ...config,
        };
        // Load from localStorage if persistence is enabled
        if (this.config.enablePersistence && typeof window !== 'undefined') {
            this.loadFromStorage();
        }
    }
    generateKey(operation, params) {
        const paramString = JSON.stringify(params, Object.keys(params).sort());
        return `${operation}:${paramString}`;
    }
    isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }
    evictOldEntries() {
        if (this.cache.size <= this.config.maxSize)
            return;
        // Convert to array and sort by timestamp
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp);
        // Remove oldest entries
        const toRemove = entries.slice(0, this.cache.size - this.config.maxSize);
        toRemove.forEach(([key]) => this.cache.delete(key));
    }
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('xlog-cache');
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.entries(parsed).forEach(([key, entry]) => {
                    const cacheEntry = entry;
                    if (!this.isExpired(cacheEntry)) {
                        this.cache.set(key, cacheEntry);
                    }
                });
            }
        }
        catch (error) {
            logger.warn('Failed to load cache from storage:', { error }, 'CACHE');
        }
    }
    saveToStorage() {
        if (!this.config.enablePersistence || typeof window === 'undefined')
            return;
        try {
            const cacheObj = Object.fromEntries(this.cache);
            localStorage.setItem('xlog-cache', JSON.stringify(cacheObj));
        }
        catch (error) {
            logger.warn('Failed to save cache to storage:', { error }, 'CACHE');
        }
    }
    get(operation, params) {
        const key = this.generateKey(operation, params);
        const entry = this.cache.get(key);
        if (!entry || this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    set(operation, params, data, ttl) {
        const key = this.generateKey(operation, params);
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.config.defaultTTL,
        };
        this.cache.set(key, entry);
        this.evictOldEntries();
        this.saveToStorage();
    }
    invalidate(operation, params) {
        if (params) {
            const key = this.generateKey(operation, params);
            this.cache.delete(key);
        }
        else {
            // Invalidate all entries for this operation
            const keysToDelete = Array.from(this.cache.keys())
                .filter(key => key.startsWith(`${operation}:`));
            keysToDelete.forEach(key => this.cache.delete(key));
        }
        this.saveToStorage();
    }
    clear() {
        this.cache.clear();
        if (this.config.enablePersistence && typeof window !== 'undefined') {
            localStorage.removeItem('xlog-cache');
        }
    }
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            hitRate: 0, // Would need to track hits/misses for this
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                timestamp: entry.timestamp,
                ttl: entry.ttl,
            })),
        };
    }
}
// Singleton instance with different TTLs for different operations
export const cacheManager = new CacheManager({
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    enablePersistence: true,
});
// Cache TTL constants for different operations
export const CACHE_TTL = {
    SITE_INFO: 30 * 60 * 1000, // 30 minutes - site info changes rarely
    POSTS: 5 * 60 * 1000, // 5 minutes - posts may be updated
    SINGLE_POST: 10 * 60 * 1000, // 10 minutes - single post content
    SITE_STATS: 60 * 1000, // 1 minute - stats change frequently
    METADATA: 60 * 60 * 1000, // 1 hour - metadata supplements change rarely
};
// Utility function to wrap API calls with caching
export async function withCache(operation, params, apiCall, ttl) {
    // Try to get from cache first
    const cached = cacheManager.get(operation, params);
    if (cached !== null) {
        return cached;
    }
    // If not in cache, make the API call
    const result = await apiCall();
    // Cache the result when meaningful (avoid caching null/undefined failures)
    if (result !== null && result !== undefined)
        cacheManager.set(operation, params, result, ttl);
    return result;
}
// Cache warming functions
export async function warmCache() {
    // This would be called on app initialization to pre-populate cache
    // Implementation depends on your specific needs
}
// Cache invalidation helpers
export function invalidatePostCache(slug) {
    if (slug) {
        cacheManager.invalidate('getPostBySlug');
        cacheManager.invalidate('getEnhancedPostBySlug');
    }
    else {
        cacheManager.invalidate('getAllPosts');
        cacheManager.invalidate('getAllEnhancedPosts');
        cacheManager.invalidate('getPosts');
    }
}
export function invalidateSiteCache() {
    cacheManager.invalidate('getSiteInfo');
    cacheManager.invalidate('getSiteStats');
}
