# 03 - API y Peticiones HTTP

## ApiService

El `ApiService` es el cliente HTTP centralizado que proporciona:
- Métodos tipados (GET, POST, PUT, PATCH, DELETE)
- Timeout automático
- Logging de peticiones
- Manejo de errores consistente

### Ubicación
```
src/app/core/services/api.ts
```

### Uso Básico

```typescript
import { inject } from '@angular/core';
import { ApiService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);
  
  // GET
  getProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('/products');
  }
  
  // GET con parámetros
  getProductById(id: string): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }
  
  // POST
  createProduct(data: CreateProductDto): Observable<Product> {
    return this.api.post<Product>('/products', data);
  }
  
  // PUT (reemplazo completo)
  updateProduct(id: string, data: Product): Observable<Product> {
    return this.api.put<Product>(`/products/${id}`, data);
  }
  
  // PATCH (actualización parcial)
  patchProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.api.patch<Product>(`/products/${id}`, data);
  }
  
  // DELETE
  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }
}
```

## Payloads y DTOs

### Estructura de DTOs

```typescript
// src/app/features/products/models/product.dto.ts

/**
 * Producto completo (respuesta del servidor)
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear producto (request)
 */
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
}

/**
 * DTO para actualizar producto (request)
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
}

/**
 * Filtros para listar productos
 */
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
```

### Nombrado de DTOs

| Tipo | Sufijo | Ejemplo |
|------|--------|---------|
| Entidad completa | (sin sufijo) | `Product`, `User` |
| Crear | CreateDto | `CreateProductDto` |
| Actualizar | UpdateDto | `UpdateProductDto` |
| Filtros | Filters | `ProductFilters` |
| Respuesta paginada | Response | `ProductListResponse` |

## Query Parameters

### Con HttpParams

```typescript
import { HttpParams } from '@angular/common/http';

getProducts(filters: ProductFilters): Observable<Product[]> {
  let params = new HttpParams();
  
  if (filters.category) {
    params = params.set('category', filters.category);
  }
  if (filters.minPrice) {
    params = params.set('minPrice', filters.minPrice.toString());
  }
  if (filters.search) {
    params = params.set('q', filters.search);
  }
  
  return this.api.get<Product[]>('/products', { params });
}
```

### Helper para query params

```typescript
// src/app/features/shared/utils/query-params.ts
import { HttpParams } from '@angular/common/http';

export function toHttpParams(obj: Record<string, any>): HttpParams {
  let params = new HttpParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  });
  
  return params;
}

// Uso
getProducts(filters: ProductFilters): Observable<Product[]> {
  const params = toHttpParams(filters);
  return this.api.get<Product[]>('/products', { params });
}
```

## Respuestas del Servidor

### ApiResponse Wrapper

```typescript
// src/app/core/models/api.model.ts

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

### Uso en servicios

```typescript
// Si la API devuelve { data: [...], pagination: {...} }
getProducts(page: number = 1): Observable<PaginatedResponse<Product>> {
  return this.api.get<PaginatedResponse<Product>>(`/products?page=${page}`);
}

// En el componente
loadProducts(): void {
  this.productService.getProducts(1).subscribe({
    next: (response) => {
      this.products.set(response.data);
      this.pagination.set(response.pagination);
    }
  });
}
```

## Manejo de Errores

### Estructura de errores

```typescript
// src/app/core/models/api.model.ts
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
  timestamp?: string;
}
```

### En componentes

```typescript
@Component({...})
export class Products {
  protected readonly error = signal<string | null>(null);
  
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.loading.set(false);
        
        // Manejo específico por código de error
        if (err.status === 404) {
          this.error.set('No se encontraron productos');
        } else if (err.status === 500) {
          this.error.set('Error del servidor. Intente más tarde.');
        }
      }
    });
  }
}
```

### Con catchError de RxJS

```typescript
import { catchError, EMPTY } from 'rxjs';

loadProducts(): void {
  this.productService.getProducts().pipe(
    catchError((err: ApiError) => {
      this.error.set(err.message);
      this.loading.set(false);
      return EMPTY; // O throwError(() => err) para propagar
    })
  ).subscribe((products) => {
    this.products.set(products);
    this.loading.set(false);
  });
}
```

## Headers Personalizados

```typescript
import { HttpHeaders } from '@angular/common/http';

// Con headers personalizados
uploadFile(file: File): Observable<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const headers = new HttpHeaders({
    'X-Upload-Type': 'document'
  });
  
  return this.api.post<UploadResponse>('/upload', formData, { headers });
}

// Skip loading indicator
getDataSilently(): Observable<Data> {
  const headers = new HttpHeaders({
    'X-Skip-Loading': 'true'
  });
  
  return this.api.get<Data>('/data', { headers });
}
```

## Endpoints Centralizados

```typescript
// src/app/core/config/api.config.ts
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
  },
  users: {
    base: '/users',
    profile: '/users/profile',
    byId: (id: string) => `/users/${id}`,
  },
  products: {
    base: '/products',
    byId: (id: string) => `/products/${id}`,
    categories: '/products/categories',
  },
} as const;

// Uso
import { API_ENDPOINTS } from '@core/config';

getUser(id: string): Observable<User> {
  return this.api.get<User>(API_ENDPOINTS.users.byId(id));
}
```

## Ejemplo Completo: CRUD Service

```typescript
// src/app/features/products/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services';
import { API_ENDPOINTS } from '@core/config';
import type { 
  Product, 
  CreateProductDto, 
  UpdateProductDto,
  ProductFilters 
} from '../models/product.dto';
import type { PaginatedResponse } from '@core/models';
import { toHttpParams } from '@shared/utils';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.products;

  /**
   * Listar productos con paginación y filtros
   */
  getProducts(
    page: number = 1, 
    pageSize: number = 10,
    filters?: ProductFilters
  ): Observable<PaginatedResponse<Product>> {
    const params = toHttpParams({
      page,
      pageSize,
      ...filters
    });
    
    return this.api.get<PaginatedResponse<Product>>(this.endpoint.base, { params });
  }

  /**
   * Obtener producto por ID
   */
  getProductById(id: string): Observable<Product> {
    return this.api.get<Product>(this.endpoint.byId(id));
  }

  /**
   * Crear producto
   */
  createProduct(data: CreateProductDto): Observable<Product> {
    return this.api.post<Product>(this.endpoint.base, data);
  }

  /**
   * Actualizar producto (parcial)
   */
  updateProduct(id: string, data: UpdateProductDto): Observable<Product> {
    return this.api.patch<Product>(this.endpoint.byId(id), data);
  }

  /**
   * Eliminar producto
   */
  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(this.endpoint.byId(id));
  }

  /**
   * Obtener categorías
   */
  getCategories(): Observable<string[]> {
    return this.api.get<string[]>(this.endpoint.categories);
  }
}
```

## Configuración de Timeout

El timeout se configura en `environment.ts`:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000, // 30 segundos
};
```

Para peticiones específicas que necesiten más tiempo:

```typescript
// En el ApiService, podrías agregar un método con timeout personalizado
getLargeData(): Observable<Data> {
  return this.http.get<Data>('/large-data').pipe(
    timeout(60000) // 60 segundos para esta petición
  );
}
```
