export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: number
  context?: string
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString()
    const levelStr = LogLevel[level]
    const contextStr = context ? `[${context}]` : ''
    return `${timestamp} ${levelStr}${contextStr}: ${message}`
  }

  error(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message, context)
      console.error(formatted, data)
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, context)
      console.warn(formatted, data)
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, context)
      console.warn(formatted, data)
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, context)
      console.warn(formatted, data)
    }
  }

  // Development only convenience methods
  devOnly = {
    log: (message: string, data?: any) => {
      if (this.isDevelopment) {
        console.warn(`[DEV] ${message}`, data)
      }
    },
    group: (title: string) => {
      if (this.isDevelopment) {
        console.warn(`[DEV] ${title}`)
      }
    },
    groupEnd: () => {
      if (this.isDevelopment) {
        console.warn('[DEV] --- End Group ---')
      }
    },
  }
}

export const logger = new Logger()

// Context-specific loggers
export function createContextLogger(context: string) {
  return {
    error: (message: string, data?: any) => logger.error(message, data, context),
    warn: (message: string, data?: any) => logger.warn(message, data, context),
    info: (message: string, data?: any) => logger.info(message, data, context),
    debug: (message: string, data?: any) => logger.debug(message, data, context),
  }
}

// Performance timing utilities
export class PerformanceTracker {
  private marks = new Map<string, number>()

  start(operation: string): void {
    this.marks.set(operation, performance.now())
    logger.debug(`Started: ${operation}`, undefined, 'PERF')
  }

  end(operation: string): number {
    const startTime = this.marks.get(operation)
    if (!startTime) {
      logger.warn(`No start mark found for operation: ${operation}`, undefined, 'PERF')
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(operation)

    logger.info(`Completed: ${operation} in ${duration.toFixed(2)}ms`, { duration }, 'PERF')
    return duration
  }

  measure<T>(operation: string, fn: () => T): T
  measure<T>(operation: string, fn: () => Promise<T>): Promise<T>
  measure<T>(operation: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(operation)

    try {
      const result = fn()

      if (result instanceof Promise) {
        return result.finally(() => this.end(operation))
      }
      else {
        this.end(operation)
        return result
      }
    }
    catch (error) {
      this.end(operation)
      throw error
    }
  }
}

export const perfTracker = new PerformanceTracker()
