# Clean Architecture en Angular

## 📋 Información

- **Skill ID**: `architecture/clean-architecture`
- **Versión**: 1.0.0
- **Categoría**: Architecture
- **Prioridad**: Alta

## 📖 Documentación Implementada

> **IMPORTANTE**: La arquitectura del proyecto está documentada en `docs/architecture/`.
> 
> - **Vista general**: [01-overview.md](../../../docs/architecture/01-overview.md)
> - **Crear features**: [02-features.md](../../../docs/architecture/02-features.md)
> - **Guards e Interceptors**: [04-guards-interceptors.md](../../../docs/architecture/04-guards-interceptors.md)
> - **Servicios Core**: [06-core-services.md](../../../docs/architecture/06-core-services.md)
>
> Esta skill describe los principios teóricos. Para la implementación práctica, consultar la documentación.

## 🎯 Objetivo

Implementar Clean Architecture en aplicaciones Angular para lograr código mantenible, testeable y desacoplado.

## 📖 Capas de la Arquitectura

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (UI)             │
│    Components, Directives, Pipes            │
├─────────────────────────────────────────────┤
│         Application Layer                   │
│    Use Cases, State Management              │
├─────────────────────────────────────────────┤
│         Domain Layer                        │
│    Entities, Business Logic, Interfaces     │
├─────────────────────────────────────────────┤
│         Infrastructure Layer                │
│    API Clients, Local Storage, Services     │
└─────────────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
src/
├── app/
│   ├── core/                          # Singleton services, guards
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/                        # Shared components, directives
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── features/                      # Feature modules
│   │   └── user-management/
│   │       ├── domain/               # Domain layer
│   │       │   ├── entities/
│   │       │   │   └── user.entity.ts
│   │       │   ├── repositories/
│   │       │   │   └── user.repository.ts
│   │       │   └── use-cases/
│   │       │       ├── get-users.usecase.ts
│   │       │       └── create-user.usecase.ts
│   │       ├── infrastructure/       # Infrastructure layer
│   │       │   ├── api/
│   │       │   │   └── user-api.service.ts
│   │       │   └── repositories/
│   │       │       └── user.repository.impl.ts
│   │       ├── application/         # Application layer
│   │       │   └── state/
│   │       │       └── user.store.ts
│   │       └── presentation/        # Presentation layer
│   │           ├── pages/
│   │           │   └── user-list/
│   │           └── components/
│   │               └── user-card/
└── ...
```

## ✅ Reglas de Dependencias

### 1. Dirección de Dependencias
```typescript
// ✅ CORRECTO: Capas externas dependen de internas
// Presentation → Application → Domain
// Infrastructure → Domain

// ❌ INCORRECTO: Domain NO debe depender de Infrastructure
```

### 2. Domain Layer (Core del negocio)
```typescript
// domain/entities/user.entity.ts
export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export class UserEntity implements User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public isActive: boolean = true
  ) {}

  deactivate(): void {
    this.isActive = false;
  }

  validate(): boolean {
    return this.email.includes('@') && this.name.length > 0;
  }
}
```

### 3. Repository Interface (Domain)
```typescript
// domain/repositories/user.repository.ts
export abstract class UserRepository {
  abstract getAll(): Observable<User[]>;
  abstract getById(id: number): Observable<User>;
  abstract create(user: Omit<User, 'id'>): Observable<User>;
  abstract update(id: number, user: Partial<User>): Observable<User>;
  abstract delete(id: number): Observable<void>;
}
```

### 4. Use Cases (Application Layer)
```typescript
// domain/use-cases/get-users.usecase.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class GetUsersUseCase {
  private userRepository = inject(UserRepository);

  execute(): Observable<User[]> {
    return this.userRepository.getAll();
  }
}
```

### 5. Repository Implementation (Infrastructure)
```typescript
// infrastructure/repositories/user.repository.impl.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User, UserEntity } from '../../domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class UserRepositoryImpl implements UserRepository {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  getAll(): Observable<User[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(users => users.map(u => new UserEntity(u.id, u.name, u.email, u.isActive)))
    );
  }

  getById(id: number): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(u => new UserEntity(u.id, u.name, u.email, u.isActive))
    );
  }

  create(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<any>(this.apiUrl, user).pipe(
      map(u => new UserEntity(u.id, u.name, u.email, u.isActive))
    );
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, user).pipe(
      map(u => new UserEntity(u.id, u.name, u.email, u.isActive))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### 6. Configuración de Providers
```typescript
// feature/user-management/user-management.config.ts
import { Provider } from '@angular/core';
import { UserRepository } from './domain/repositories/user.repository';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';

export const USER_MANAGEMENT_PROVIDERS: Provider[] = [
  {
    provide: UserRepository,
    useClass: UserRepositoryImpl
  }
];
```

### 7. Component usando Use Case
```typescript
// presentation/pages/user-list/user-list.component.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { GetUsersUseCase } from '../../../domain/use-cases/get-users.usecase';
import { User } from '../../../domain/entities/user.entity';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private getUsersUseCase = inject(GetUsersUseCase);
  
  users = signal<User[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.getUsersUseCase.execute().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      }
    });
  }
}
```

## 📋 Checklist

- [ ] Domain layer no tiene dependencias externas
- [ ] Use cases encapsulan lógica de negocio
- [ ] Repositories son interfaces en domain
- [ ] Implementations en infrastructure
- [ ] Components solo llaman use cases
- [ ] Entities tienen validación interna
- [ ] Providers configurados correctamente

## 🔗 Skills Relacionadas

- `architecture/solid-principles`
- `architecture/design-patterns`
- `angular/services`
- `testing/unit-testing`
