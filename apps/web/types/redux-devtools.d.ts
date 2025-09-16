/**
 * TypeScript definitions for Redux DevTools Extension
 * This file provides type safety for the Redux DevTools Extension integration
 */

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (config?: any) => any;
  }
}

export interface DevToolsOptions {
  name?: string;
  trace?: boolean;
  traceLimit?: number;
  actionSanitizer?: (action: any) => any;
  stateSanitizer?: (state: any) => any;
  serialize?: {
    options?: {
      symbol?: boolean;
      function?: boolean;
      undefined?: boolean;
      regex?: boolean;
      date?: boolean;
      error?: boolean;
      map?: boolean;
      set?: boolean;
    };
  };
}

export {};
