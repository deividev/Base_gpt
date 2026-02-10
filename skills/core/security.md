# Security in Angular

## 📋 Metadata

- **Difficulty**: Advanced
- **Prerequisites**: http-client.md, routing.md, forms.md
- **Estimated Time**: 5-7 hours
- **Version**: Angular 21, TypeScript 5.8+, Node.js 18.19+/20.11+
- **Category**: Core

## 🎯 Learning Objectives

- Prevent XSS attacks
- Implement CSRF protection
- Configure Content Security Policy
- Implement authentication (JWT, OAuth)
- Design authorization with guards
- Secure HTTP communication
- Manage environment variables securely
- Follow security best practices

---

## 🔒 Security Fundamentals

### OWASP Top 10 for Web Applications

1. **Injection** (SQL, XSS): Sanitize inputs
2. **Broken Authentication**: Secure login/session management
3. **Sensitive Data Exposure**: Encrypt data, use HTTPS
4. **XML External Entities (XXE)**: Disable XML parsing
5. **Broken Access Control**: Implement authorization
6. **Security Misconfiguration**: Secure defaults
7. **Cross-Site Scripting (XSS)**: Sanitize outputs
8. **Insecure Deserialization**: Validate data
9. **Using Components with Known Vulnerabilities**: Keep dependencies updated
10. **Insufficient Logging & Monitoring**: Track security events

---

## 🛡️ XSS Prevention

### Angular's Built-in Protection

Angular automatically escapes values when using interpolation:

```typescript
@Component({
  selector: "app-user-profile",
  template: `
    <!-- ✅ SAFE: Angular escapes HTML -->
    <p>Username: {{ username }}</p>

    <!-- ✅ SAFE: Property binding is escaped -->
    <img [src]="avatarUrl" [alt]="username" />

    <!-- ❌ DANGEROUS: innerHTML bypasses sanitization -->
    <div [innerHTML]="userBio"></div>
  `,
})
export class UserProfileComponent {
  username = '<script>alert("XSS")</script>'; // Rendered as text, not executed
  avatarUrl = "https://example.com/avatar.jpg";
  userBio = '<script>alert("XSS")</script>'; // Would be sanitized, but still risky
}
```

### DomSanitizer

```typescript
// core/services/sanitizer.service.ts
import { Injectable } from "@angular/core";
import {
  DomSanitizer,
  SafeHtml,
  SafeUrl,
  SafeResourceUrl,
} from "@angular/platform-browser";

@Injectable({ providedIn: "root" })
export class SanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml {
    // Only use this when you trust the source!
    return this.sanitizer.sanitize(SecurityContext.HTML, html) || "";
  }

  bypassSecurityTrustHtml(html: string): SafeHtml {
    // ⚠️ WARNING: Only use with trusted content
    // Angular will not sanitize this
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(SecurityContext.URL, url) || "";
  }

  bypassSecurityTrustUrl(url: string): SafeUrl {
    // Use for trusted URLs (e.g., data URLs)
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  sanitizeResourceUrl(url: string): SafeResourceUrl {
    // For <iframe src>, <embed src>
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

// Usage in component
@Component({
  selector: "app-article",
  standalone: true,
  imports: [CommonModule],
  template: ` <div [innerHTML]="safeContent"></div> `,
})
export class ArticleComponent {
  private sanitizer = inject(SanitizerService);

  rawContent = '<p>Safe content</p><script>alert("XSS")</script>';

  // Angular sanitizer removes <script> tags
  safeContent = this.sanitizer.bypassSecurityTrustHtml(
    this.sanitizeUserContent(this.rawContent),
  );

  private sanitizeUserContent(html: string): string {
    // Use a library like DOMPurify for robust sanitization
    const temp = document.createElement("div");
    temp.textContent = html; // Escapes all HTML
    return temp.innerHTML;
  }
}
```

### Using DOMPurify

```typescript
// Install: npm install dompurify@^3.1.0
// Install types: npm install --save-dev @types/dompurify

import DOMPurify from "dompurify";

@Injectable({ providedIn: "root" })
export class HtmlSanitizerService {
  constructor(private domSanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    // DOMPurify removes dangerous elements while preserving safe HTML
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li"],
      ALLOWED_ATTR: ["href", "target"],
    });

    return this.domSanitizer.bypassSecurityTrustHtml(clean);
  }
}

// Usage
@Component({
  template: `<div [innerHTML]="safeHtml"></div>`,
})
export class RichTextComponent {
  private sanitizerService = inject(HtmlSanitizerService);

  rawHtml = '<p>Hello</p><script>alert("XSS")</script>';
  safeHtml = this.sanitizerService.sanitize(this.rawHtml);
}
```

---

## 🔐 CSRF Protection

### HttpClient CSRF Protection

Angular's `HttpClient` automatically includes CSRF tokens:

