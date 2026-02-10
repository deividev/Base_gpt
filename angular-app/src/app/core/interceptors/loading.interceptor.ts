import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading';

/**
 * Loading Interceptor
 * 
 * Automatically manages loading state for HTTP requests:
 * - Increments loading counter on request start
 * - Decrements on request complete (success or error)
 * - Supports concurrent requests
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(
 *   withInterceptors([loadingInterceptor])
 * )
 * 
 * // In component
 * loading = inject(LoadingService);
 * isLoading = this.loading.isLoading;
 * ```
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading indicator for certain requests
  const skipLoading = req.headers.has('X-Skip-Loading');
  
  if (!skipLoading) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        loadingService.hide();
      }
    })
  );
};
