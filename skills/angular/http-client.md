# Angular HTTP Client

## 📋 Información

- **Skill ID**: `angular/http-client`
- **Versión**: 1.0.0
- **Categoría**: Angular
-**Prioridad**: Crítica
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar HTTP Client para consumir APIs REST, manejar errores, implementar interceptors, caching, y gestionar requests asíncronos.

---

## ✅ Configuración Básica

### 1. Proveer HttpClient

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withFetch(), // Usar Fetch API (recomendado)
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
  ],
}).catch(err => console.error(err));
```

---

## 🌐 CRUD Operations

### GET Requests

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  // Opción 1: Observable (tradicional)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Opción 2: Signal con Resource (moderno)
  getUsersAsSignal() {
    return toSignal(this.getUsers(), { initialValue: [] });
  }

  // Con query params
  searchUsers(query: string, page: number = 1): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      params: {
        search: query,
        page: page.toString(),
        limit: '10',
      },
    });
  }

  // Con headers personalizados
  getUsersWithAuth(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: {
        'X-Custom-Header': 'value',
      },
    });
  }
}
```

### POST Requests

```typescript
createUser(user: Omit<User, 'id'>): Observable<User> {
  return this.http.post<User>(this.apiUrl, user);
}

// Con headers
createUserWithHeaders(user: Omit<User, 'id'>): Observable<User> {
  return this.http.post<User>(this.apiUrl, user, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Retornar respuesta completa
createUserWithResponse(user: Omit<User, 'id'>): Observable<HttpResponse<User>> {
  return this.http.post<User>(this.apiUrl, user, {
    observe: 'response', // Retorna HttpResponse
  });
}
```

### PUT/PATCH Requests

```typescript
// PUT - Reemplazar completamente
updateUser(id: number, user: User): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/${id}`, user);
}

// PATCH - Actualización parcial
patchUser(id: number, updates: Partial<User>): Observable<User> {
  return this.http.patch<User>(`${this.apiUrl}/${id}`, updates);
}
```

### DELETE Requests

```typescript
deleteUser(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

// Con respuesta
deleteUserWithResponse(id: number): Observable<HttpResponse<void>> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`, {
    observe: 'response',
  });
}
```

---

## 🔧 Interceptors (Functional)

### 1. Auth Interceptor

```typescript
// interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // No agregar token a ciertas URLs
  if (req.url.includes('/auth/login') || req.url.includes('/public/')) {
    return next(req);
  }

  // Clonar request y agregar token
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
```

### 2. Error Interceptor

```typescript
// interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request';
            break;
          case 401:
            errorMessage = 'Unauthorized';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Forbidden';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Internal Server Error';
            break;
          default:
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }

      toast.error(errorMessage);
      return throwError(() => error);
    })
  );
};
```

### 3. Loading Interceptor

```typescript
// interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // No mostrar loading para ciertas URLs
  if (req.url.includes('/silent')) {
    return next(req);
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
```

### 4. Caching Interceptor

```typescript
// interceptors/cache.interceptor.ts
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

const cache = new Map<string, HttpResponse<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo cachear GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Verificar si está en caché
  const cachedResponse = cache.get(req.url);
  if (cachedResponse) {
    return of(cachedResponse.clone());
  }

  // Si no está en caché, hacer request y guardar
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, event.clone());

        // Limpiar caché después del tiempo configurado
        setTimeout(() => cache.delete(req.url), CACHE_DURATION);
      }
    })
  );
};
```

---

## 🔄 Error Handling

### 1. En el Servicio

```typescript
import { catchError, retry, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
      retry(3), // Reintentar 3 veces
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

### 2. En el Componente

```typescript
@Component({})
export class UserListComponent {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
```

---

## 📤 File Upload/Download

### Upload de Archivos

```typescript
@Injectable({ providedIn: 'root' })
export class FileService {
  private http = inject(HttpClient);

  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('/api/upload', formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // Múltiples archivos
  uploadFiles(files: File[]): Observable<HttpEvent<any>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    return this.http.post('/api/upload/multiple', formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}

// En el componente
@Component({})
export class UploadComponent {
  private fileService = inject(FileService);

  uploadProgress = signal(0);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.fileService.uploadFile(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * event.loaded) / (event.total || 1));
          this.uploadProgress.set(progress);
        } else if (event.type === HttpEventType.Response) {
          console.log('Upload complete!', event.body);
          this.uploadProgress.set(0);
        }
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.uploadProgress.set(0);
      },
    });
  }
}
```

### Download de Archivos

```typescript
@Injectable({ providedIn: 'root' })
export class FileService {
  private http = inject(HttpClient);

