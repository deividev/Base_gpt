# 04 - Guards e Interceptors

## HTTP Interceptors

Los interceptors son middleware que interceptan todas las peticiones/respuestas HTTP.

### Ubicación

```
src/app/core/interceptors/
├── error.interceptor.ts
├── loading.interceptor.ts
└── index.ts
```

### Registrar Interceptors

```typescript
// src/app/app.config.ts
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { errorInterceptor, loadingInterceptor } from "@core/interceptors";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        errorInterceptor,
        loadingInterceptor,
        // authInterceptor, // agregar cuando se implemente auth
      ]),
    ),
    // ...
  ],
};
```

---

## Error Interceptor

Maneja todos los errores HTTP de forma centralizada.

```typescript
// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { LoggerService } from "@core/services";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log del error
      logger.error(`[HTTP Error] ${req.method} ${req.url}`, {
        status: error.status,
        message: error.error?.message || error.message,
      });

      // Manejo por código de estado
      switch (error.status) {
        case 0:
          logger.error("Error de red - verifica tu conexión");
          break;
        case 401:
          // Redirigir a login o refrescar token
          handleUnauthorized();
          break;
        case 403:
          logger.warn("Acceso denegado");
          break;
        case 404:
          logger.warn("Recurso no encontrado");
          break;
        case 500:
        case 502:
        case 503:
          logger.error("Error del servidor");
          break;
      }

      return throwError(() => error);
    }),
  );
};

function handleUnauthorized(): void {
  // Limpiar tokens
  localStorage.removeItem("auth_token");
  // Redirigir a login (inyectar Router si es necesario)
  window.location.href = "/login";
}
```

### Personalizar manejo de errores

```typescript
// Para mostrar notificaciones
import { inject } from "@angular/core";
import { NotificationService } from "@shared/services";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Mostrar toast de error
      notification.error(getErrorMessage(error));
      return throwError(() => error);
    }),
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return error.error.message;
  }

  switch (error.status) {
    case 0:
      return "Sin conexión a internet";
    case 400:
      return "Solicitud inválida";
    case 401:
      return "Sesión expirada";
    case 403:
      return "Sin permisos";
    case 404:
      return "No encontrado";
    case 500:
      return "Error del servidor";
    default:
      return "Error desconocido";
  }
}
```

---

## Loading Interceptor

Gestiona automáticamente el estado de carga para todas las peticiones.

```typescript
// src/app/core/interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { finalize } from "rxjs";
import { LoadingService } from "@core/services";

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Saltar loading para ciertas peticiones
  const skipLoading = req.headers.has("X-Skip-Loading");

  if (!skipLoading) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        loadingService.hide();
      }
    }),
  );
};
```

### Uso del LoadingService

```typescript
// En componentes
@Component({
  template: `
    @if (loading.isLoading()) {
      <div class="loading-overlay">
        <app-spinner />
      </div>
    }

    <router-outlet />
  `,
})
export class App {
  protected readonly loading = inject(LoadingService);
}
```

### Saltar loading para peticiones específicas

```typescript
// En un servicio
getDataSilently(): Observable<Data> {
  const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
  return this.api.get<Data>('/data', { headers });
}
```

---

## Auth Interceptor

Agrega automáticamente el token de autenticación a las peticiones.

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { StorageService } from "@core/services";
import { STORAGE_KEYS } from "@core/config";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);

  // Saltar auth para ciertas peticiones (login, registro, etc.)
  const skipAuth = req.headers.has("X-Skip-Auth");

  if (skipAuth) {
    return next(req);
  }

  const token = storage.get<string>(STORAGE_KEYS.authToken);

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
```

---

## Route Guards

Los guards protegen las rutas de navegación.

### Ubicación

```
src/app/core/guards/
├── auth.guard.ts
└── index.ts
```

---

## Auth Guard

Protege rutas que requieren autenticación.

```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from "@angular/core";
import { Router, CanActivateFn, UrlTree } from "@angular/router";
import { StorageService, LoggerService } from "@core/services";
import { STORAGE_KEYS } from "@core/config";

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const storage = inject(StorageService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  const token = storage.get<string>(STORAGE_KEYS.authToken);

  if (token) {
    logger.debug("[AuthGuard] Usuario autenticado");
    return true;
  }

  logger.warn("[AuthGuard] Usuario no autenticado, redirigiendo a login");

  // Guardar URL intentada para redirección post-login
  storage.setSession("redirect_url", state.url);

  return router.createUrlTree(["/login"], {
    queryParams: { returnUrl: state.url },
  });
};
```

### Uso en rutas

```typescript
// src/app/app.routes.ts
import { authGuard, guestGuard, roleGuard } from "@core/guards";

