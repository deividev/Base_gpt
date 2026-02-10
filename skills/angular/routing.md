# Angular Routing & Navigation

## 📋 Información

- **Skill ID**: `angular/routing`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Crítica
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar la configuración de rutas, navegación, guards, resolvers y lazy loading para crear aplicaciones multi-página escalables.

---

## ✅ Configuración Básica de Rutas

### 1. Definir Routes con Standalone Components

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage),
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/user-list.page').then(m => m.UserListPage),
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./pages/users/user-detail.page').then(m => m.UserDetailPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPage),
  },
];
```

### 2. Configurar Router en main.ts

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
  ],
}).catch(err => console.error(err));
```

### 3. Template con RouterOutlet y Links

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        Home
      </a>
      <a routerLink="/about" routerLinkActive="active">
        About
      </a>
      <a routerLink="/users" routerLinkActive="active">
        Users
      </a>
    </nav>
    
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
```

---

## 🎨 Route Parameters y Query Params

### 1. Leer Route Parameters

```typescript
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-detail',
  template: `
    <div class="user-detail">
      @if (userId()) {
        <h2>User ID: {{ userId() }}</h2>
        <p>Loading user {{ userId() }}...</p>
      }
    </div>
  `,
})
export class UserDetailPage {
  private route = inject(ActivatedRoute);
  
  // Opción 1: Con toSignal (Recomendado)
  userId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );
  
  // Opción 2: Snapshot (para valores que no cambian)
  userIdSnapshot = this.route.snapshot.paramMap.get('id');
}
```

### 2. Query Parameters

```typescript
@Component({
  template: `
    <div>
      <p>Page: {{ page() }}</p>
      <p>Filter: {{ filter() }}</p>
    </div>
  `,
})
export class UserListPage {
  private route = inject(ActivatedRoute);
  
  // Query params como signals
  queryParams = toSignal(this.route.queryParamMap);
  
  page = computed(() => this.queryParams()?.get('page') ?? '1');
  filter = computed(() => this.queryParams()?.get('filter') ?? 'all');
}
```

### 3. Navegar con Params

```typescript
import { Router } from '@angular/router';

@Component({})
export class SomeComponent {
  private router = inject(Router);
  
  goToUser(userId: number) {
    // Navegación simple
    this.router.navigate(['/users', userId]);
  }
  
  goToUserWithQuery() {
    // Con query params
    this.router.navigate(['/users'], {
      queryParams: { page: 2, filter: 'active' },
    });
  }
  
  updateQueryParams() {
    // Actualizar solo query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: 'angular' },
      queryParamsHandling: 'merge', // Mantiene otros params
    });
  }
}
```

---

## 🛡️ Route Guards

### 1. Functional Guards (Recomendado Angular 15+)

```typescript
// guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirigir a login con return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

// guards/role.guard.ts
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const userRole = authService.getUserRole();
    
    if (allowedRoles.includes(userRole)) {
      return true;
    }
    
    return router.createUrlTree(['/unauthorized']);
  };
};
```

### 2. Aplicar Guards en Routes

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
    canActivate: [authGuard, roleGuard(['admin'])],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
];
```

### 3. CanDeactivate Guard (Prevenir pérdida de datos)

```typescript
// guards/can-deactivate.guard.ts
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};

// En el componente
@Component({})
export class EditFormPage implements CanComponentDeactivate {
  hasUnsavedChanges = signal(false);
  
  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Do you want to leave?');
    }
    return true;
  }
}

// En routes
{
  path: 'edit/:id',
  loadComponent: () => import('./pages/edit-form.page').then(m => m.EditFormPage),
  canDeactivate: [canDeactivateGuard],
}
```

---

## 📦 Resolvers (Pre-cargar datos)

```typescript
// resolvers/user.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

export const userResolver: ResolveFn<User> = (route, state) => {
  const userService = inject(UserService);
  const userId = route.paramMap.get('id')!;
  
  return userService.getUserById(+userId);
};

// En routes
{
  path: 'users/:id',
  loadComponent: () => import('./pages/user-detail.page').then(m => m.UserDetailPage),
  resolve: {
    user: userResolver,
  },
}

// En el componente
@Component({})
export class UserDetailPage {
  private route = inject(ActivatedRoute);
  
  // Acceder a data resuelta
  user = toSignal(
    this.route.data.pipe(map(data => data['user'] as User))
  );
}
```

