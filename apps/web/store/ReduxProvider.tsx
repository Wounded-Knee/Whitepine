'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import type { ReactNode } from 'react';

interface ReduxProviderProps {
  children: ReactNode;
}

// Splash screen for PersistGate
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-8 px-4">
      {/* Logo/Brand Section */}
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Whitepine
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          The Digital Town Hall
        </p>
      </div>
      
      {/* Animated Loading Indicator - Red, Gray, Blue carousel */}
      <div className="flex justify-center">
        <div className="dot-carousel-patriotic"></div>
      </div>
    </div>
  </div>
);

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
