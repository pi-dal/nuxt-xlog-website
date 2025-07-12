import type { ErrorCategory } from './errors'
import type { XLogOperation } from '~/types'
import { errorManager } from './errors'
import { createContextLogger } from './logger'

const log = createContextLogger('analytics')

export interface PerformanceMetrics {
  operation: XLogOperation
  duration: number
  timestamp: number
  success: boolean
  cacheHit?: boolean
  retryCount?: number
}

export interface ErrorMetrics {
  operation: XLogOperation
  category: ErrorCategory
  timestamp: number
  userAgent?: string
  url?: string
}

export interface UsageMetrics {
  feature: string
  action: string
  timestamp: number
  metadata?: Record<string, any>
}

class AnalyticsManager {
  private performanceMetrics: PerformanceMetrics[] = []
  private usageMetrics: UsageMetrics[] = []
  private readonly maxHistorySize = 1000

  // Performance tracking
  trackPerformance(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics)
    this.evictOldMetrics()

    // Log slow operations
    if (metrics.duration > 5000) { // 5 seconds
      log.warn(`Slow operation detected: ${metrics.operation}`, {
        duration: metrics.duration,
        operation: metrics.operation,
      })
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      log.debug(`Performance: ${metrics.operation}`, {
        duration: `${metrics.duration.toFixed(2)}ms`,
        success: metrics.success,
        cacheHit: metrics.cacheHit,
      })
    }
  }

  // Usage tracking
  trackUsage(feature: string, action: string, metadata?: Record<string, any>): void {
    const usage: UsageMetrics = {
      feature,
      action,
      timestamp: Date.now(),
      metadata,
    }

    this.usageMetrics.push(usage)
    this.evictOldMetrics()

    log.debug(`Usage: ${feature}.${action}`, metadata)
  }

  // Error metrics (delegated to errorManager)
  getErrorMetrics(): ErrorMetrics[] {
    return errorManager.getErrorHistory().map(error => ({
      operation: error.code as XLogOperation,
      category: error.category as ErrorCategory,
      timestamp: error.context.timestamp,
      userAgent: error.context.userAgent,
      url: error.context.url,
    }))
  }

  // Performance analysis
  getPerformanceStats(): {
    averageDuration: Record<XLogOperation, number>
    slowestOperations: PerformanceMetrics[]
    cacheHitRate: number
    totalOperations: number
  } {
    const averageDuration: Partial<Record<XLogOperation, number>> = {}
    const operationCounts: Partial<Record<XLogOperation, number>> = {}

    let cacheHits = 0
    let totalWithCache = 0

    this.performanceMetrics.forEach((metric) => {
      // Calculate averages
      if (!averageDuration[metric.operation]) {
        averageDuration[metric.operation] = 0
        operationCounts[metric.operation] = 0
      }

      averageDuration[metric.operation]! += metric.duration
      operationCounts[metric.operation]!++

      // Cache stats
      if (metric.cacheHit !== undefined) {
        totalWithCache++
        if (metric.cacheHit)
          cacheHits++
      }
    })

    // Convert to actual averages
    Object.keys(averageDuration).forEach((op) => {
      const operation = op as XLogOperation
      averageDuration[operation] = averageDuration[operation]! / operationCounts[operation]!
    })

    // Get slowest operations
    const slowestOperations = [...this.performanceMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    return {
      averageDuration: averageDuration as Record<XLogOperation, number>,
      slowestOperations,
      cacheHitRate: totalWithCache > 0 ? cacheHits / totalWithCache : 0,
      totalOperations: this.performanceMetrics.length,
    }
  }

  // Usage analysis
  getUsageStats(): {
    topFeatures: { feature: string, count: number }[]
    recentActions: UsageMetrics[]
    timeRange: { start: number, end: number }
  } {
    const featureCounts: Record<string, number> = {}

    this.usageMetrics.forEach((usage) => {
      featureCounts[usage.feature] = (featureCounts[usage.feature] || 0) + 1
    })

    const topFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const recentActions = [...this.usageMetrics]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)

    const timestamps = this.usageMetrics.map(m => m.timestamp)
    const timeRange = timestamps.length > 0
      ? { start: Math.min(...timestamps), end: Math.max(...timestamps) }
      : { start: 0, end: 0 }

    return {
      topFeatures,
      recentActions,
      timeRange,
    }
  }

  // Generate comprehensive report
  generateReport(): {
    performance: ReturnType<typeof this.getPerformanceStats>
    errors: { stats: Record<ErrorCategory, number>, recent: ErrorMetrics[] }
    usage: ReturnType<typeof this.getUsageStats>
    summary: {
      totalOperations: number
      errorRate: number
      avgResponseTime: number
      cacheEfficiency: number
    }
  } {
    const performance = this.getPerformanceStats()
    const errorStats = errorManager.getErrorStats()
    const errorMetrics = this.getErrorMetrics()
    const usage = this.getUsageStats()

    const totalOperations = performance.totalOperations
    const totalErrors = Object.values(errorStats).reduce((sum, count) => sum + count, 0)
    const errorRate = totalOperations > 0 ? totalErrors / totalOperations : 0

    const avgResponseTime = Object.values(performance.averageDuration)
      .reduce((sum, avg) => sum + avg, 0) / Object.keys(performance.averageDuration).length || 0

    return {
      performance,
      errors: {
        stats: errorStats,
        recent: errorMetrics.slice(-10),
      },
      usage,
      summary: {
        totalOperations,
        errorRate,
        avgResponseTime,
        cacheEfficiency: performance.cacheHitRate,
      },
    }
  }

  private evictOldMetrics(): void {
    if (this.performanceMetrics.length > this.maxHistorySize) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxHistorySize)
    }

    if (this.usageMetrics.length > this.maxHistorySize) {
      this.usageMetrics = this.usageMetrics.slice(-this.maxHistorySize)
    }
  }

  // Export data for external analytics
  exportData(): {
    performance: PerformanceMetrics[]
    usage: UsageMetrics[]
    errors: ErrorMetrics[]
  } {
    return {
      performance: [...this.performanceMetrics],
      usage: [...this.usageMetrics],
      errors: this.getErrorMetrics(),
    }
  }

  clear(): void {
    this.performanceMetrics = []
    this.usageMetrics = []
    errorManager.clearHistory()
  }
}