---

## 🏗️ Child Routes (Rutas Anidadas)

```typescript
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () => import('./pages/dashboard/overview.page').then(m => m.OverviewPage),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/dashboard/analytics.page').then(m => m.AnalyticsPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/dashboard/settings.page').then(m => m.SettingsPage),
      },
    ],
  },
];

// dashboard.page.ts
@Component({
  template: `
    <div class="dashboard-layout">
      <nav class="sidebar">
        <a routerLink="overview" routerLinkActive="active">Overview</a>
        <a routerLink="analytics" routerLinkActive="active">Analytics</a>
        <a routerLink="settings" routerLinkActive="active">Settings</a>
      </nav>
      
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
})
export class DashboardPage {}
```

---

## ⚡ Lazy Loading Avanzado

### 1. Load Children (Para grupos de rutas)

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard(['admin'])],
  },
];

// features/admin/admin.routes.ts
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard.page').then(m => m.AdminDashboardPage),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/admin-users.page').then(m => m.AdminUsersPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/admin-settings.page').then(m => m.AdminSettingsPage),
  },
];
```

### 2. Preloading Strategy

```typescript
// main.ts
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // Pre-carga todas las rutas lazy
    ),
  ],
});

// Custom preloading strategy
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Solo pre-cargar rutas con data.preload = true
    if (route.data?.['preload']) {
      console.log('Preloading: ' + route.path);
      // Esperar 2 segundos antes de pre-cargar
      return timer(2000).pipe(mergeMap(() => load()));
    }
    return of(null);
  }
}

// Usar estrategia custom
provideRouter(routes, withPreloading(CustomPreloadingStrategy))
```

---

## 🔄 Route Reuse Strategy

```typescript
// strategies/custom-reuse.strategy.ts
import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Guardar el estado de rutas específicas
    return route.data?.['reuseRoute'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const path = this.getPath(route);
    this.storedRoutes.set(path, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getPath(route);
    return !!this.storedRoutes.get(path);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = this.getPath(route);
    return this.storedRoutes.get(path) || null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private getPath(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map(r => r.url.map(segment => segment.toString()).join('/'))
      .join('/');
  }
}

// main.ts
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './strategies/custom-reuse.strategy';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
});
```

---

## 📋 Checklist

- [ ] Rutas configuradas con lazy loading
- [ ] Guards implementados para protección
- [ ] Resolvers para pre-carga de datos
- [ ] Child routes para layouts anidados
- [ ] Preloading strategy configurada
- [ ] Route parameters y query params manejados
- [ ] CanDeactivate para prevenir pérdida de datos
- [ ] 404 (wildcard route) configurado
- [ ] RouterLink y RouterLinkActive en templates
- [ ] Navegación programática con Router

---

## 🚫 Anti-Patrones

### ❌ No usar snapshot cuando params cambian

```typescript
// ❌ INCORRECTO - No reacciona a cambios
ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  this.loadUser(id);
}

// ✅ CORRECTO - Reacciona a cambios
userId = toSignal(
  this.route.paramMap.pipe(map(params => params.get('id')))
);
```

### ❌ No olvidar unsubscribe de route observables

```typescript
// ❌ INCORRECTO - Memory leak
ngOnInit() {
  this.route.params.subscribe(params => {
    this.loadUser(params['id']);
  });
}

// ✅ CORRECTO - Usar toSignal o async pipe
userId = toSignal(this.route.params.pipe(map(p => p['id'])));
```

---

## 🔗 Skills Relacionadas

- `angular/component-creation` - Componentes de página
- `angular/services` - Servicios para guards y resolvers
- `angular/http-client` - Datos en resolvers
- `angular/state-management` - Estado entre rutas

---

## 📚 Referencias

- [Angular Router Guide](https://angular.dev/guide/routing)
- [Route Guards](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access)
- [Lazy Loading](https://angular.dev/guide/routing/common-router-tasks#lazy-loading)
