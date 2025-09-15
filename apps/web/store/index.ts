import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { createTransform } from 'redux-persist';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { createIndexedDBStorage } from './middleware/indexedDBStorage';
import { cacheInvalidationMiddleware } from './middleware/cacheInvalidation';
import { apiTransformMiddleware } from './middleware/apiTransform';
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

// Configure the store
export const store = configureStore({
  reducer: {
    nodes: persistedNodesReducer,
    ui: uiReducer, // UI state not persisted
    cache: persistedCacheReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(cacheInvalidationMiddleware)
      .concat(apiTransformMiddleware),
  devTools: {
    name: 'Whitepine Redux Store',
    trace: true,
    traceLimit: 25,
  },
});

// Create persistor
export const persistor = persistStore(store);

// Export typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
