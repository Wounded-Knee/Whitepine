/**
 * Configuration Hook
 * 
 * This hook provides access to shared configuration values in the frontend.
 */

import { sharedConfig, getApiUrl, isFeatureEnabled, getThemeColor } from '@/shared/config.js';

export const useConfig = () => {
  return {
    // Direct access to shared config
    config: sharedConfig,
    
    // Helper functions
    getApiUrl,
    isFeatureEnabled,
    getThemeColor,
    
    // Convenience getters
    apiBaseUrl: sharedConfig.api.baseUrl,
    apiVersion: sharedConfig.api.version,
    appName: sharedConfig.app.name,
    appVersion: sharedConfig.app.version,
    environment: sharedConfig.app.environment,
    
    // Feature flags
    isOAuthEnabled: isFeatureEnabled('oauth'),
    isGovernmentDataEnabled: isFeatureEnabled('governmentData'),
    
    // UI settings
    defaultPageSize: sharedConfig.ui.pagination.defaultPageSize,
    maxPageSize: sharedConfig.ui.pagination.maxPageSize,
    primaryColor: getThemeColor('primaryColor'),
    secondaryColor: getThemeColor('secondaryColor'),
    
    // Auth settings
    tokenExpiry: sharedConfig.auth.tokenExpiry,
    refreshTokenExpiry: sharedConfig.auth.refreshTokenExpiry,
    cookieName: sharedConfig.auth.cookieName,
    defaultScopes: sharedConfig.auth.defaultScopes,
  };
};

export default useConfig;
