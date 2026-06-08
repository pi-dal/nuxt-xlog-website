import { createContextLogger } from './logger';
const log = createContextLogger('batch');
export class BatchManager {
    pending = new Map();
    timeouts = new Map();
    batchDelay;
    maxBatchSize;
    constructor(batchDelay = 50, maxBatchSize = 10) {
        this.batchDelay = batchDelay;
        this.maxBatchSize = maxBatchSize;
    }
    add(operation, params) {
        return new Promise((resolve, reject) => {
            const request = {
                id: `${operation}:${JSON.stringify(params)}`,
                operation,
                params,
                resolve,
                reject,
            };
            if (!this.pending.has(operation)) {
                this.pending.set(operation, []);
            }
            const requests = this.pending.get(operation);
            requests.push(request);
            // Check if we should flush immediately
            if (requests.length >= this.maxBatchSize) {
                this.flush(operation);
            }
            else {
                // Set or reset the flush timer
                this.scheduleFlush(operation);
            }
        });
    }
    scheduleFlush(operation) {
        // Clear existing timeout
        const existingTimeout = this.timeouts.get(operation);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        // Schedule new flush
        const timeout = setTimeout(() => {
            this.flush(operation);
        }, this.batchDelay);
        this.timeouts.set(operation, timeout);
    }
    async flush(operation) {
        const requests = this.pending.get(operation);
        if (!requests || requests.length === 0)
            return;
        // Clear the operation from pending and timeouts
        this.pending.delete(operation);
        const timeout = this.timeouts.get(operation);
        if (timeout) {
            clearTimeout(timeout);
            this.timeouts.delete(operation);
        }
        log.debug(`Flushing batch for ${operation}`, { count: requests.length });
        try {
            await this.executeBatch(operation, requests);
        }
        catch (error) {
            log.error(`Batch execution failed for ${operation}`, error);
            // Reject all pending requests
            requests.forEach(req => req.reject(error));
        }
    }
    async executeBatch(operation, requests) {
        switch (operation) {
            case 'getPostsByIds':
                await this.batchGetPostsByIds(requests);
                break;
            case 'getSiteInfos':
                await this.batchGetSiteInfos(requests);
                break;
            default:
                // For operations that don't support batching, execute individually
                await this.executeIndividually(requests);
        }
    }
    async batchGetPostsByIds(requests) {
        // Group requests by handle
        const byHandle = new Map();
        requests.forEach((req) => {
            const handle = req.params.handle;
            if (!byHandle.has(handle)) {
                byHandle.set(handle, []);
            }
            byHandle.get(handle).push(req);
        });
        // Execute batched requests for each handle
        for (const [_handle, handleRequests] of byHandle) {
            try {
                const _ids = handleRequests.map(req => req.params.id);
                // This would require a batch API call - for now, fall back to individual calls
                // In a real implementation, you'd make a single GraphQL query for multiple IDs
                await this.executeIndividually(handleRequests);
            }
            catch (error) {
                handleRequests.forEach(req => req.reject(error));
            }
        }
    }
    async batchGetSiteInfos(requests) {
        // Group unique handles
        const _uniqueHandles = [...new Set(requests.map(req => req.params.handle))];
        try {
            // This would make a batch GraphQL query for multiple handles
            // For now, fall back to individual execution
            await this.executeIndividually(requests);
        }
        catch (error) {
            requests.forEach(req => req.reject(error));
        }
    }
    async executeIndividually(requests) {
        // Execute each request individually
        // This is the fallback for operations that don't support true batching
        const promises = requests.map(async (req) => {
            try {
                // This would call the original API function
                // For now, we reject as this needs to be integrated with actual API calls
                req.reject(new Error(`Batch operation ${req.operation} not implemented`));
            }
            catch (error) {
                req.reject(error);
            }
        });
        await Promise.allSettled(promises);
    }
    clear() {
        // Clear all pending requests and timeouts
        for (const timeout of this.timeouts.values()) {
            clearTimeout(timeout);
        }
        this.timeouts.clear();
        // Reject all pending requests
        for (const requests of this.pending.values()) {
            requests.forEach(req => req.reject(new Error('Batch manager cleared')));
        }
        this.pending.clear();
    }
}
// Singleton instance
export const batchManager = new BatchManager();
// Utility function to add request to batch
export function batchRequest(operation, params) {
    return batchManager.add(operation, params);
}
// DataLoader-style interface for common operations
export class DataLoaderCache {
    cache = new Map();
    batchLoadFn;
    maxBatchSize;
    cacheMap = new Map();
    constructor(batchLoadFn, options = {}) {
        this.batchLoadFn = batchLoadFn;
        this.maxBatchSize = options.maxBatchSize || 10;
    }
    async load(key) {
        const keyStr = JSON.stringify(key);
        // Check cache first
        if (this.cacheMap.has(keyStr)) {
            return this.cacheMap.get(keyStr);
        }
        // Check if already loading
        if (this.cache.has(keyStr)) {
            return this.cache.get(keyStr);
        }
        // Create new promise and add to cache
        const promise = this.createBatchedPromise(key);
        this.cache.set(keyStr, promise);
        return promise;
    }
    async createBatchedPromise(key) {
        // This is a simplified version - a full implementation would batch multiple concurrent requests
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const results = await this.batchLoadFn([key]);
                    const result = results[0];
                    if (result !== undefined) {
                        const keyStr = JSON.stringify(key);
                        this.cacheMap.set(keyStr, result);
                        this.cache.delete(keyStr);
                        resolve(result);
                    }
                    else {
                        reject(new Error('No result found'));
                    }
                }
                catch (error) {
                    this.cache.delete(JSON.stringify(key));
                    reject(error);
                }
            }, 0);
        });
    }
    clear() {
        this.cache.clear();
        this.cacheMap.clear();
    }
}
// Example usage for posts
export const postLoader = new DataLoaderCache(async (_keys) => {
    // This would make a batched API call
    // For now, return empty array
    return [];
});
export const siteLoader = new DataLoaderCache(async (_handles) => {
    // This would make a batched API call for multiple site handles
    return [];
});