// Singleton instance
export const analytics = new AnalyticsManager()

// Convenience functions
export function trackPerformance(
  operation: XLogOperation,
  duration: number,
  success: boolean,
  options?: { cacheHit?: boolean, retryCount?: number },
): void {
  analytics.trackPerformance({
    operation,
    duration,
    timestamp: Date.now(),
    success,
    ...options,
  })
}

export function trackUsage(feature: string, action: string, metadata?: Record<string, any>): void {
  analytics.trackUsage(feature, action, metadata)
}

// Enhanced performance wrapper that includes analytics
export async function withAnalytics<T>(
  operation: XLogOperation,
  fn: () => Promise<T>,
): Promise<T> {
  const startTime = performance.now()
  let success = false
  let error: Error | null = null

  try {
    const result = await fn()
    success = true
    return result
  }
  catch (err) {
    error = err as Error
    success = false
    throw err
  }
  finally {
    const duration = performance.now() - startTime

    trackPerformance(operation, duration, success)

    if (error) {
      log.error(`Operation failed: ${operation}`, error)
    }
  }
}

// Performance monitoring decorator
export function monitored(operation: XLogOperation) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const originalMethod = descriptor.value!

    descriptor.value = async function (...args: any[]) {
      return withAnalytics(operation, () => originalMethod.apply(this, args))
    } as T

    return descriptor
  }
}

// Health check
export function getSystemHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, boolean>
  metrics: {
    errorRate: number
    avgResponseTime: number
    cacheHitRate: number
  }
} {
  const report = analytics.generateReport()
  const errorRate = report.summary.errorRate
  const avgResponseTime = report.summary.avgResponseTime
  const cacheHitRate = report.summary.cacheEfficiency

  const checks = {
    lowErrorRate: errorRate < 0.05, // Less than 5%
    reasonableResponseTime: avgResponseTime < 2000, // Less than 2 seconds
    goodCachePerformance: cacheHitRate > 0.7, // More than 70%
  }

  const healthyChecks = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.values(checks).length

  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (healthyChecks === totalChecks) {
    status = 'healthy'
  }
  else if (healthyChecks >= totalChecks * 0.6) {
    status = 'degraded'
  }
  else {
    status = 'unhealthy'
  }

  return {
    status,
    checks,
    metrics: {
      errorRate,
      avgResponseTime,
      cacheHitRate,
    },
  }
}