```typescript
// Backend must set XSRF-TOKEN cookie
// Angular HttpClient reads it and includes X-XSRF-TOKEN header

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: "XSRF-TOKEN", // Default
        headerName: "X-XSRF-TOKEN", // Default
      }),
    ),
  ],
};

// Custom CSRF interceptor if needed
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Get CSRF token from cookie
  const csrfToken = getCookie("XSRF-TOKEN");

  // Add token to header for state-changing requests
  if (csrfToken && req.method !== "GET" && req.method !== "HEAD") {
    req = req.clone({
      headers: req.headers.set("X-XSRF-TOKEN", csrfToken),
    });
  }

  return next(req);
};

function getCookie(name: string): string | null {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)",
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}
```

---

## 📜 Content Security Policy (CSP)

### Configure CSP Headers

```html
<!-- index.html -->
<head>
  <meta
    http-equiv="Content-Security-Policy"
    content="
    default-src 'self';
    script-src 'self' 'nonce-{random}';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  "
  />
</head>
```

### CSP-Compatible Code

```typescript
// ❌ BAD: Inline event handlers (blocked by CSP)
template: `<button onclick="doSomething()">Click</button>`;

// ✅ GOOD: Use Angular event binding
template: `<button (click)="doSomething()">Click</button>`;

// ❌ BAD: eval() (blocked by CSP)
const code = 'alert("hello")';
eval(code);

// ✅ GOOD: Use proper function calls
const functions = {
  showAlert: () => alert("hello"),
};
functions["showAlert"]();

// ❌ BAD: new Function() (blocked by CSP)
const fn = new Function("a", "b", "return a + b");

// ✅ GOOD: Regular functions
const fn = (a: number, b: number) => a + b;
```

---

## 🔑 Authentication

### JWT Authentication

```typescript
// core/models/auth.model.ts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

// core/services/auth.service.ts
import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap, BehaviorSubject } from "rxjs";
import { jwtDecode } from "jwt-decode";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly API_URL = "/api/auth";

  private userSignal = signal<User | null>(null);
  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => this.user() !== null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.getUserFromToken(token);
      this.userSignal.set(user);
    } else {
      this.clearTokens();
    }
  }

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap((tokens) => {
          this.setTokens(tokens);
          const user = this.getUserFromToken(tokens.accessToken);
          this.userSignal.set(user);
        }),
      );
  }

  register(
    email: string,
    password: string,
    name: string,
  ): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.API_URL}/register`, {
        email,
        password,
        name,
      })
      .pipe(
        tap((tokens) => {
          this.setTokens(tokens);
          const user = this.getUserFromToken(tokens.accessToken);
          this.userSignal.set(user);
        }),
      );
  }

  logout(): void {
    this.clearTokens();
    this.userSignal.set(null);
    this.router.navigate(["/login"]);
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();

    return this.http
      .post<AuthTokens>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap((tokens) => {
          this.setTokens(tokens);
          const user = this.getUserFromToken(tokens.accessToken);
          this.userSignal.set(user);
        }),
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);

    // Schedule token refresh before expiration
    this.scheduleTokenRefresh(tokens.expiresIn);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private getUserFromToken(token: string): User {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      roles: decoded.roles || [],
    };
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    // Refresh 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000;

    setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => this.logout(),
      });
    }, refreshTime);
  }
}
```

### Auth Interceptor

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, switchMap, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Clone request and add Authorization header
  if (token && !req.url.includes("/auth/")) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized
      if (error.status === 401 && !req.url.includes("/auth/login")) {
        // Try to refresh token
        return authService.refreshToken().pipe(
          switchMap((tokens) => {
            // Retry original request with new token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens.accessToken}`,
              },
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // Refresh failed, logout
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
```

### OAuth 2.0 / OIDC

```typescript
// Install: npm install angular-oauth2-oidc@^18.0.0

import { provideOAuthClient } from "angular-oauth2-oidc";

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideOAuthClient()],
};

// core/services/oauth.service.ts
import { Injectable } from "@angular/core";
import { OAuthService, AuthConfig } from "angular-oauth2-oidc";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class OAuthAuthService {
  private authConfig: AuthConfig = {
    issuer: "https://accounts.google.com",
    redirectUri: window.location.origin,
    clientId: "YOUR_CLIENT_ID",
    scope: "openid profile email",
    responseType: "code",
    showDebugInformation: true,
    strictDiscoveryDocumentValidation: false,
  };

  constructor(
    private oauthService: OAuthService,
    private router: Router,
  ) {
    this.configure();
  }

  private configure(): void {
    this.oauthService.configure(this.authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.oauthService.logOut();
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  getUserInfo(): any {
    const claims = this.oauthService.getIdentityClaims();
    return claims;
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }
}
```

---

## 🚪 Authorization

### Route Guards

```typescript
// core/guards/auth.guard.ts
import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(["/login"], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

// core/guards/role.guard.ts
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.user();

    if (!user) {
      router.navigate(["/login"]);
      return false;
    }

    const hasRole = user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      router.navigate(["/forbidden"]);
      return false;
    }

    return true;
  };
}

