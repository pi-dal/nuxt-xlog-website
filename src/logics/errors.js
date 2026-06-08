import { logger } from './logger';
// Error types for different categories
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["NETWORK"] = "NETWORK";
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["API"] = "API";
    ErrorCategory["PARSING"] = "PARSING";
    ErrorCategory["TIMEOUT"] = "TIMEOUT";
    ErrorCategory["UNKNOWN"] = "UNKNOWN";
})(ErrorCategory || (ErrorCategory = {}));
class ErrorManager {
    errorHistory = [];
    maxHistorySize = 100;
    createError(message, operation, category = ErrorCategory.UNKNOWN, originalError) {
        const error = new Error(message);
        error.code = operation;
        error.category = category;
        error.context = {
            operation,
            timestamp: Date.now(),
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : undefined,
        };
        if (originalError) {
            error.originalError = originalError;
            error.stack = originalError.stack;
        }
        // Add to history
        this.errorHistory.push({ ...error, context: error.context });
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
        return error;
    }
    categorizeError(error) {
        const message = error.message.toLowerCase();
        if (message.includes('network') || message.includes('fetch')) {
            return ErrorCategory.NETWORK;
        }
        if (message.includes('timeout')) {
            return ErrorCategory.TIMEOUT;
        }
        if (message.includes('validation') || message.includes('invalid')) {
            return ErrorCategory.VALIDATION;
        }
        if (message.includes('api') || message.includes('server')) {
            return ErrorCategory.API;
        }
        if (message.includes('parse') || message.includes('json')) {
            return ErrorCategory.PARSING;
        }
        return ErrorCategory.UNKNOWN;
    }
    getErrorHistory() {
        return [...this.errorHistory];
    }
    getErrorStats() {
        const stats = {
            [ErrorCategory.NETWORK]: 0,
            [ErrorCategory.VALIDATION]: 0,
            [ErrorCategory.API]: 0,
            [ErrorCategory.PARSING]: 0,
            [ErrorCategory.TIMEOUT]: 0,
            [ErrorCategory.UNKNOWN]: 0,
        };
        this.errorHistory.forEach((error) => {
            const category = error.category || ErrorCategory.UNKNOWN;
            stats[category]++;
        });
        return stats;
    }
    clearHistory() {
        this.errorHistory = [];
    }
}
// Singleton instance
export const errorManager = new ErrorManager();
// Enhanced error handling wrapper with retry logic
export async function withErrorHandling(operation, fallback, operationName, options = {}) {
    const { retries = 0, timeout = 5000, retryDelay = 1000 } = options;
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Add timeout wrapper
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Operation timeout')), timeout);
            });
            const result = await Promise.race([operation(), timeoutPromise]);
            return result;
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            const category = errorManager.categorizeError(lastError);
            const xlogError = errorManager.createError(`${operationName} failed: ${lastError.message}`, operationName, category, lastError);
            // Log error with context
            logger.error(`Error in ${operationName} (attempt ${attempt + 1}/${retries + 1}):`, {
                message: xlogError.message,
                category: xlogError.category,
                context: xlogError.context,
                stack: xlogError.stack,
            }, operationName);
            // Retry logic for specific error types
            if (attempt < retries && shouldRetry(category)) {
                logger.warn(`Retrying ${operationName} in ${retryDelay}ms...`, { attempt, retries }, operationName);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }
            // If we've exhausted retries or error is not retryable, return fallback
            return fallback;
        }
    }
    return fallback;
}
function shouldRetry(category) {
    return [
        ErrorCategory.NETWORK,
        ErrorCategory.TIMEOUT,
        ErrorCategory.API,
    ].includes(category);
}
// Utility functions for common error scenarios
export function handleNetworkError(operation, error) {
    return errorManager.createError(`Network error in ${operation}: ${error.message}`, operation, ErrorCategory.NETWORK, error);
}
export function handleValidationError(operation, field, value) {
    return errorManager.createError(`Validation error in ${operation}: Invalid ${field} value: ${value}`, operation, ErrorCategory.VALIDATION);
}
export function handleApiError(operation, status, message) {
    const error = errorManager.createError(`API error in ${operation}: ${status} - ${message}`, operation, ErrorCategory.API);
    error.status = status;
    return error;
}
// Development helper for error reporting
export function reportError(error) {
    logger.error(`🚨 XLog Error Report: ${error.code}`, {
        message: error.message,
        category: error.category,
        context: error.context,
        originalError: error.originalError,
    }, 'ERROR_REPORT');
}
