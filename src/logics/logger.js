export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (LogLevel = {}));
class Logger {
    level;
    isDevelopment;
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
    }
    shouldLog(level) {
        return level <= this.level;
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const levelStr = LogLevel[level];
        const contextStr = context ? `[${context}]` : '';
        return `${timestamp} ${levelStr}${contextStr}: ${message}`;
    }
    error(message, data, context) {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formatted = this.formatMessage(LogLevel.ERROR, message, context);
            console.error(formatted, data);
        }
    }
    warn(message, data, context) {
        if (this.shouldLog(LogLevel.WARN)) {
            const formatted = this.formatMessage(LogLevel.WARN, message, context);
            console.warn(formatted, data);
        }
    }
    info(message, data, context) {
        if (this.shouldLog(LogLevel.INFO)) {
            const formatted = this.formatMessage(LogLevel.INFO, message, context);
            // eslint-disable-next-line no-console
            console.info(formatted, data);
        }
    }
    debug(message, data, context) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formatted = this.formatMessage(LogLevel.DEBUG, message, context);
            // eslint-disable-next-line no-console
            console.debug(formatted, data);
        }
    }
    // Development only convenience methods
    devOnly = {
        log: (message, data) => {
            if (this.isDevelopment) {
                console.warn(`[DEV] ${message}`, data);
            }
        },
        group: (title) => {
            if (this.isDevelopment) {
                console.warn(`[DEV] ${title}`);
            }
        },
        groupEnd: () => {
            if (this.isDevelopment) {
                console.warn('[DEV] --- End Group ---');
            }
        },
    };
}
export const logger = new Logger();
// Context-specific loggers
export function createContextLogger(context) {
    return {
        error: (message, data) => logger.error(message, data, context),
        warn: (message, data) => logger.warn(message, data, context),
        info: (message, data) => logger.info(message, data, context),
        debug: (message, data) => logger.debug(message, data, context),
    };
}
// Performance timing utilities
export class PerformanceTracker {
    marks = new Map();
    start(operation) {
        this.marks.set(operation, performance.now());
        logger.debug(`Started: ${operation}`, undefined, 'PERF');
    }
    end(operation) {
        const startTime = this.marks.get(operation);
        if (!startTime) {
            logger.warn(`No start mark found for operation: ${operation}`, undefined, 'PERF');
            return 0;
        }
        const duration = performance.now() - startTime;
        this.marks.delete(operation);
        logger.info(`Completed: ${operation} in ${duration.toFixed(2)}ms`, { duration }, 'PERF');
        return duration;
    }
    measure(operation, fn) {
        this.start(operation);
        try {
            const result = fn();
            if (result instanceof Promise) {
                return result.finally(() => this.end(operation));
            }
            else {
                this.end(operation);
                return result;
            }
        }
        catch (error) {
            this.end(operation);
            throw error;
        }
    }
}
export const perfTracker = new PerformanceTracker();
