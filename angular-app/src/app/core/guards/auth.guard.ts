import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { StorageService, LoggerService } from '../services';

/**
 * Auth Guard
 *
 * Protects routes that require authentication:
 * - Checks for valid auth token in storage
 * - Redirects to login if not authenticated
 * - Can be customized for different auth strategies
 *
 * @example
 * ```typescript
 * // In app.routes.ts
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 * ```
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const storage = inject(StorageService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  // Check if user has a valid token
  const token = storage.get<string>('auth_token');

  if (token) {
    logger.debug('[AuthGuard] User authenticated, allowing access');
    return true;
  }

  logger.warn('[AuthGuard] User not authenticated, redirecting to login');

  // Store the attempted URL for redirecting after login
  storage.setSession('redirect_url', state.url);

  // Redirect to login page (update path as needed)
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Guest Guard
 *
 * Protects routes that should only be accessible to non-authenticated users
 * (e.g., login, register pages)
 *
 * @example
 * ```typescript
 * // In app.routes.ts
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard]
 * }
 * ```
 */
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const storage = inject(StorageService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  const token = storage.get<string>('auth_token');

  if (!token) {
    logger.debug('[GuestGuard] No auth token, allowing access');
    return true;
  }

  logger.debug('[GuestGuard] User already authenticated, redirecting to home');
  return router.createUrlTree(['/']);
};

/**
 * Role Guard Factory
 *
 * Creates a guard that checks for specific user roles
 *
 * @example
 * ```typescript
 * // In app.routes.ts
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, roleGuard(['admin', 'superadmin'])]
 * }
 * ```
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (): boolean | UrlTree => {
    const storage = inject(StorageService);
    const router = inject(Router);
    const logger = inject(LoggerService);

    interface UserData {
      role?: string;
      roles?: string[];
    }

    const userData = storage.get<UserData>('user');
    const userRoles = userData?.roles ?? (userData?.role ? [userData.role] : []);

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (hasRole) {
      logger.debug('[RoleGuard] User has required role, allowing access');
      return true;
    }

    logger.warn('[RoleGuard] User lacks required role', {
      required: allowedRoles,
      user: userRoles,
    });
    return router.createUrlTree(['/unauthorized']);
  };
}
