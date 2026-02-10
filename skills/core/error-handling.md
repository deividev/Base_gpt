# Error Handling in Angular

## 📋 Metadata

- **Difficulty**: Advanced
- **Prerequisites**: http-client.md, rxjs.md, services.md
- **Estimated Time**: 4-6 hours
- **Version**: Angular 21, TypeScript 5.8+, RxJS 7.8+, Node.js 18.19+/20.11+
- **Category**: Core

## 🎯 Learning Objectives

- Implement global error handling
- Create HTTP error interceptors
- Design user-friendly error messages
- Integrate logging and monitoring
- Handle offline scenarios
- Implement retry strategies
- Test error scenarios

---

## 🚨 Error Handling Strategy

### Error Types in Angular

```typescript
// 1. Client-side errors (TypeScript/JavaScript)
const user = null;
console.log(user.name); // TypeError: Cannot read property 'name' of null

// 2. HTTP errors (API failures)
this.http.get("/api/users").subscribe(); // 404, 500, network error

// 3. Async errors (Promise rejections, Observable errors)
Promise.reject("Something went wrong");
throwError(() => new Error("Observable error"));

// 4. Template errors (binding errors)
{
  {
    nonExistentProperty.value;
  }
}

// 5. Router errors
this.router.navigate(["/invalid-route"]);
```

---

## 🌍 Global Error Handler

### Custom ErrorHandler

```typescript
// core/error-handling/global-error-handler.ts
import { ErrorHandler, Injectable, inject, Injector } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: Error | HttpErrorResponse): void {
    // Get services lazily to avoid circular dependency
    const notificationService = this.injector.get(NotificationService);
    const loggingService = this.injector.get(LoggingService);
    const router = this.injector.get(Router);

    let errorMessage: string;
    let stackTrace: string | undefined;

    if (error instanceof HttpErrorResponse) {
      // Server error
      errorMessage = this.getServerErrorMessage(error);
      loggingService.logError({
        message: errorMessage,
        status: error.status,
        url: error.url,
        timestamp: new Date(),
      });

      // Handle specific HTTP errors
      if (error.status === 401) {
        router.navigate(["/login"]);
        notificationService.error("Session expired. Please login again.");
        return;
      }

      if (error.status === 403) {
        router.navigate(["/forbidden"]);
        notificationService.error(
          "You do not have permission to access this resource.",
        );
        return;
      }

      if (error.status === 404) {
        notificationService.error("The requested resource was not found.");
        return;
      }

      if (error.status >= 500) {
        notificationService.error("Server error. Please try again later.");
      }
    } else {
      // Client-side error
      errorMessage = this.getClientErrorMessage(error);
      stackTrace = error.stack;

      loggingService.logError({
        message: errorMessage,
        stack: stackTrace,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // Show user-friendly message
      notificationService.error(
        "An unexpected error occurred. Please refresh the page.",
      );
    }

    // Log to console in development
    if (!environment.production) {
      console.error("Error caught by GlobalErrorHandler:", error);
    }
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    return `Server error ${error.status}: ${error.statusText}`;
  }

  private getClientErrorMessage(error: Error): string {
    return error.message || "Unknown client error";
  }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // ... other providers
  ],
};
```

---

## 🔌 HTTP Error Interceptor

### Error Interceptor

```typescript
// core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, retry, throwError, timer } from "rxjs";
import { NotificationService } from "../services/notification.service";
import { Router } from "@angular/router";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    // Retry failed requests (except for specific status codes)
    retry({
      count: 2,
      delay: (error, retryCount) => {
        // Don't retry client errors (4xx) or auth errors
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        // Exponential backoff: 1s, 2s
        return timer(retryCount * 1000);
      },
    }),

    // Handle errors
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "An error occurred";

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
      } else {
        // Backend error
        errorMessage = `Server error ${error.status}: ${error.message}`;

        // Handle specific errors
        switch (error.status) {
          case 0:
            errorMessage = "No internet connection. Please check your network.";
            notificationService.error(errorMessage);
            break;

          case 401:
            errorMessage = "Unauthorized. Please login again.";
            router.navigate(["/login"]);
            break;

          case 403:
            errorMessage = "Access denied.";
            notificationService.error(errorMessage);
            break;

          case 404:
            errorMessage = "Resource not found.";
            break;

          case 500:
          case 502:
          case 503:
            errorMessage = "Server error. Please try again later.";
            notificationService.error(errorMessage);
            break;

          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
        }
      }

      console.error("HTTP Error:", errorMessage, error);

      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        originalError: error,
      }));
    }),
  );
};

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([errorInterceptor]))],
};
```

---

## 📝 Logging Service

### Structured Logging

