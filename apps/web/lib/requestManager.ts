/**
 * Global request manager for deduplicating API requests across all components
 */

class RequestManager {
  private ongoingRequests = new Set<string>();
  private requestPromises = new Map<string, Promise<any>>();

  /**
   * Check if a request for the given key is already ongoing
   */
  isRequestOngoing(key: string): boolean {
    return this.ongoingRequests.has(key);
  }

  /**
   * Get an existing promise for a request if it exists
   */
  getExistingPromise(key: string): Promise<any> | undefined {
    return this.requestPromises.get(key);
  }

  /**
   * Start tracking a new request
   */
  startRequest(key: string, promise: Promise<any>): Promise<any> {
    this.ongoingRequests.add(key);
    this.requestPromises.set(key, promise);

    // Clean up when the request completes
    promise.finally(() => {
      this.ongoingRequests.delete(key);
      this.requestPromises.delete(key);
    });

    return promise;
  }

  /**
   * Clear all ongoing requests (useful for cleanup)
   */
  clearAll(): void {
    this.ongoingRequests.clear();
    this.requestPromises.clear();
  }
}

// Export a singleton instance
export const requestManager = new RequestManager();
