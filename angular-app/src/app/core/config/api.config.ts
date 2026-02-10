/**
 * API Configuration
 * 
 * Centralized API-related configuration
 */

/**
 * API Endpoints
 * 
 * Group endpoints by domain for better organization
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  users: {
    base: '/users',
    profile: '/users/profile',
    avatar: '/users/avatar',
    preferences: '/users/preferences',
  },
  // Add more endpoint groups as needed
  // projects: {
  //   base: '/projects',
  //   byId: (id: string) => `/projects/${id}`,
  // },
} as const;

/**
 * HTTP Status codes for reference
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Request headers
 */
export const HEADERS = {
  contentType: 'Content-Type',
  authorization: 'Authorization',
  accept: 'Accept',
  skipLoading: 'X-Skip-Loading',
  skipAuth: 'X-Skip-Auth',
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  json: 'application/json',
  formData: 'multipart/form-data',
  urlEncoded: 'application/x-www-form-urlencoded',
} as const;
