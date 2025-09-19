import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { requestManager } from '@web/lib/requestManager';

interface UseApiRequestOptions<T> {
  /**
   * Function to fetch data from the API
   */
  fetchAction: (id: string) => Promise<T>;
  
  /**
   * Redux selector to get data from store
   */
  selector: (state: any, id: string) => T | null;
  
  /**
   * Redux action to dispatch for fetching
   */
  dispatchAction?: (id: string) => any;
  
  /**
   * Transform function to process the raw API response
   */
  transform?: (data: any) => T;
  
  /**
   * Whether to enable caching (default: true)
   */
  enableCache?: boolean;
  
  /**
   * Custom cache key (default: `${resourceType}-${id}`)
   */
  cacheKey?: string;
}

export interface UseApiRequestResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isCached: boolean;
}

/**
 * Generic hook for managing API requests with built-in deduplication and caching
 * 
 * @param resourceType - Type of resource (e.g., 'nodes', 'users', 'posts')
 * @param resourceId - ID of the resource to fetch
 * @param options - Configuration options for the request
 */
export function useApiRequest<T>(
  resourceType: string,
  resourceId: string,
  options: UseApiRequestOptions<T>
): UseApiRequestResult<T> {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store using the provided selector
  const data = useAppSelector((state) => options.selector(state, resourceId));
  
  // Check if data is cached
  const isCached = useMemo(() => data !== null, [data]);
  
  const refetch = useCallback(async () => {
    // If data already exists and caching is enabled, don't fetch
    if (data && options.enableCache !== false) {
      return;
    }
    
    const requestKey = options.cacheKey || `${resourceType}-${resourceId}`;
    
    try {
      // Check if request is already ongoing
      if (requestManager.isRequestOngoing(requestKey)) {
        const existingPromise = requestManager.getExistingPromise(requestKey);
        if (existingPromise) {
          return existingPromise;
        }
      }
      
      // Start a new request
      let promise: Promise<any>;
      if (options.dispatchAction) {
        // Use Redux action if provided
        promise = dispatch(options.dispatchAction(resourceId)).unwrap();
      } else {
        // Use direct API call
        const rawData = await options.fetchAction(resourceId);
        promise = Promise.resolve(options.transform ? options.transform(rawData) : rawData);
      }
      
      return requestManager.startRequest(requestKey, promise);
    } catch (error) {
      console.error(`Error fetching ${resourceType} ${resourceId}:`, error);
      throw error;
    }
  }, [resourceType, resourceId, data, options, dispatch]);
  
  // Note: Loading and error state management should be implemented by the specific hook
  // that uses this generic hook, as it depends on the Redux slice structure
  const isLoading = false; // To be implemented by consuming hooks
  const error = null; // To be implemented by consuming hooks
  
  return {
    data,
    isLoading,
    error,
    refetch,
    isCached
  };
}
