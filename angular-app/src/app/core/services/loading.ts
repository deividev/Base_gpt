import { Injectable, signal, computed } from '@angular/core';

/**
 * Loading Service
 *
 * Manages global loading state with support for concurrent requests:
 * - Uses a counter to track multiple simultaneous requests
 * - Exposes reactive signal for UI binding
 *
 * @example
 * ```typescript
 * // In component
 * loading = inject(LoadingService);
 *
 * // In template
 * @if (loading.isLoading()) {
 *   <app-spinner />
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly loadingCount = signal(0);

  /**
   * Whether any requests are in progress
   */
  readonly isLoading = computed(() => this.loadingCount() > 0);

  /**
   * Current number of pending requests
   */
  readonly pendingRequests = computed(() => this.loadingCount());

  /**
   * Increment loading counter (called when request starts)
   */
  show(): void {
    this.loadingCount.update((count) => count + 1);
  }

  /**
   * Decrement loading counter (called when request completes)
   */
  hide(): void {
    this.loadingCount.update((count) => Math.max(0, count - 1));
  }

  /**
   * Reset loading counter (use with caution)
   */
  reset(): void {
    this.loadingCount.set(0);
  }
}