// Usage in routes
export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [authGuard, roleGuard(["admin"])],
  },
  {
    path: "editor",
    component: EditorComponent,
    canActivate: [authGuard, roleGuard(["editor", "admin"])],
  },
];
```

### Permission Directive

```typescript
// shared/directives/has-permission.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set appHasPermission(requiredRoles: string[]) {
    effect(() => {
      const user = this.authService.user();
      const hasPermission = user?.roles.some(role =>
        requiredRoles.includes(role)
      );

      if (hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}

// Usage
@Component({
  template: `
    <button *appHasPermission="['admin']">Delete User</button>

    <div *appHasPermission="['editor', 'admin']">
      <p>Edit content here</p>
    </div>
  `
})
```

---

## 🔐 Secure HTTP Communication

### HTTPS Enforcement

```typescript
// core/interceptors/https.interceptor.ts
export const httpsInterceptor: HttpInterceptorFn = (req, next) => {
  // Force HTTPS in production
  if (environment.production && req.url.startsWith("http://")) {
    req = req.clone({
      url: req.url.replace("http://", "https://"),
    });
  }

  return next(req);
};
```

### Secure Headers

```typescript
// core/interceptors/security-headers.interceptor.ts
export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  // Add security headers
  req = req.clone({
    setHeaders: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });

  return next(req);
};
```

---

## 🔒 Environment Variables

### Secure Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  // ❌ NEVER commit sensitive keys
  // googleClientId: 'real-client-id'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://api.production.com",
  // Use environment variables injected at build time
};

// .gitignore
environment.local.ts.env.env.local;
```

### Build-time Injection

```json
// angular.json
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### Runtime Configuration

```typescript
// assets/config.json (not committed, injected at runtime)
{
  "apiUrl": "https://api.example.com",
  "oauth": {
    "clientId": "..."
  }
}

// core/services/config.service.ts
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<any> {
    return this.http.get('/assets/config.json')
      .toPromise()
      .then(config => {
        this.config = config;
      });
  }

  get(key: string): any {
    return this.config[key];
  }
}

// app.config.ts
export function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    }
  ]
};
```

---

## 🧪 Testing Security

### Testing Auth Guards

```typescript
// auth.guard.spec.ts
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { authGuard } from "./auth.guard";
import { AuthService } from "../services/auth.service";

describe("authGuard", () => {
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    authService = {
      isAuthenticated: jest.fn(),
    } as any;

    router = {
      navigate: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it("should allow access when authenticated", () => {
    authService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(null as any, { url: "/dashboard" } as any),
    );

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("should redirect to login when not authenticated", () => {
    authService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(null as any, { url: "/dashboard" } as any),
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(["/login"], {
      queryParams: { returnUrl: "/dashboard" },
    });
  });
});
```

---

## ✅ Security Checklist

### Input Validation

- [ ] Sanitize user input
- [ ] Validate data on client AND server
- [ ] Use DOMPurify for rich text
- [ ] Avoid `innerHTML` with user data

### Authentication

- [ ] Use HTTPS for login
- [ ] Implement JWT with refresh tokens
- [ ] Store tokens securely (httpOnly cookies ideal)
- [ ] Implement token expiration
- [ ] Handle token refresh
- [ ] Add logout functionality

### Authorization

- [ ] Implement route guards
- [ ] Check permissions on backend
- [ ] Use role-based access control
- [ ] Hide unauthorized UI elements

### Data Protection

- [ ] Use HTTPS in production
- [ ] Implement CSRF protection
- [ ] Configure CSP headers
- [ ] Don't log sensitive data
- [ ] Encrypt sensitive data at rest

### Dependencies

- [ ] Keep Angular and dependencies updated
- [ ] Run `npm audit` regularly
- [ ] Review security advisories
- [ ] Use lock files (package-lock.json)

### Configuration

- [ ] Never commit secrets to Git
- [ ] Use environment variables
- [ ] Separate dev/prod configs
- [ ] Implement rate limiting on APIs

---

## ✅ Best Practices

### 1. Defense in Depth

```typescript
// Multiple layers of security
// ✅ GOOD: Validate on client AND server
submitForm(data: FormData) {
  // Client validation
  if (!this.isValid(data)) {
    return;
  }

  // Server will also validate
  this.api.submit(data).subscribe();
}
```

### 2. Principle of Least Privilege

```typescript
// ✅ GOOD: Only grant necessary permissions
const user = {
  id: "123",
  roles: ["viewer"], // Not 'admin' unless needed
};
```

### 3. Fail Securely

```typescript
// ✅ GOOD: Deny by default
hasPermission(user: User, resource: string): boolean {
  if (!user || !resource) {
    return false; // Deny if anything is missing
  }

  return user.permissions.includes(resource);
}
```

---

## 🎓 Conclusión

La seguridad es fundamental en aplicaciones modernas:

- **XSS**: Angular protege por defecto, usa DomSanitizer con cuidado
- **Authentication**: JWT o OAuth con refresh tokens
- **Authorization**: Guards + directivas de permisos
- **HTTPS**: Obligatorio en producción
- **CSP**: Configura headers restrictivos

**Regla de oro**: Nunca confíes en el cliente. Valida y autoriza en el servidor.

---

## 📚 Recursos

- Angular Security Guide: https://angular.dev/best-practices/security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- DOMPurify: https://github.com/cure53/DOMPurify
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
