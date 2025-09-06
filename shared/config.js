/**
 * Shared Configuration
 * 
 * This file contains configuration values that are shared between
 * the frontend (Next.js) and backend (Express.js) applications.
 * Includes environment-specific configurations for development, staging, and production.
 */

// Environment-specific configurations
const environments = {
  development: {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      timeout: 10000,
    },
    app: {
      name: 'Whitepine Civic Platform - Development',
      environment: 'development',
    },
    features: {
      debugMode: true,
      verboseLogging: true,
    },
    security: {
      corsOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
      ],
    },
  },

  staging: {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.whitepine.com',
      timeout: 15000,
    },
    app: {
      name: 'Whitepine Civic Platform - Staging',
      environment: 'staging',
    },
    features: {
      debugMode: false,
      verboseLogging: false,
    },
    security: {
      corsOrigins: [
        'https://staging.whitepine.com',
        'https://staging-api.whitepine.com',
      ],
    },
  },

  production: {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.whitepine.com',
      timeout: 20000,
    },
    app: {
      name: 'Whitepine Civic Platform',
      environment: 'production',
    },
    features: {
      debugMode: false,
      verboseLogging: false,
    },
    security: {
      corsOrigins: [
        'https://whitepine.com',
        'https://api.whitepine.com',
      ],
    },
  },
};

// Default configuration that applies to all environments
const defaultConfig = {
  api: {
    version: 'v1',
  },
  auth: {
    tokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    cookieName: 'refreshToken',
    defaultScopes: [
      'users:read',
      'media:read',
      'gov:read',
      'identities:read',
    ],
  },
  app: {
    version: '1.0.0',
  },
  features: {
    oauth: true,
    governmentData: true,
  },
  ui: {
    theme: {
      primaryColor: '#1e3a8a', // fs-15056
      secondaryColor: '#7a8a6b', // fs-14272
    },
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
    },
  },
};

// Get environment configuration
const getEnvironmentConfig = (env = process.env.NODE_ENV || 'development') => {
  const config = environments[env] || environments.development;
  
  // Merge with default configuration
  return {
    ...defaultConfig,
    ...config,
    api: {
      ...defaultConfig.api,
      ...config.api,
    },
    auth: {
      ...defaultConfig.auth,
      ...config.auth,
    },
    app: {
      ...defaultConfig.app,
      ...config.app,
    },
    features: {
      ...defaultConfig.features,
      ...config.features,
    },
    ui: {
      ...defaultConfig.ui,
      ...config.ui,
    },
  };
};

// Get current environment configuration
const getConfig = () => {
  return getEnvironmentConfig(process.env.NODE_ENV);
};

const sharedConfig = getConfig();

// Helper functions
const getApiUrl = (endpoint = '') => {
  return `${sharedConfig.api.baseUrl}/${sharedConfig.api.version}${endpoint}`;
};

const isFeatureEnabled = (feature) => {
  return sharedConfig.features[feature];
};

const getThemeColor = (color) => {
  return sharedConfig.ui.theme[color];
};

// Environment helper functions
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

const isStaging = () => {
  return process.env.NODE_ENV === 'staging';
};

module.exports = {
  sharedConfig,
  getApiUrl,
  isFeatureEnabled,
  getThemeColor,
  getEnvironmentConfig,
  getCurrentConfig: getConfig,
  isProduction,
  isDevelopment,
  isStaging,
};