```typescript
// core/services/logging.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: Date;
  data?: any;
  stack?: string;
  url?: string;
  userAgent?: string;
}

@Injectable({ providedIn: "root" })
export class LoggingService {
  private readonly logEndpoint = "/api/logs";
  private logQueue: LogEntry[] = [];
  private readonly maxQueueSize = 100;
  private readonly flushInterval = 30000; // 30 seconds

  constructor(private http: HttpClient) {
    // Flush logs periodically
    setInterval(() => this.flush(), this.flushInterval);

    // Flush logs before page unload
    window.addEventListener("beforeunload", () => this.flush());
  }

  info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  error(message: string, error?: any): void {
    this.log("error", message, {
      error: error?.message,
      stack: error?.stack,
    });
  }

  debug(message: string, data?: any): void {
    if (!environment.production) {
      this.log("debug", message, data);
    }
  }

  logError(errorData: Partial<LogEntry>): void {
    const entry: LogEntry = {
      level: "error",
      message: errorData.message || "Unknown error",
      timestamp: errorData.timestamp || new Date(),
      ...errorData,
    };

    this.addToQueue(entry);
  }

  private log(level: LogEntry["level"], message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Console output
    const consoleMethod =
      level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || "");

    this.addToQueue(entry);
  }

  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);

    // Flush immediately for errors in production
    if (entry.level === "error" && environment.production) {
      this.flush();
    }

    // Flush if queue is full
    if (this.logQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    if (environment.production) {
      // Send to backend
      this.http.post(this.logEndpoint, { logs }).subscribe({
        error: (err) => {
          console.error("Failed to send logs:", err);
          // Re-add to queue
          this.logQueue.unshift(...logs);
        },
      });
    }
  }
}
```

---

## 🎯 User-Friendly Error Messages

### Notification Service

```typescript
// core/services/notification.service.ts
import { Injectable, signal } from "@angular/core";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  notifications = this.notificationsSignal.asReadonly();

  success(message: string, duration = 3000): void {
    this.show("success", message, duration);
  }

  error(message: string, duration = 5000): void {
    this.show("error", message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.show("warning", message, duration);
  }

  info(message: string, duration = 3000): void {
    this.show("info", message, duration);
  }

  private show(
    type: Notification["type"],
    message: string,
    duration: number,
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration,
    };

    this.notificationsSignal.update((notifications) => [
      ...notifications,
      notification,
    ]);

    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  remove(id: string): void {
    this.notificationsSignal.update((notifications) =>
      notifications.filter((n) => n.id !== id),
    );
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// notification.component.ts
@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      @for (notification of notifications(); track notification.id) {
        <div
          class="notification notification-{{ notification.type }}"
          (click)="close(notification.id)"
        >
          <span class="icon">{{ getIcon(notification.type) }}</span>
          <span class="message">{{ notification.message }}</span>
          <button class="close-btn" aria-label="Close">×</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .notification {
        min-width: 300px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .notification-success {
        background: #10b981;
        color: white;
      }

      .notification-error {
        background: #ef4444;
        color: white;
      }

      .notification-warning {
        background: #f59e0b;
        color: white;
      }

      .notification-info {
        background: #3b82f6;
        color: white;
      }

      .close-btn {
        background: none;
        border: none;
        color: inherit;
        font-size: 24px;
        cursor: pointer;
        margin-left: auto;
      }
    `,
  ],
})
export class NotificationsComponent {
  notifications = inject(NotificationService).notifications;

  constructor(private notificationService: NotificationService) {}

  close(id: string): void {
    this.notificationService.remove(id);
  }

  getIcon(type: string): string {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };
    return icons[type] || "";
  }
}
```

---

## 🔄 Retry Strategies

### Smart Retry Logic

```typescript
// core/operators/smart-retry.operator.ts
import { Observable, timer, throwError } from "rxjs";
import { retryWhen, mergeMap } from "rxjs/operators";

export interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  shouldRetry?: (error: any) => boolean;
}

export function smartRetry<T>(config: RetryConfig = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    exponentialBackoff = true,
    shouldRetry = (error) => error.status >= 500,
  } = config;

  return (source: Observable<T>) =>
    source.pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, index) => {
            const retryAttempt = index + 1;

            // Check if we should retry
            if (retryAttempt > maxRetries || !shouldRetry(error)) {
              return throwError(() => error);
            }

            // Calculate delay
            const retryDelay = exponentialBackoff
              ? delay * Math.pow(2, index)
              : delay;

            console.log(
              `Retry attempt ${retryAttempt}/${maxRetries} after ${retryDelay}ms`,
            );

            return timer(retryDelay);
          }),
        ),
      ),
    );
}

