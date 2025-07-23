import type { XLogSite } from '../types'
import { readonly, ref } from 'vue'
import { logger } from './logger'

// Global cache state for siteInfo - shared across all composable instances
const siteInfo = ref<XLogSite | null>(null)
const pending = ref(false)
const lastFetchTime = ref<number>(0)

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Composable function for managing cached site information
 * Provides global caching to avoid repeated API calls for the same data
 */
export function useSiteInfo() {
  /**
   * Fetch site info with caching logic
   * Only makes API call if cache is empty, pending, or expired
   */
  async function fetchSiteInfo(): Promise<XLogSite | null> {
    const now = Date.now()

    // Return cached data if available and not expired
    if (siteInfo.value && (now - lastFetchTime.value) < CACHE_DURATION) {
      logger.debug('useSiteInfo: Using cached site info', {
        cacheAge: now - lastFetchTime.value,
      })
      return siteInfo.value
    }

    // Return existing data if fetch is already in progress
    if (pending.value) {
      logger.debug('useSiteInfo: Fetch already in progress, waiting...')
      // Wait for pending request to complete
      while (pending.value) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return siteInfo.value
    }

    // Perform fresh fetch
    pending.value = true
    try {
      logger.debug('useSiteInfo: Fetching fresh site info from API')

      // Import the original function dynamically to avoid circular dependency
      const { getSiteInfoDirect } = await import('./xlog-direct')
      const freshSiteInfo = await getSiteInfoDirect()

      if (freshSiteInfo) {
        siteInfo.value = freshSiteInfo
        lastFetchTime.value = now
        logger.debug('useSiteInfo: Successfully cached site info', {
          id: freshSiteInfo.id,
          name: freshSiteInfo.name,
        })
      }
      else {
        logger.warn('useSiteInfo: getSiteInfoDirect returned null')
      }

      return siteInfo.value
    }
    catch (error) {
      logger.error('useSiteInfo: Failed to fetch site info', { error })
      throw error
    }
    finally {
      pending.value = false
    }
  }

  /**
   * Clear the cached site info (useful for testing or when switching handles)
   */
  function clearCache() {
    logger.debug('useSiteInfo: Clearing cache')
    siteInfo.value = null
    lastFetchTime.value = 0
    pending.value = false
  }

  /**
   * Get the character ID from cached site info
   * Returns null if site info is not available
   */
  function getCharacterId(): number | null {
    if (!siteInfo.value?.id) {
      return null
    }
    return Number.parseInt(siteInfo.value.id)
  }

  /**
   * Check if the cache is valid and not expired
   */
  function isCacheValid(): boolean {
    if (!siteInfo.value)
      return false
    const now = Date.now()
    return (now - lastFetchTime.value) < CACHE_DURATION
  }

  return {
    // Reactive state
    siteInfo: readonly(siteInfo),
    pending: readonly(pending),

    // Methods
    fetchSiteInfo,
    clearCache,
    getCharacterId,
    isCacheValid,
  }
}
