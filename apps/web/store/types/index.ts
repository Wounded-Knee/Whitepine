import type { BaseNode, UserNode } from '@shared/types';

// These will be properly typed in the store index file
export type RootState = any; // Will be overridden in store/index.ts
export type AppDispatch = any; // Will be overridden in store/index.ts

// Node types from shared package
export type { BaseNode, UserNode };

// Union type for all node types
export type Node = BaseNode | UserNode;

// Normalized node state structure
export interface NormalizedNodes {
  byId: Record<string, Node>;
  allIds: string[];
}

// UI state types
export interface UIState {
  selectedNodeIds: string[];
  filters: {
    type?: string;
    status?: string;
    search?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  sortOptions: {
    field: string;
    direction: 'asc' | 'desc';
  };
  loading: {
    nodes: boolean;
    operations: Record<string, boolean>;
  };
  error: string | null;
  viewMode: 'list' | 'grid' | 'tree';
}

// Cache state types
export interface CacheState {
  lastFetched: Record<string, number>;
  cacheKeys: Record<string, string>;
  invalidationRules: {
    timeBased: Record<string, number>; // cache key -> TTL in ms
    actionBased: Record<string, string[]>; // action type -> cache keys to invalidate
  };
  metadata: Record<string, any>;
}

// Action types for middleware
export interface CacheInvalidationAction {
  type: string;
  payload: {
    cacheKeys?: string[];
    actionType?: string;
    timestamp?: number;
  };
}

export interface APITransformAction {
  type: string;
  payload: {
    request?: any;
    response?: any;
    error?: any;
  };
}

// Thunk action types
export type ThunkAction<R, S, E, A> = (
  dispatch: AppDispatch,
  getState: () => S,
  extraArgument: E
) => R;

// Async thunk types
export type AsyncThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};
