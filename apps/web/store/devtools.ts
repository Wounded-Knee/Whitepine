/**
 * Redux DevTools Extension utilities
 * Provides helper functions for DevTools integration and configuration
 */

/**
 * Check if Redux DevTools Extension is available
 */
export const isDevToolsAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.__REDUX_DEVTOOLS_EXTENSION__ === 'function';
};

/**
 * Get the default DevTools configuration for the application
 * Using Redux Toolkit's DevToolsEnhancerOptions type
 */
const getDefaultDevToolsConfig = () => ({
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
});

/**
 * Get environment-specific DevTools configuration
 */
export const getDevToolsConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return false;
  }
  
  return getDefaultDevToolsConfig();
};

/**
 * Log DevTools status to console (development only)
 */
export const logDevToolsStatus = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const isAvailable = isDevToolsAvailable();
    console.log(
      `%cRedux DevTools Extension: ${isAvailable ? 'Available' : 'Not Available'}`,
      `color: ${isAvailable ? 'green' : 'orange'}; font-weight: bold;`
    );
    
    if (isAvailable) {
      console.log(
        '%cYou can now use Redux DevTools to debug your application state!',
        'color: green; font-style: italic;'
      );
    } else {
      console.log(
        '%cInstall Redux DevTools Extension for better debugging experience:',
        'color: orange; font-style: italic;'
      );
      console.log(
        '%cChrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd',
        'color: blue;'
      );
      console.log(
        '%cFirefox: https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/',
        'color: blue;'
      );
    }
  }
};
