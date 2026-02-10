/**
 * Development Environment Configuration
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,

  // Feature flags
  features: {
    enableAnalytics: false,
    enableDebugMode: true,
    enableMockData: true,
  },

  // Logging
  logging: {
    level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: true,
  },

  // Cache
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
  },
};

export type Environment = typeof environment;
