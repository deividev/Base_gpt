import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger';

/**
 * Storage Service
 *
 * Typed wrapper for localStorage and sessionStorage with:
 * - JSON serialization/deserialization
 * - Type safety
 * - Error handling
 * - Optional expiration
 *
 * @example
 * ```typescript
 * // Save data
 * storage.set('user', { id: 1, name: 'John' });
 *
 * // Get data with type
 * const user = storage.get<User>('user');
 *
 * // Remove data
 * storage.remove('user');
 *
 * // Set with expiration (1 hour)
 * storage.set('token', 'abc123', { expiresIn: 3600000 });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly logger = inject(LoggerService);
  private readonly prefix = 'app_';

  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    return this.getFromStorage<T>(localStorage, key);
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T, options?: { expiresIn?: number }): void {
    this.setInStorage(localStorage, key, value, options);
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    this.removeFromStorage(localStorage, key);
  }

  /**
   * Clear all app data from localStorage
   */
  clear(): void {
    this.clearStorage(localStorage);
  }

  /**
   * Get item from sessionStorage
   */
  getSession<T>(key: string): T | null {
    return this.getFromStorage<T>(sessionStorage, key);
  }

  /**
   * Set item in sessionStorage
   */
  setSession<T>(key: string, value: T, options?: { expiresIn?: number }): void {
    this.setInStorage(sessionStorage, key, value, options);
  }

  /**
   * Remove item from sessionStorage
   */
  removeSession(key: string): void {
    this.removeFromStorage(sessionStorage, key);
  }

  /**
   * Clear all app data from sessionStorage
   */
  clearSession(): void {
    this.clearStorage(sessionStorage);
  }

  /**
   * Check if key exists in localStorage
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Check if key exists in sessionStorage
   */
  hasSession(key: string): boolean {
    return this.getSession(key) !== null;
  }

  // Private methods

  private getFromStorage<T>(storage: Storage, key: string): T | null {
    try {
      const prefixedKey = this.prefix + key;
      const item = storage.getItem(prefixedKey);

      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);

      // Check expiration
      if (parsed._expires && Date.now() > parsed._expires) {
        this.removeFromStorage(storage, key);
        this.logger.debug(`[Storage] Key "${key}" expired`);
        return null;
      }

      return parsed._value !== undefined ? parsed._value : parsed;
    } catch (error) {
      this.logger.warn(`[Storage] Error reading "${key}":`, error);
      return null;
    }
  }

  private setInStorage<T>(
    storage: Storage,
    key: string,
    value: T,
    options?: { expiresIn?: number },
  ): void {
    try {
      const prefixedKey = this.prefix + key;

      const data: { _value: T; _expires?: number } = { _value: value };

      if (options?.expiresIn) {
        data._expires = Date.now() + options.expiresIn;
      }

      storage.setItem(prefixedKey, JSON.stringify(data));
      this.logger.debug(`[Storage] Set "${key}"`);
    } catch (error) {
      this.logger.error(`[Storage] Error writing "${key}":`, error);
    }
  }

  private removeFromStorage(storage: Storage, key: string): void {
    try {
      const prefixedKey = this.prefix + key;
      storage.removeItem(prefixedKey);
      this.logger.debug(`[Storage] Removed "${key}"`);
    } catch (error) {
      this.logger.warn(`[Storage] Error removing "${key}":`, error);
    }
  }

  private clearStorage(storage: Storage): void {
    try {
      // Only clear items with our prefix
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
      this.logger.debug(`[Storage] Cleared ${keysToRemove.length} items`);
    } catch (error) {
      this.logger.error('[Storage] Error clearing storage:', error);
    }
  }
}
