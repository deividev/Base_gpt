# Angular Services Skill

## 📋 Información

- **Skill ID**: `angular/services`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Alta

## 🎯 Objetivo

Crear servicios Angular robustos, reutilizables y con dependency injection apropiada.

## ✅ Reglas Fundamentales

### 1. Usar Injectable con providedIn
```typescript
// ✅ CORRECTO
@Injectable({
  providedIn: 'root' // Singleton en toda la app
})
export class UserService {
  // ...
}
```

### 2. Estructura de Servicio
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Usar inject() en lugar de constructor injection
  private http = inject(HttpClient);
  private apiUrl = '/api/users';
  
  // Estado con signals si es necesario
  private usersSignal = signal<User[]>([]);
  readonly users = this.usersSignal.asReadonly();
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
}
```

### 3. inject() vs Constructor Injection
```typescript
// ✅ CORRECTO - Moderna (Angular 14+)
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
}

// ✅ También correcto - Tradicional
export class UserService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
}
```

## 📋 Checklist

- [ ] Decorador @Injectable con providedIn
- [ ] Usa inject() para dependencias
- [ ] Maneja errores apropiadamente
- [ ] Tests unitarios incluidos
- [ ] Documentación clara

## 🔗 Skills Relacionadas

- `angular/http-client`
- `angular/state-management`
- `core/error-handling`