// Usage
@Injectable({ providedIn: "root" })
export class DataService {
  constructor(private http: HttpClient) {}

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>("/api/data").pipe(
      smartRetry({
        maxRetries: 3,
        delay: 1000,
        exponentialBackoff: true,
        shouldRetry: (error) => {
          // Retry only for server errors and network issues
          return error.status === 0 || error.status >= 500;
        },
      }),
    );
  }
}
```

---

## 📴 Offline Handling

### Network Status Service

```typescript
// core/services/network-status.service.ts
import { Injectable, signal } from "@angular/core";
import { fromEvent, merge, of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class NetworkStatusService {
  private onlineSignal = signal(navigator.onLine);
  online = this.onlineSignal.asReadonly();

  constructor() {
    // Listen to online/offline events
    merge(
      fromEvent(window, "online").pipe(map(() => true)),
      fromEvent(window, "offline").pipe(map(() => false)),
    ).subscribe((status) => {
      this.onlineSignal.set(status);
      this.handleStatusChange(status);
    });
  }

  private handleStatusChange(isOnline: boolean): void {
    if (isOnline) {
      console.log("Connection restored");
      // Retry failed requests
      this.retryFailedRequests();
    } else {
      console.log("Connection lost");
      // Show offline notification
    }
  }

  private retryFailedRequests(): void {
    // Implement retry logic for queued requests
  }
}

// offline-indicator.component.ts
@Component({
  selector: "app-offline-indicator",
  standalone: true,
  template: `
    @if (!online()) {
      <div class="offline-banner">
        <span>⚠️ You are offline. Some features may not work.</span>
      </div>
    }
  `,
  styles: [
    `
      .offline-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ef4444;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
      }
    `,
  ],
})
export class OfflineIndicatorComponent {
  online = inject(NetworkStatusService).online;
}
```

### Request Queue for Offline

```typescript
// core/services/request-queue.service.ts
import { Injectable } from "@angular/core";
import { HttpRequest } from "@angular/common/http";

interface QueuedRequest {
  request: HttpRequest<any>;
  timestamp: Date;
}

@Injectable({ providedIn: "root" })
export class RequestQueueService {
  private queue: QueuedRequest[] = [];

  constructor(
    private http: HttpClient,
    private networkStatus: NetworkStatusService,
  ) {
    // Retry queued requests when back online
    effect(() => {
      if (this.networkStatus.online()) {
        this.processQueue();
      }
    });
  }

  addToQueue(request: HttpRequest<any>): void {
    this.queue.push({
      request,
      timestamp: new Date(),
    });

    // Persist to localStorage
    this.saveQueue();
  }

  private processQueue(): void {
    const queue = [...this.queue];
    this.queue = [];

    queue.forEach(({ request }) => {
      this.http.request(request).subscribe({
        next: () => console.log("Queued request sent successfully"),
        error: (err) => {
          console.error("Failed to send queued request:", err);
          // Re-add to queue if still offline
          if (!this.networkStatus.online()) {
            this.addToQueue(request);
          }
        },
      });
    });

    this.saveQueue();
  }

  private saveQueue(): void {
    localStorage.setItem("request-queue", JSON.stringify(this.queue));
  }

  private loadQueue(): void {
    const saved = localStorage.getItem("request-queue");
    if (saved) {
      this.queue = JSON.parse(saved);
    }
  }
}
```

---

## 🧪 Testing Error Scenarios

### Unit Tests for Error Handling

```typescript
// global-error-handler.spec.ts
describe("GlobalErrorHandler", () => {
  let handler: GlobalErrorHandler;
  let notificationService: jest.Mocked<NotificationService>;
  let loggingService: jest.Mocked<LoggingService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    notificationService = {
      error: jest.fn(),
    } as any;

    loggingService = {
      logError: jest.fn(),
    } as any;

    router = {
      navigate: jest.fn(),
    } as any;

    const injector = {
      get: (token: any) => {
        if (token === NotificationService) return notificationService;
        if (token === LoggingService) return loggingService;
        if (token === Router) return router;
      },
    } as any;

    handler = new GlobalErrorHandler();
    (handler as any).injector = injector;
  });

  it("should handle HTTP 401 error", () => {
    const error = new HttpErrorResponse({
      status: 401,
      statusText: "Unauthorized",
    });

    handler.handleError(error);

    expect(router.navigate).toHaveBeenCalledWith(["/login"]);
    expect(notificationService.error).toHaveBeenCalledWith(
      expect.stringContaining("login"),
    );
  });

  it("should handle client-side error", () => {
    const error = new TypeError("Cannot read property of null");

    handler.handleError(error);

    expect(loggingService.logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        stack: expect.any(String),
      }),
    );

    expect(notificationService.error).toHaveBeenCalled();
  });

  it("should handle HTTP 500 error", () => {
    const error = new HttpErrorResponse({
      status: 500,
      statusText: "Internal Server Error",
    });

    handler.handleError(error);

    expect(loggingService.logError).toHaveBeenCalled();
    expect(notificationService.error).toHaveBeenCalledWith(
      expect.stringContaining("Server error"),
    );
  });
});

