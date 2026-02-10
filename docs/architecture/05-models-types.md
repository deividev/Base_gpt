# 05 - Modelos y Tipos

## Estructura de Modelos

```
src/app/core/models/          # Modelos globales
├── api.model.ts              # ApiResponse, PaginatedResponse
├── user.model.ts             # User, AuthTokens
└── index.ts

src/app/features/products/models/  # Modelos de feature
├── product.dto.ts
└── index.ts
```

## Modelos Globales (Core)

### API Response Types

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
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Error de API
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, string[]>; // Errores de validación
  timestamp?: string;
}

/**
 * Opción genérica para selects
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}

/**
 * Configuración de ordenamiento
 */
export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Configuración de filtro
 */
export interface FilterConfig {
  field: string;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "startsWith";
  value: unknown;
}

/**
 * Parámetros de consulta para listados
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: SortConfig;
  filters?: FilterConfig[];
  search?: string;
}
```

### User Model

```typescript
// src/app/core/models/user.model.ts

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  roles?: UserRole[];
  status: UserStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastLoginAt?: Date | string;
}

export type UserRole = "user" | "admin" | "superadmin" | "moderator";
export type UserStatus = "active" | "inactive" | "pending" | "suspended";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: "Bearer";
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
```

## Modelos de Feature (DTOs)

### Convención de Nombres

| Tipo       | Sufijo       | Descripción                  |
| ---------- | ------------ | ---------------------------- |
| Entidad    | (sin sufijo) | Modelo completo del servidor |
| Crear      | CreateDto    | Datos para crear             |
| Actualizar | UpdateDto    | Datos para actualizar        |
| Filtros    | Filters      | Parámetros de filtrado       |
| Form       | FormData     | Datos del formulario         |

### Ejemplo: Product DTOs

```typescript
// src/app/features/products/models/product.dto.ts

/**
 * Producto - Entidad completa (respuesta del servidor)
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: Category;
  tags: string[];
  images: ProductImage[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
}

/**
 * DTO para crear producto
 */
export interface CreateProductDto {
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  tags?: string[];
  stock?: number;
}

/**
 * DTO para actualizar producto (todos los campos opcionales)
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  categoryId?: string;
  tags?: string[];
  stock?: number;
  isActive?: boolean;
}

/**
 * Filtros para listar productos
 */
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  search?: string;
}

/**
 * Datos del formulario de producto
 */
export interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  categoryId: string;
  tags: string[];
  stock: number;
}
```

## Type Guards

```typescript
// src/app/features/shared/utils/type-guards.ts

/**
 * Verifica si un valor es un objeto
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Verifica si es un error de API
 */
export function isApiError(error: unknown): error is ApiError {
  return isObject(error) && "status" in error && "message" in error;
}

/**
 * Verifica si es una respuesta paginada
 */
export function isPaginatedResponse<T>(
  response: unknown,
): response is PaginatedResponse<T> {
  return (
    isObject(response) &&
    "data" in response &&
    "pagination" in response &&
    Array.isArray(response.data)
  );
}

/**
 * Type guard para discriminated unions
 */
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export function isSuccess<T>(
  result: ApiResult<T>,
): result is { success: true; data: T } {
  return result.success === true;
}
```

## Utility Types

```typescript
// src/app/features/shared/utils/utility-types.ts

/**
 * Hace todas las propiedades opcionales excepto las especificadas
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>;

/**
 * Hace solo las propiedades especificadas opcionales
 */
export type PartialPick<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Excluye propiedades que son undefined
 */
export type RequiredProps<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * Extrae el tipo de un array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Tipo para IDs
 */
export type ID = string | number;

/**
 * Tipo para timestamps
 */
export type Timestamp = string | Date;

/**
 * Hace readonly profundo
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

## Enums vs Union Types

Preferimos **Union Types** sobre Enums:

```typescript
// ❌ Evitar enums
enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending",
}

// ✅ Preferir union types
type UserStatus = "active" | "inactive" | "pending";

// ✅ Con constante para iterar
const USER_STATUSES = ["active", "inactive", "pending"] as const;
type UserStatus = (typeof USER_STATUSES)[number];
```

## Barrel Exports

```typescript
// src/app/core/models/index.ts
export * from "./api.model";
export * from "./user.model";

// src/app/features/products/models/index.ts
export * from "./product.dto";

// Uso
import { User, ApiResponse } from "@core/models";
import { Product, CreateProductDto } from "./models";
```

## Validación con Zod (Opcional)

Para validación en runtime, puedes usar Zod:

```typescript
import { z } from "zod";

// Schema de validación
export const createProductSchema = z.object({
  sku: z.string().min(3).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(5000),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  categoryId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0).default(0),
});

// Inferir tipo desde el schema
export type CreateProductDto = z.infer<typeof createProductSchema>;

// Validar
function validateProduct(data: unknown): CreateProductDto {
  return createProductSchema.parse(data);
}
```

## Checklist de Modelos

Al crear modelos, verifica:

- [ ] ¿Campos readonly donde corresponda?
- [ ] ¿Campos opcionales marcados con `?`?
- [ ] ¿Tipos específicos en lugar de `any`/`unknown`?
- [ ] ¿Union types en lugar de enums?
- [ ] ¿Documentación JSDoc en interfaces públicas?
- [ ] ¿Barrel export actualizado?
