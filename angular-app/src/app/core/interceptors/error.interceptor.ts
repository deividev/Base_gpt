import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services';

/**
 * Error Interceptor
 * 
 * Global HTTP error handling:
 * - Logs all HTTP errors
 * - Transforms errors to consistent format
 * - Can trigger global error notifications
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(
 *   withInterceptors([errorInterceptor])
 * )
 * ```
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log the error
      logger.error(`[HTTP Error] ${req.method} ${req.url}`, {
        status: error.status,
        statusText: error.statusText,
        message: error.error?.message || error.message,
        url: req.url
      });

      // Handle specific error codes
      switch (error.status) {
        case 0:
          // Network error
          logger.error('Network error - check your internet connection');
          break;
          
        case 401:
          // Unauthorized - could trigger logout or redirect to login
          logger.warn('Unauthorized - session may have expired');
          // You could inject AuthService and call logout() here
          break;
          
        case 403:
          // Forbidden
          logger.warn('Access denied to this resource');
          break;
          
        case 404:
          // Not found
          logger.warn('Resource not found');
          break;
          
        case 500:
        case 502:
        case 503:
          // Server errors
          logger.error('Server error - please try again later');
          break;
      }

      // Re-throw the error for the caller to handle
      return throwError(() => error);
    })
  );
};
