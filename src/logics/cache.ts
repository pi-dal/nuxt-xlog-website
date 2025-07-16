import { logger } from './logger'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheConfig {
  defaultTTL: number
  maxSize: number
  enablePersistence: boolean
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enablePersistence: false,
      ...config,
    }

    // Load from localStorage if persistence is enabled
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  private generateKey(operation: string, params: any): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort())
    return `${operation}:${paramString}`
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private evictOldEntries(): void {
    if (this.cache.size <= this.config.maxSize)
      return

    // Convert to array and sort by timestamp
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)

    // Remove oldest entries
    const toRemove = entries.slice(0, this.cache.size - this.config.maxSize)
    toRemove.forEach(([key]) => this.cache.delete(key))
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('xlog-cache')
      if (stored) {
        const parsed = JSON.parse(stored)
        Object.entries(parsed).forEach(([key, entry]) => {
          const cacheEntry = entry as CacheEntry<any>
          if (!this.isExpired(cacheEntry)) {
            this.cache.set(key, cacheEntry)
          }
        })
      }
    }
    catch (error) {
      logger.warn('Failed to load cache from storage:', { error }, 'CACHE')
    }
  }

  private saveToStorage(): void {
    if (!this.config.enablePersistence || typeof window === 'undefined')
      return

    try {
      const cacheObj = Object.fromEntries(this.cache)
      localStorage.setItem('xlog-cache', JSON.stringify(cacheObj))
    }
    catch (error) {
      logger.warn('Failed to save cache to storage:', { error }, 'CACHE')
    }
  }

  get<T>(operation: string, params: any): T | null {
    const key = this.generateKey(operation, params)
    const entry = this.cache.get(key)

    if (!entry || this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(operation: string, params: any, data: T, ttl?: number): void {
    const key = this.generateKey(operation, params)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    }

    this.cache.set(key, entry)
    this.evictOldEntries()
    this.saveToStorage()
  }

  invalidate(operation: string, params?: any): void {
    if (params) {
      const key = this.generateKey(operation, params)
      this.cache.delete(key)
    }
    else {
      // Invalidate all entries for this operation
      const keysToDelete = Array.from(this.cache.keys())
        .filter(key => key.startsWith(`${operation}:`))
      keysToDelete.forEach(key => this.cache.delete(key))
    }
    this.saveToStorage()
  }

  clear(): void {
    this.cache.clear()
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem('xlog-cache')
    }
  }

  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    entries: { key: string, timestamp: number, ttl: number }[]
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses for this
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
      })),
    }
  }
}

// Singleton instance with different TTLs for different operations
export const cacheManager = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  enablePersistence: true,
})

// Cache TTL constants for different operations
export const CACHE_TTL = {
  SITE_INFO: 30 * 60 * 1000, // 30 minutes - site info changes rarely
  POSTS: 5 * 60 * 1000, // 5 minutes - posts may be updated
  SINGLE_POST: 10 * 60 * 1000, // 10 minutes - single post content
  SITE_STATS: 60 * 1000, // 1 minute - stats change frequently
  METADATA: 60 * 60 * 1000, // 1 hour - metadata supplements change rarely
} as const

// Utility function to wrap API calls with caching
export async function withCache<T>(
  operation: string,
  params: any,
  apiCall: () => Promise<T>,
  ttl?: number,
): Promise<T> {
  // Try to get from cache first
  const cached = cacheManager.get<T>(operation, params)
  if (cached !== null) {
    return cached
  }

  // If not in cache, make the API call
  const result = await apiCall()

  // Cache the result
  cacheManager.set(operation, params, result, ttl)

  return result
}

// Cache warming functions
export async function warmCache(): Promise<void> {
  // This would be called on app initialization to pre-populate cache
  // Implementation depends on your specific needs
}

// Cache invalidation helpers
export function invalidatePostCache(slug?: string): void {
  if (slug) {
    cacheManager.invalidate('getPostBySlug', { slug })
    cacheManager.invalidate('getEnhancedPostBySlug', { slug })
  }
  else {
    cacheManager.invalidate('getAllPosts')
    cacheManager.invalidate('getAllEnhancedPosts')
    cacheManager.invalidate('getPosts')
  }
}

export function invalidateSiteCache(): void {
  cacheManager.invalidate('getSiteInfo')
  cacheManager.invalidate('getSiteStats')
}
