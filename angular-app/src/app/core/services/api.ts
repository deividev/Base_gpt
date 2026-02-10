import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger';

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * API Request options
 */
export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  withCredentials?: boolean;
}

/**
 * Base API Service
 *
 * Provides a typed HTTP client wrapper with:
 * - Automatic error handling
 * - Request timeout
 * - Base URL configuration
 * - Logging
 *
 * @example
 * ```typescript
 * // In a feature service
 * private api = inject(ApiService);
 *
 * getUsers() {
 *   return this.api.get<User[]>('/users');
 * }
 *
 * createUser(user: CreateUserDto) {
 *   return this.api.post<User>('/users', user);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  private readonly baseUrl = environment.apiUrl;
  private readonly timeoutMs = environment.apiTimeout;

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    this.logger.debug(`[API] GET ${url}`);

    return this.http.get<T>(url, options).pipe(
      timeout(this.timeoutMs),
      catchError((error) => this.handleError(error, 'GET', url)),
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    this.logger.debug(`[API] POST ${url}`, body);

    return this.http.post<T>(url, body, options).pipe(
      timeout(this.timeoutMs),
      catchError((error) => this.handleError(error, 'POST', url)),
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    this.logger.debug(`[API] PUT ${url}`, body);

    return this.http.put<T>(url, body, options).pipe(
      timeout(this.timeoutMs),
      catchError((error) => this.handleError(error, 'PUT', url)),
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    this.logger.debug(`[API] PATCH ${url}`, body);

    return this.http.patch<T>(url, body, options).pipe(
      timeout(this.timeoutMs),
      catchError((error) => this.handleError(error, 'PATCH', url)),
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    this.logger.debug(`[API] DELETE ${url}`);

    return this.http.delete<T>(url, options).pipe(
      timeout(this.timeoutMs),
      catchError((error) => this.handleError(error, 'DELETE', url)),
    );
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    // If endpoint is already a full URL, return as is
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    // Ensure endpoint starts with /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${path}`;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
    let message: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = `Client error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Network error
      message = 'Network error - please check your connection';
    } else {
      // Server error
      message = error.error?.message || error.statusText || 'Server error';
    }

    this.logger.error(`[API] ${method} ${url} failed:`, {
      status: error.status,
      message,
      error: error.error,
    });

    return throwError(() => ({
      status: error.status,
      message,
      originalError: error,
    }));
  }
}
