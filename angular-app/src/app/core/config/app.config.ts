/**
 * Application Configuration Constants
 * 
 * Centralized configuration for the application
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'AgentGames',
  version: '1.0.0',
  description: 'AI-powered gaming platform',
  author: 'AgentGames Team',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  maxPageSize: 100,
} as const;

/**
 * Date/Time formats
 */
export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  displayWithTime: 'dd/MM/yyyy HH:mm',
  api: 'yyyy-MM-dd',
  apiWithTime: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  },
  email: {
    maxLength: 254,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
} as const;

/**
 * Toast/Notification durations (ms)
 */
export const TOAST_DURATION = {
  short: 3000,
  medium: 5000,
  long: 8000,
} as const;

/**
 * Debounce times (ms)
 */
export const DEBOUNCE = {
  search: 300,
  input: 150,
  resize: 100,
  scroll: 50,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  user: 'user',
  theme: 'theme',
  language: 'language',
  preferences: 'preferences',
} as const;
