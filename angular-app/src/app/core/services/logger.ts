import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger Service
 *
 * Centralized logging with:
 * - Log levels (debug, info, warn, error)
 * - Environment-based filtering
 * - Structured logging support
 * - Production-safe (disables console in prod)
 *
 * @example
 * ```typescript
 * logger.debug('Processing items', { count: 5 });
 * logger.info('User logged in', { userId: 123 });
 * logger.warn('Rate limit approaching', { current: 90, max: 100 });
 * logger.error('Failed to save', error);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly minLevel: number;
  private readonly enableConsole: boolean;

  constructor() {
    this.minLevel = LOG_LEVELS[environment.logging.level as LogLevel] ?? LOG_LEVELS.info;
    this.enableConsole = environment.logging.enableConsole;
  }

  /**
   * Debug level - detailed information for debugging
   */
  debug(message: string, ...data: unknown[]): void {
    this.log('debug', message, data);
  }

  /**
   * Info level - general information about app flow
   */
  info(message: string, ...data: unknown[]): void {
    this.log('info', message, data);
  }

  /**
   * Warn level - potential issues that don't stop execution
   */
  warn(message: string, ...data: unknown[]): void {
    this.log('warn', message, data);
  }

  /**
   * Error level - errors that need attention
   */
  error(message: string, ...data: unknown[]): void {
    this.log('error', message, data);
  }

  /**
   * Group related logs together
   */
  group(label: string): void {
    if (this.enableConsole && this.shouldLog('debug')) {
      console.group(this.formatLabel(label));
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.enableConsole && this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  /**
   * Log with timing
   */
  time(label: string): void {
    if (this.enableConsole && this.shouldLog('debug')) {
      console.time(label);
    }
  }

  /**
   * End timing log
   */
  timeEnd(label: string): void {
    if (this.enableConsole && this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  /**
   * Log a table (useful for arrays/objects)
   */
  table(data: unknown): void {
    if (this.enableConsole && this.shouldLog('debug')) {
      console.table(data);
    }
  }

  private log(level: LogLevel, message: string, data: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${this.formatLabel(level.toUpperCase())} ${message}`;

    if (this.enableConsole) {
      const consoleFn = this.getConsoleFn(level);

      if (data.length > 0) {
        consoleFn(formattedMessage, ...data);
      } else {
        consoleFn(formattedMessage);
      }
    }

    // Here you could add remote logging (e.g., to a logging service)
    // if (environment.production && level === 'error') {
    //   this.sendToRemote(level, message, data);
    // }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private getConsoleFn(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
        return console.debug.bind(console);
      case 'info':
        return console.info.bind(console);
      case 'warn':
        return console.warn.bind(console);
      case 'error':
        return console.error.bind(console);
    }
  }

  private formatLabel(label: string): string {
    const colors: Record<string, string> = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
    };
    return `${colors[label] || '📝'} ${label}`;
  }
}