// error.interceptor.spec.ts
describe("errorInterceptor", () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should retry failed request", fakeAsync(() => {
    let callCount = 0;

    http.get("/api/data").subscribe({
      next: (data) => {
        expect(data).toEqual({ success: true });
        expect(callCount).toBe(2); // Initial + 1 retry
      },
    });

    // First call fails
    const req1 = httpMock.expectOne("/api/data");
    callCount++;
    req1.flush("Error", { status: 500, statusText: "Server Error" });

    tick(1000);

    // Second call succeeds
    const req2 = httpMock.expectOne("/api/data");
    callCount++;
    req2.flush({ success: true });

    tick();
  }));

  it("should not retry 404 errors", () => {
    http.get("/api/data").subscribe({
      error: (err) => {
        expect(err.status).toBe(404);
      },
    });

    const req = httpMock.expectOne("/api/data");
    req.flush("Not Found", { status: 404, statusText: "Not Found" });

    // Should not retry
    httpMock.expectNone("/api/data");
  });
});
```

---

## 📊 Monitoring Integration

### Integration with External Services

```typescript
// core/services/monitoring.service.ts
import { Injectable } from "@angular/core";

declare const Sentry: any;

@Injectable({ providedIn: "root" })
export class MonitoringService {
  constructor() {
    if (environment.production && environment.sentryDsn) {
      this.initSentry();
    }
  }

  private initSentry(): void {
    Sentry.init({
      dsn: environment.sentryDsn,
      environment: environment.production ? "production" : "development",
      beforeSend(event: any) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
        }
        return event;
      },
    });
  }

  captureError(error: Error, context?: Record<string, any>): void {
    if (environment.production) {
      Sentry.captureException(error, {
        extra: context,
      });
    } else {
      console.error("Error captured:", error, context);
    }
  }

  setUser(user: { id: string; email: string }): void {
    if (environment.production) {
      Sentry.setUser(user);
    }
  }

  addBreadcrumb(message: string, data?: any): void {
    if (environment.production) {
      Sentry.addBreadcrumb({
        message,
        data,
        timestamp: Date.now(),
      });
    }
  }
}
```

---

## ✅ Best Practices

### 1. Fail Gracefully

```typescript
// ✅ GOOD: Provide fallback
getData(): Observable<Data[]> {
  return this.http.get<Data[]>('/api/data').pipe(
    catchError(() => of([])) // Return empty array on error
  );
}

// ❌ BAD: Let error propagate unhandled
getData(): Observable<Data[]> {
  return this.http.get<Data[]>('/api/data');
}
```

### 2. User-Friendly Messages

```typescript
// ✅ GOOD: Clear, actionable message
"Unable to save changes. Please check your internet connection and try again.";

// ❌ BAD: Technical jargon
"HTTP 500: Internal Server Error at /api/users/123";
```

### 3. Log Contextual Information

```typescript
// ✅ GOOD: Include context
this.logger.error("Failed to load user", {
  userId: "123",
  timestamp: new Date(),
  url: window.location.href,
});

// ❌ BAD: Generic message
this.logger.error("Error");
```

---

## ✅ Checklist

### Error Handling

- [ ] Global error handler implemented
- [ ] HTTP error interceptor configured
- [ ] User-friendly error messages
- [ ] Retry strategies for transient failures

### Logging

- [ ] Structured logging service
- [ ] Error logging to backend
- [ ] Context included in logs
- [ ] Log levels configured

### User Experience

- [ ] Error notifications displayed
- [ ] Offline indicator shown
- [ ] Loading states handled
- [ ] Graceful degradation

### Monitoring

- [ ] External monitoring integrated (Sentry, etc.)
- [ ] Error tracking configured
- [ ] User context captured
- [ ] Breadcrumbs recorded

---

## 🎓 Conclusión

Error handling robusto es esencial:

- **Global handler**: Captura todos los errores
- **User-friendly**: Mensajes claros y accionables
- **Resilience**: Retry strategies y offline support
- **Monitoring**: Track errors en producción

**Regla de oro**: Falla silenciosamente para el usuario, pero ruidosamente para los desarrolladores.

---

## 📚 Recursos

- Angular ErrorHandler: https://angular.dev/api/core/ErrorHandler
- HTTP Error Handling: https://angular.dev/guide/http-handle-request-errors
- RxJS Error Handling: https://rxjs.dev/guide/error-handling
- Sentry for Angular: https://docs.sentry.io/platforms/javascript/guides/angular/
