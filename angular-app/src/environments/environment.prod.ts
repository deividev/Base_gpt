/**
 * Production Environment Configuration
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  apiTimeout: 30000,
  
  // Feature flags
  features: {
    enableAnalytics: true,
    enableDebugMode: false,
    enableMockData: false,
  },
  
  // Logging
  logging: {
    level: 'error', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: false,
  },
  
  // Cache
  cache: {
    defaultTTL: 15 * 60 * 1000, // 15 minutes
  }
};