  downloadFile(fileId: string, filename: string): void {
    this.http.get(`/api/files/${fileId}`, {
      responseType: 'blob',
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download error:', err),
    });
  }

  // Con progreso
  downloadFileWithProgress(fileId: string): Observable<HttpEvent<Blob>> {
    return this.http.get(`/api/files/${fileId}`, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events',
    });
  }
}
```

---

## 🎯 Patrón con Resource (Moderno)

```typescript
import { resource } from '@angular/core';

@Component({})
export class UserDetailPage {
  private userService = inject(UserService);
  
  userId = input.required<number>();

  // Resource gestiona loading, error, y data automáticamente
  userResource = resource({
    request: () => ({ id: this.userId() }),
    loader: ({ request, abortSignal }) => 
      this.userService.getUserById(request.id).pipe(
        takeUntilDestroyed(),
      ),
  });

  // Acceder a estados
  user = computed(() => this.userResource.value());
  isLoading = computed(() => this.userResource.isLoading());
  hasError = computed(() => this.userResource.hasError());
}

// Template
@if (userResource.isLoading()) {
  <p>Loading...</p>
} @else if (userResource.hasError()) {
  <p>Error: {{ userResource.error() }}</p>
} @else if (userResource.hasValue()) {
  <div>
    <h2>{{ userResource.value().name }}</h2>
    <p>{{ userResource.value().email }}</p>
  </div>
}
```

---

## 💾 Caching Service

```typescript
@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Usar en servicio
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);

  getUsers(): Observable<User[]> {
    const cacheKey = 'users';
    const cached = this.cacheService.get<User[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<User[]>('/api/users').pipe(
      tap(users => this.cacheService.set(cacheKey, users))
    );
  }
}
```

---

## 📋 Checklist

- [ ] HttpClient provisto en main.ts
- [ ] Tipado correcto de responses
- [ ] Error handling implementado
- [ ] Interceptors configurados (auth, error, loading)
- [ ] Retry logic para requests fallidos
- [ ] Caching strategy implementada
- [ ] File upload/download funcional
- [ ] Loading states manejados
- [ ] Query params y headers usados correctamente
- [ ] Resources para async data (opcional pero recomendado)

---

## 🚫 Anti-Patrones

### ❌ No suscribirse múltiples veces

```typescript
// ❌ INCORRECTO
getUsers() {
  this.http.get('/api/users').subscribe(/* ... */);
  this.http.get('/api/users').subscribe(/* ... */); // Duplicado!
}

// ✅ CORRECTO
private users$ = this.http.get<User[]>('/api/users').pipe(shareReplay(1));

getUsers() {
  return this.users$; // Reutilizar observable
}
```

### ❌ No olvidar unsubscribe

```typescript
// ❌ INCORRECTO
ngOnInit() {
  this.http.get('/api/users').subscribe(/* ... */); // Memory leak
}

// ✅ CORRECTO - Opción 1: toSignal
users = toSignal(this.http.get<User[]>('/api/users'));

// ✅ CORRECTO - Opción 2: takeUntilDestroyed
ngOnInit() {
  this.http.get('/api/users')
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(/* ... */);
}
```

### ❌ No ignorar errores

```typescript
// ❌ INCORRECTO
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users'); // Sin error handling
}

// ✅ CORRECTO
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users').pipe(
    retry(2),
    catchError(this.handleError)
  );
}
```

---

## 🔗 Skills Relacionadas

- `angular/services` - Estructura de servicios HTTP
- `angular/state-management` - Cache y estado compartido
- `core/error-handling` - Manejo avanzado de errores
- `angular/routing` - Resolvers con HTTP

---

## 📚 Referencias

- [Angular HttpClient Guide](https://angular.dev/guide/http)
- [HTTP Interceptors](https://angular.dev/guide/http/interceptors)
- [Testing HTTP](https://angular.dev/guide/http/testing)
