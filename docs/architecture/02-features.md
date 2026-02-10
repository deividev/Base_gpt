# 02 - Crear Features

## Estructura de una Feature

Una feature es un módulo autónomo que encapsula toda la lógica relacionada con una funcionalidad de negocio.

### Estructura Mínima

```
src/app/features/mi-feature/
├── mi-feature.ts           # Componente principal (smart component)
├── mi-feature.html         # Template
├── mi-feature.scss         # Estilos
├── mi-feature.spec.ts      # Tests
└── index.ts                # Barrel export
```

### Estructura Completa

```
src/app/features/users/
├── components/              # Componentes internos de la feature
│   ├── user-card/
│   │   ├── user-card.ts
│   │   ├── user-card.html
│   │   └── user-card.scss
│   ├── user-form/
│   └── user-list/
│
├── services/                # Servicios específicos de la feature
│   ├── user.service.ts
│   └── user-validation.service.ts
│
├── models/                  # DTOs y tipos específicos
│   ├── user.dto.ts
│   └── index.ts
│
├── guards/                  # Guards específicos (opcional)
│   └── user-access.guard.ts
│
├── users.ts                 # Componente principal (página)
├── users.html
├── users.scss
├── users.spec.ts
├── users.routes.ts          # Sub-rutas de la feature
└── index.ts                 # Barrel export
```

## Crear una Feature Paso a Paso

### Paso 1: Crear la estructura de carpetas

```bash
mkdir -p src/app/features/users/{components,services,models}
```

### Paso 2: Crear el componente principal

```typescript
// src/app/features/users/users.ts
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './services/user.service';
import { UserCard } from './components/user-card/user-card';
import { SectionHeader, Button } from '@shared/components';
import type { User } from './models/user.dto';

@Component({
  selector: 'app-users',
  imports: [CommonModule, UserCard, SectionHeader, Button],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  // Services
  private readonly userService = inject(UserService);
  
  // State
  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  
  // Computed
  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(user => 
      user.name.toLowerCase().includes(term)
    );
  });
  
  protected readonly totalUsers = computed(() => this.users().length);
  
  // Lifecycle
  ngOnInit(): void {
    this.loadUsers();
  }
  
  // Methods
  protected loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
  
  protected onSearch(term: string): void {
    this.searchTerm.set(term);
  }
  
  protected onUserSelect(user: User): void {
    console.log('User selected:', user);
  }
}
```

### Paso 3: Crear el template

```html
<!-- src/app/features/users/users.html -->
<div class="users-page">
  <app-section-header 
    [title]="'Usuarios'"
    [subtitle]="'Gestión de usuarios del sistema'"
  />
  
  <!-- Search -->
  <div class="search-container">
    <app-input 
      [placeholder]="'Buscar usuarios...'"
      (valueChange)="onSearch($event)"
    />
  </div>
  
  <!-- Loading state -->
  @if (loading()) {
    <div class="loading">
      <span>Cargando usuarios...</span>
    </div>
  }
  
  <!-- Error state -->
  @if (error()) {
    <div class="error">
      <p>{{ error() }}</p>
      <app-button (clicked)="loadUsers()">Reintentar</app-button>
    </div>
  }
  
  <!-- Content -->
  @if (!loading() && !error()) {
    <div class="users-grid">
      @for (user of filteredUsers(); track user.id) {
        <app-user-card 
          [user]="user"
          (select)="onUserSelect($event)"
        />
      } @empty {
        <p class="no-results">No se encontraron usuarios</p>
      }
    </div>
    
    <p class="total">Total: {{ totalUsers() }} usuarios</p>
  }
</div>
```

### Paso 4: Crear el servicio de la feature

```typescript
// src/app/features/users/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services';
import { API_ENDPOINTS } from '@core/config';
import type { User, CreateUserDto, UpdateUserDto } from '../models/user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  
  /**
   * Obtener todos los usuarios
   */
  getUsers(): Observable<User[]> {
    return this.api.get<User[]>(API_ENDPOINTS.users.base);
  }
  
  /**
   * Obtener usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`${API_ENDPOINTS.users.base}/${id}`);
  }
  
  /**
   * Crear nuevo usuario
   */
  createUser(data: CreateUserDto): Observable<User> {
    return this.api.post<User>(API_ENDPOINTS.users.base, data);
  }
  
  /**
   * Actualizar usuario
   */
  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.api.patch<User>(`${API_ENDPOINTS.users.base}/${id}`, data);
  }
  
  /**
   * Eliminar usuario
   */
  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`${API_ENDPOINTS.users.base}/${id}`);
  }
}
```

### Paso 5: Crear los modelos/DTOs

```typescript
// src/app/features/users/models/user.dto.ts

/**
 * Usuario completo (respuesta del servidor)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
}

/**
 * DTO para crear usuario
 */
export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: 'user' | 'admin';
}

/**
 * DTO para actualizar usuario
 */
export interface UpdateUserDto {
  email?: string;
  name?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
}

// src/app/features/users/models/index.ts
export * from './user.dto';
```

### Paso 6: Crear componentes internos

```typescript
// src/app/features/users/components/user-card/user-card.ts
import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import type { User } from '../../models/user.dto';

@Component({
  selector: 'app-user-card',
  imports: [NgClass],
  template: `
    <div class="user-card" [ngClass]="{ 'inactive': user().status === 'inactive' }">
      <img [src]="user().avatar || 'assets/default-avatar.png'" alt="Avatar">
      <div class="info">
        <h3>{{ user().name }}</h3>
        <p>{{ user().email }}</p>
        <span class="role">{{ user().role }}</span>
      </div>
      <button (click)="select.emit(user())">Ver detalles</button>
    </div>
  `,
  styleUrl: './user-card.scss'
})
export class UserCard {
  readonly user = input.required<User>();
  readonly select = output<User>();
}
```

### Paso 7: Crear el barrel export

```typescript
// src/app/features/users/index.ts
export { Users } from './users';
export { UserService } from './services/user.service';
export type { User, CreateUserDto, UpdateUserDto } from './models';
```

### Paso 8: Agregar la ruta

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then(m => m.Landing),
    title: 'Home'
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users').then(m => m.Users),
    canActivate: [authGuard],
    title: 'Users'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

### Paso 9: Crear tests

```typescript
// src/app/features/users/users.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Users } from './users';
import { UserService } from './services/user.service';
import { of } from 'rxjs';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  let userServiceSpy: { getUsers: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    userServiceSpy = {
      getUsers: vi.fn().mockReturnValue(of([
        { id: '1', name: 'John', email: 'john@test.com', role: 'user', status: 'active' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
  });
});
```

## Sub-rutas en Features

Para features con múltiples vistas:

```typescript
// src/app/features/users/users.routes.ts
import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users').then(m => m.Users),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/user-list/user-list').then(m => m.UserList),
      },
      {
        path: ':id',
        loadComponent: () => import('./components/user-detail/user-detail').then(m => m.UserDetail),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/user-form/user-form').then(m => m.UserForm),
      }
    ]
  }
];

// En app.routes.ts
{
  path: 'users',
  loadChildren: () => import('./features/users/users.routes').then(m => m.USER_ROUTES),
  canActivate: [authGuard]
}
```

## Checklist para Nueva Feature

- [ ] Crear estructura de carpetas
- [ ] Crear componente principal con estado (signals)
- [ ] Crear servicio de la feature
- [ ] Crear modelos/DTOs
- [ ] Crear componentes internos
- [ ] Crear barrel export (index.ts)
- [ ] Agregar ruta en app.routes.ts
- [ ] Escribir tests
- [ ] Documentar si es necesario
