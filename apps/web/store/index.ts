import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { createTransform } from 'redux-persist';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { createIndexedDBStorage } from './middleware/indexedDBStorage';
import { cacheInvalidationMiddleware } from './middleware/cacheInvalidation';
import { apiTransformMiddleware } from './middleware/apiTransform';
import { getDevToolsConfig, logDevToolsStatus } from './devtools';
import nodesReducer from './slices/nodesSlice';
import uiReducer from './slices/uiSlice';
import cacheReducer from './slices/cacheSlice';
import type { 
  NormalizedNodes, 
  UIState, 
  CacheState, 
  AsyncThunkConfig 
} from './types';

// Create IndexedDB storage for redux-persist
const storage = createIndexedDBStorage();

// Transform for serializing/deserializing data
const transform = createTransform(
  (inboundState: any) => {
    // Insert transformation logic here if needed
    return inboundState;
  },
  (outboundState: any) => {
    // Insert transformation logic here if needed
    return outboundState;
  },
  { whitelist: ['nodes', 'cache'] }
);

// Persist config for nodes and cache only
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['nodes', 'cache'],
  transforms: [transform],
};

// Create persisted reducers
const persistedNodesReducer = persistReducer(
  { ...persistConfig, key: 'nodes' },
  nodesReducer
);

const persistedCacheReducer = persistReducer(
  { ...persistConfig, key: 'cache' },
  cacheReducer
);

// Configure the store with enhanced DevTools support
export const store = configureStore({
  reducer: {
    nodes: persistedNodesReducer,
    ui: uiReducer, // UI state not persisted
    cache: persistedCacheReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(cacheInvalidationMiddleware)
      .concat(apiTransformMiddleware);
  },
  devTools: process.env.NODE_ENV === 'development' ? {
    name: 'Whitepine Redux Store',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action: any) => {
      // Sanitize sensitive data from actions
      const sanitizedAction = { ...action };
      
      // Remove sensitive data from payload if it exists
      if (sanitizedAction.payload && typeof sanitizedAction.payload === 'object') {
        // Add any sensitive field names here
        const sensitiveFields = ['password', 'token', 'secret', 'key'];
        sensitiveFields.forEach(field => {
          if (field in sanitizedAction.payload) {
            sanitizedAction.payload[field] = '[REDACTED]';
          }
        });
      }
      
      return sanitizedAction;
    },
    stateSanitizer: (state: any) => {
      // Sanitize sensitive data from state
      const sanitizedState = { ...state };
      
      // Add any sensitive state sanitization here
      // For example, if you have user data with sensitive fields:
      // if (sanitizedState.user) {
      //   sanitizedState.user = {
      //     ...sanitizedState.user,
      //     password: '[REDACTED]',
      //     token: '[REDACTED]'
      //   };
      // }
      
      return sanitizedState;
    },
  } : false,
});

// Create persistor
export const persistor = persistStore(store);

// Log DevTools status in development
logDevToolsStatus();

// Export typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
