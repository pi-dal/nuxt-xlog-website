import dayjs from 'dayjs'

// Theme management
export const isDark = useDark()
export const englishOnly = useStorage('antfu-english-only', false)

// Analytics and monitoring
export {
  analytics,
  getSystemHealth,
  monitored,
  trackPerformance,
  trackUsage,
  withAnalytics,
} from './analytics'

// Batching utilities
export {
  batchManager,
  batchRequest,
  DataLoaderCache,
  postLoader,
  siteLoader,
} from './batch'

// Caching utilities
export {
  CACHE_TTL,
  cacheManager,
  invalidatePostCache,
  invalidateSiteCache,
  withCache,
} from './cache'

// Error handling utilities
export {
  ErrorCategory,
  errorManager,
  handleApiError,
  handleNetworkError,
  handleValidationError,
  reportError,
  withErrorHandling,
} from './errors'

// Logging utilities
export {
  createContextLogger,
  logger,
  LogLevel,
  PerformanceTracker,
  perfTracker,
} from './logger'

export {
  enhancePostsWithMetadata,
  enhancePostWithMetadata,
  getAvailableSupplementSlugs,
  getMetadataSupplementForSlug,
  hasMetadataSupplements,
  preloadMetadataConfig,
} from './metadata'

export {
  fetchSiteInfo,
  loading,
  siteInfo,
} from './site'

// Re-export main API functions for clean imports
export {
  getAllEnhancedPosts,
  getAllPosts,
  getEnhancedPostBySlug,
  getEnhancedPostsByTag,
  getPostById,
  getPostBySlug,
  getPosts,
  getPostsByTag,
  getSiteInfo,
  getSiteStats,
} from './xlog'

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
export function toggleDark(event: MouseEvent) {
  // @ts-expect-error experimental API
  const isAppearanceTransition = document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    isDark.value = !isDark.value
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  // @ts-expect-error: Transition API
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  transition.ready
    .then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark.value
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-out',
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
}

// Date utilities
export function formatDate(d: string | Date, onlyDate = true): string {
  if (!d)
    return ''

  const date = dayjs(d)
  if (!date.isValid()) {
    console.warn('Invalid date provided to formatDate:', d)
    return ''
  }

  if (onlyDate || date.year() === dayjs().year())
    return date.format('MMM D')
  return date.format('MMM D, YYYY')
}

export function formatDateRelative(d: string | Date): string {
  if (!d)
    return ''

  const date = dayjs(d)
  if (!date.isValid()) {
    console.warn('Invalid date provided to formatDateRelative:', d)
    return ''
  }

  const now = dayjs()
  const diffDays = now.diff(date, 'day')

  if (diffDays === 0)
    return 'Today'
  if (diffDays === 1)
    return 'Yesterday'
  if (diffDays < 7)
    return `${diffDays} days ago`
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Validation utilities
export function isValidSlug(slug: string): boolean {
  return typeof slug === 'string' && slug.trim().length > 0 && /^[\w-]+$/.test(slug)
}

export function isValidUrl(url: string): boolean {
  try {
    return Boolean(new URL(url))
  }
  catch {
    return false
  }
}

// String utilities
export function truncateText(text: string, maxLength = 150): string {
  if (!text || text.length <= maxLength)
    return text
  return `${text.substring(0, maxLength).replace(/\s+\S*$/, '')}...`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
