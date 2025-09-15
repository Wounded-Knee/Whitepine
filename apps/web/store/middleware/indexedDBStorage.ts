import { createTransform } from 'redux-persist';

// IndexedDB storage implementation for redux-persist
export const createIndexedDBStorage = () => {
  const DB_NAME = 'whitepine-redux-store';
  const DB_VERSION = 1;
  const STORE_NAME = 'redux-persist';

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

  if (!isBrowser) {
    // Return a no-op storage for SSR
    return {
      getItem: (key: string): Promise<string | null> => {
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string): Promise<void> => {
        return Promise.resolve();
      },
      removeItem: (key: string): Promise<void> => {
        return Promise.resolve();
      },
    };
  }

  return {
    getItem: (key: string): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const getRequest = store.get(key);
          
          getRequest.onsuccess = () => {
            resolve(getRequest.result || null);
          };
          getRequest.onerror = () => reject(getRequest.error);
        };
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
      });
    },

    setItem: (key: string, value: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const putRequest = store.put(value, key);
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        };
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
      });
    },

    removeItem: (key: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const deleteRequest = store.delete(key);
          
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        };
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
      });
    },
  };
};