export const routes: Routes = [
  // Ruta pública
  {
    path: "",
    loadComponent: () => import("./features/landing/landing"),
    title: "Home",
  },

  // Solo usuarios NO autenticados
  {
    path: "login",
    loadComponent: () => import("./features/auth/login/login"),
    canActivate: [guestGuard],
    title: "Login",
  },

  // Requiere autenticación
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard"),
    canActivate: [authGuard],
    title: "Dashboard",
  },

  // Requiere rol específico
  {
    path: "admin",
    loadComponent: () => import("./features/admin/admin"),
    canActivate: [authGuard, roleGuard(["admin", "superadmin"])],
    title: "Admin Panel",
  },
];
```

---

## Guest Guard

Protege rutas que solo deben ser accesibles para usuarios NO autenticados (login, registro).

```typescript
// src/app/core/guards/auth.guard.ts
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const storage = inject(StorageService);
  const router = inject(Router);

  const token = storage.get<string>(STORAGE_KEYS.authToken);

  if (!token) {
    return true; // Permitir acceso
  }

  // Usuario ya autenticado, redirigir a home
  return router.createUrlTree(["/"]);
};
```

---

## Role Guard

Verifica que el usuario tenga un rol específico.

```typescript
// src/app/core/guards/auth.guard.ts
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (): boolean | UrlTree => {
    const storage = inject(StorageService);
    const router = inject(Router);
    const logger = inject(LoggerService);

    interface UserData {
      role?: string;
      roles?: string[];
    }

    const user = storage.get<UserData>(STORAGE_KEYS.user);
    const userRoles = user?.roles ?? (user?.role ? [user.role] : []);

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (hasRole) {
      return true;
    }

    logger.warn("[RoleGuard] Usuario sin permisos", {
      required: allowedRoles,
      user: userRoles,
    });

    return router.createUrlTree(["/unauthorized"]);
  };
}
```

---

## CanDeactivate Guard

Previene navegación si hay cambios sin guardar.

```typescript
// src/app/core/guards/unsaved-changes.guard.ts
import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('Tienes cambios sin guardar. ¿Deseas salir de todos modos?');
  }
  return true;
};

// Uso en componente
@Component({...})
export class EditProduct implements HasUnsavedChanges {
  private formDirty = signal(false);

  hasUnsavedChanges(): boolean {
    return this.formDirty();
  }
}

// En rutas
{
  path: 'products/:id/edit',
  loadComponent: () => import('./features/products/edit-product'),
  canActivate: [authGuard],
  canDeactivate: [unsavedChangesGuard]
}
```

---

## Resumen de Guards

| Guard                  | Propósito                 | Uso              |
| ---------------------- | ------------------------- | ---------------- |
| `authGuard`            | Requiere autenticación    | Rutas protegidas |
| `guestGuard`           | Solo NO autenticados      | Login, Registro  |
| `roleGuard(['admin'])` | Requiere rol específico   | Admin panel      |
| `unsavedChangesGuard`  | Previene pérdida de datos | Formularios      |

## Resumen de Interceptors

| Interceptor          | Propósito                            |
| -------------------- | ------------------------------------ |
| `errorInterceptor`   | Manejo centralizado de errores HTTP  |
| `loadingInterceptor` | Estado de loading automático         |
| `authInterceptor`    | Agregar token Bearer automáticamente |
