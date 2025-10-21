import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CacheState } from '../types';

// Initial state
const initialState: CacheState = {
  lastFetched: {},
  cacheKeys: {},
  invalidationRules: {
    timeBased: {},
    actionBased: {},
  },
  metadata: {},
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    // Cache timestamp actions
    setLastFetched: (state, action: PayloadAction<{ key: string; timestamp: number }>) => {
      const { key, timestamp } = action.payload;
      state.lastFetched[key] = timestamp;
    },
    
    setLastFetchedMultiple: (state, action: PayloadAction<Record<string, number>>) => {
      state.lastFetched = { ...state.lastFetched, ...action.payload };
    },
    
    clearLastFetched: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      delete state.lastFetched[key];
    },
    
    clearAllLastFetched: (state) => {
      state.lastFetched = {};
    },
    
    // Cache key actions
    setCacheKey: (state, action: PayloadAction<{ key: string; value: string }>) => {
      const { key, value } = action.payload;
      state.cacheKeys[key] = value;
    },
    
    setCacheKeys: (state, action: PayloadAction<Record<string, string>>) => {
      state.cacheKeys = { ...state.cacheKeys, ...action.payload };
    },
    
    clearCacheKey: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      delete state.cacheKeys[key];
    },
    
    clearAllCacheKeys: (state) => {
      state.cacheKeys = {};
    },
    
    // Time-based invalidation rules
    setTimeBasedRule: (state, action: PayloadAction<{ key: string; ttl: number }>) => {
      const { key, ttl } = action.payload;
      state.invalidationRules.timeBased[key] = ttl;
    },
    
    setTimeBasedRules: (state, action: PayloadAction<Record<string, number>>) => {
      state.invalidationRules.timeBased = { ...state.invalidationRules.timeBased, ...action.payload };
    },
    
    clearTimeBasedRule: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      delete state.invalidationRules.timeBased[key];
    },
    
    clearAllTimeBasedRules: (state) => {
      state.invalidationRules.timeBased = {};
    },
    
    // Action-based invalidation rules
    setActionBasedRule: (state, action: PayloadAction<{ actionType: string; cacheKeys: string[] }>) => {
      const { actionType, cacheKeys } = action.payload;
      state.invalidationRules.actionBased[actionType] = cacheKeys;
    },
    
    addActionBasedRule: (state, action: PayloadAction<{ actionType: string; cacheKey: string }>) => {
      const { actionType, cacheKey } = action.payload;
      if (!state.invalidationRules.actionBased[actionType]) {
        state.invalidationRules.actionBased[actionType] = [];
      }
      if (!state.invalidationRules.actionBased[actionType].includes(cacheKey)) {
        state.invalidationRules.actionBased[actionType].push(cacheKey);
      }
    },
    
    removeActionBasedRule: (state, action: PayloadAction<{ actionType: string; cacheKey: string }>) => {
      const { actionType, cacheKey } = action.payload;
      if (state.invalidationRules.actionBased[actionType]) {
        state.invalidationRules.actionBased[actionType] = state.invalidationRules.actionBased[actionType].filter(
          key => key !== cacheKey
        );
      }
    },
    
    clearActionBasedRule: (state, action: PayloadAction<string>) => {
      const actionType = action.payload;
      delete state.invalidationRules.actionBased[actionType];
    },
    
    clearAllActionBasedRules: (state) => {
      state.invalidationRules.actionBased = {};
    },
    
    // Metadata actions
    setMetadata: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      state.metadata[key] = value;
    },
    
    setMetadataMultiple: (state, action: PayloadAction<Record<string, any>>) => {
      state.metadata = { ...state.metadata, ...action.payload };
    },
    
    clearMetadata: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      delete state.metadata[key];
    },
    
    clearAllMetadata: (state) => {
      state.metadata = {};
    },
    
    // Cache invalidation actions
    invalidateCache: (state, action: PayloadAction<string[]>) => {
      const cacheKeys = action.payload;
      cacheKeys.forEach(key => {
        delete state.lastFetched[key];
        delete state.cacheKeys[key];
        delete state.metadata[key];
      });
    },
    
    invalidateAllCache: (state) => {
      state.lastFetched = {};
      state.cacheKeys = {};
      state.metadata = {};
    },
    
    // Utility actions
    checkCacheValid: (state, action: PayloadAction<{ key: string; currentTime: number }>) => {
      const { key, currentTime } = action.payload;
      const lastFetched = state.lastFetched[key];
      const ttl = state.invalidationRules.timeBased[key];
      
      // This is a utility action that doesn't modify state
      // The actual validation should be done in selectors
    },
    
    // Reset actions
    resetCache: (state) => {
      return initialState;
    },
  },
});

export const {
  invalidateCache,
  invalidateAllCache,
} = cacheSlice.actions;

export default cacheSlice.reducer;
