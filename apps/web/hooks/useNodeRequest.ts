import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { fetchNodeById } from '@web/store/slices/nodesSlice';
import { requestManager } from '@web/lib/requestManager';
import type { BaseNode } from '@whitepine/types';

interface UseNodeRequestResult {
  node: BaseNode | null;
  isLoading: boolean;
  error: string | null;
  fetchNode: () => Promise<void>;
}

/**
 * Custom hook for managing node requests with built-in deduplication
 * This prevents multiple components from making the same API request
 */
export function useNodeRequest(nodeId: string): UseNodeRequestResult {
  const dispatch = useAppDispatch();
  const node = useAppSelector((state) => state.nodes.byId[nodeId] || null);
  
  const fetchNode = useCallback(async () => {
    // If node already exists, don't fetch
    if (node) {
      return;
    }
    
    const requestKey = `fetchNodeById-${nodeId}`;
    
    // If request is already ongoing, return the existing promise
    if (requestManager.isRequestOngoing(requestKey)) {
      const existingPromise = requestManager.getExistingPromise(requestKey);
      if (existingPromise) {
        return existingPromise;
      }
    }
    
    // Start a new request and track it globally
    const promise = dispatch(fetchNodeById(nodeId)).unwrap();
    return requestManager.startRequest(requestKey, promise);
  }, [dispatch, nodeId, node]);
  
  // Get loading state from Redux
  const isLoading = useAppSelector((state) => {
    // Check if this specific node fetch is pending
    return state.nodes.loading?.operations?.[`fetchNodeById-${nodeId}`] || false;
  });
  
  // Get error state from Redux
  const error = useAppSelector((state) => {
    // Check if there's an error for this specific node
    return state.nodes.error?.[`fetchNodeById-${nodeId}`] || null;
  });
  
  return {
    node,
    isLoading,
    error,
    fetchNode
  };
}
