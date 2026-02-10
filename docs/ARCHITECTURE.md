# Arquitectura del Proyecto Angular

Este documento describe la arquitectura base del proyecto Angular siguiendo buenas prácticas y patrones de diseño escalables.

## Índice de Documentación

| Documento                                                         | Descripción                           |
| ----------------------------------------------------------------- | ------------------------------------- |
| [Arquitectura General](./architecture/01-overview.md)             | Estructura de carpetas y principios   |
| [Crear Features](./architecture/02-features.md)                   | Guía para crear nuevas features       |
| [API y Peticiones HTTP](./architecture/03-api-guide.md)           | Cliente HTTP, payloads, respuestas    |
| [Guards e Interceptors](./architecture/04-guards-interceptors.md) | Protección de rutas y middleware HTTP |
| [Modelos y Tipos](./architecture/05-models-types.md)              | Interfaces, tipos y DTOs              |
| [Servicios Core](./architecture/06-core-services.md)              | Storage, Logger, Loading, Theme       |

## Estructura del Proyecto

```
src/app/
├── core/                    # Singletons de toda la app
│   ├── config/              # Constantes y configuración
│   ├── guards/              # Route guards
│   ├── interceptors/        # HTTP interceptors
│   ├── models/              # Interfaces globales
│   └── services/            # Servicios singleton
│
├── features/                # Módulos de negocio
│   ├── landing/             # Feature: Landing page
│   ├── dashboard/           # Feature: Dashboard (ejemplo)
│   └── shared/              # Compartido entre features
│       ├── components/      # Componentes reutilizables
│       ├── pipes/           # Pipes compartidos
│       ├── services/        # Servicios compartidos
│       └── utils/           # Utilidades
│
└── app.config.ts            # Configuración de providers
```

## Principios de Arquitectura

### 1. **Separación de Responsabilidades**

- `core/` → Lógica de infraestructura (singleton)
- `features/` → Lógica de negocio (por dominio)
- `shared/` → Código reutilizable entre features

### 2. **Standalone Components**

Todos los componentes son standalone (Angular 17+), sin necesidad de NgModules.

### 3. **Signals**

Uso de Angular Signals para estado reactivo en lugar de BehaviorSubject.

### 4. **Functional Guards/Interceptors**

Uso de funciones en lugar de clases para guards e interceptors.

### 5. **Barrel Exports**

Cada carpeta tiene un `index.ts` que exporta su contenido público.

## Quick Start

### Crear una nueva feature

```bash
# Estructura mínima
src/app/features/mi-feature/
├── mi-feature.ts           # Componente principal
├── mi-feature.html
├── mi-feature.scss
├── mi-feature.spec.ts      # Tests
└── index.ts                # Barrel export
```

### Usar el API Service

```typescript
import { inject } from "@angular/core";
import { ApiService } from "@core/services";

@Injectable({ providedIn: "root" })
export class UserService {
  private api = inject(ApiService);

  getUsers() {
    return this.api.get<User[]>("/users");
  }
}
```

### Proteger una ruta

```typescript
import { authGuard } from "@core/guards";

export const routes: Routes = [
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard"),
    canActivate: [authGuard],
  },
];
```

## Environments

```typescript
// src/environments/environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  // ...
};

// src/environments/environment.prod.ts (producción)
export const environment = {
  production: true,
  apiUrl: "https://api.tudominio.com/api",
  // ...
};
```

## Convenciones de Nombres

| Tipo         | Convención              | Ejemplo                     |
| ------------ | ----------------------- | --------------------------- |
| Componentes  | PascalCase, sin sufijo  | `Button`, `DataTable`       |
| Servicios    | PascalCase + Service    | `ApiService`, `UserService` |
| Guards       | camelCase + Guard       | `authGuard`, `roleGuard`    |
| Interceptors | camelCase + Interceptor | `errorInterceptor`          |
| Pipes        | PascalCase + Pipe       | `TruncatePipe`              |
| Modelos      | PascalCase              | `User`, `ApiResponse`       |
| Archivos     | kebab-case              | `user-profile.ts`           |

## Próximos Pasos

1. Lee la [guía de arquitectura](./architecture/01-overview.md) para entender la estructura
2. Revisa [cómo crear features](./architecture/02-features.md)
3. Aprende a usar el [API Service](./architecture/03-api-guide.md)
