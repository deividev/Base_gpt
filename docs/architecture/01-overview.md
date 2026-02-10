# 01 - Arquitectura General

## Visión General

Este proyecto sigue una arquitectura modular basada en **Feature-based Architecture** con soporte para **Domain-Driven Design (DDD)** simplificado.

```
src/
├── app/
│   ├── core/                    # 🔒 Singleton - Infraestructura
│   │   ├── config/              # Constantes de la aplicación
│   │   ├── guards/              # Route guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/              # Interfaces globales
│   │   ├── services/            # Servicios singleton
│   │   └── index.ts             # Barrel export
│   │
│   ├── features/                # 📦 Features - Lógica de negocio
│   │   ├── landing/             # Feature específica
│   │   ├── dashboard/           # Otra feature
│   │   ├── auth/                # Feature de autenticación
│   │   └── shared/              # 🔄 Compartido entre features
│   │       ├── components/      # UI components reutilizables
│   │       ├── pipes/           # Pipes compartidos
│   │       ├── services/        # Servicios de feature
│   │       └── utils/           # Funciones helper
│   │
│   ├── app.config.ts            # Configuración de providers
│   ├── app.routes.ts            # Rutas de la aplicación
│   └── app.ts                   # Componente raíz
│
├── environments/                # Configuración por entorno
│   ├── environment.ts           # Desarrollo
│   └── environment.prod.ts      # Producción
│
└── styles/                      # Estilos globales
    ├── utilities.scss           # Clases utilitarias
    └── themes.config.ts         # Configuración de temas
```

## Capas de la Arquitectura

### 🔒 Core Layer (`/core`)

**Propósito**: Contiene código singleton que se usa en TODA la aplicación.

**Reglas**:
- ✅ Solo servicios con `providedIn: 'root'`
- ✅ Interceptors y guards globales
- ✅ Modelos/interfaces usados en múltiples features
- ❌ NO componentes de UI
- ❌ NO lógica de negocio específica

```typescript
// Importación desde core
import { ApiService, StorageService } from '@core/services';
import { authGuard } from '@core/guards';
import { User, ApiResponse } from '@core/models';
import { APP_CONFIG, API_ENDPOINTS } from '@core/config';
```

### 📦 Features Layer (`/features`)

**Propósito**: Cada feature es un módulo autónomo con su propia lógica de negocio.

**Reglas**:
- ✅ Componentes, servicios y modelos específicos de la feature
- ✅ Puede importar de `core/` y `shared/`
- ❌ NO importar de otras features directamente
- ❌ NO exponer implementaciones internas

```
features/
├── landing/                 # Feature: Landing page
│   ├── components/          # Componentes internos
│   ├── services/            # Servicios de la feature
│   ├── models/              # DTOs específicos
│   ├── landing.ts
│   ├── landing.html
│   ├── landing.scss
│   ├── landing.spec.ts
│   └── index.ts
│
├── dashboard/               # Feature: Dashboard
│   ├── components/
│   │   ├── stats-widget/
│   │   └── chart-panel/
│   ├── services/
│   │   └── dashboard.service.ts
│   ├── dashboard.ts
│   └── index.ts
```

### 🔄 Shared Layer (`/features/shared`)

**Propósito**: Código reutilizable entre 2+ features.

**Reglas**:
- ✅ Componentes de UI genéricos (Button, Input, Modal)
- ✅ Pipes y directivas comunes
- ✅ Servicios compartidos entre features
- ❌ NO lógica de negocio específica

```typescript
// Importación desde shared
import { Button, Input, DataTable } from '@shared/components';
import { TruncatePipe, RelativeTimePipe } from '@shared/pipes';
```

## Flujo de Dependencias

```
┌─────────────────────────────────────────────────────────┐
│                        CORE                             │
│  (services, guards, interceptors, models, config)       │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ puede importar
                          │
┌─────────────────────────┴───────────────────────────────┐
│                       SHARED                            │
│  (components, pipes, utils, feature services)           │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ puede importar
                          │
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Feature  │  │ Feature  │  │ Feature  │  │ Feature  │
│ Landing  │  │Dashboard │  │  Auth    │  │ Profile  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
      ❌ No pueden importar entre sí directamente
```

## Path Aliases

Configurados en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@features/*": ["src/app/features/*"],
      "@shared/*": ["src/app/features/shared/*"],
      "@env": ["src/environments/environment"]
    }
  }
}
```

**Uso**:
```typescript
// ✅ Correcto - usar aliases
import { ApiService } from '@core/services';
import { Button } from '@shared/components';

// ❌ Evitar - rutas relativas largas
import { ApiService } from '../../../core/services';
```

## Barrel Exports (index.ts)

Cada carpeta expone su API pública a través de `index.ts`:

```typescript
// src/app/core/services/index.ts
export { ApiService } from './api';
export { StorageService } from './storage';
export { LoggerService } from './logger';
export { LoadingService } from './loading';
export { ThemeService } from './theme';

// src/app/core/index.ts
export * from './services';
export * from './guards';
export * from './interceptors';
export * from './models';
export * from './config';
```

## Standalone Components

Todos los componentes son **standalone** (sin NgModules):

```typescript
@Component({
  selector: 'app-button',
  standalone: true,  // Implícito en Angular 17+
  imports: [NgClass, CommonModule],
  templateUrl: './button.html',
})
export class Button {
  // ...
}
```

## Signals para Estado

Uso de Angular Signals en lugar de BehaviorSubject:

```typescript
@Component({...})
export class Dashboard {
  // Estado local con signals
  private readonly users = signal<User[]>([]);
  private readonly loading = signal(false);
  
  // Computed para derivar estado
  readonly activeUsers = computed(() => 
    this.users().filter(u => u.status === 'active')
  );
  
  // Input/Output con signals
  readonly title = input.required<string>();
  readonly onSelect = output<User>();
}
```

## Testing

Cada componente/servicio tiene su archivo `.spec.ts`:

```
button/
├── button.ts
├── button.html
├── button.scss
└── button.spec.ts    # Tests con Vitest
```

Ejecutar tests:
```bash
npm test              # Ejecutar todos los tests
npm test -- --watch   # Modo watch
npm test -- --coverage # Con cobertura
```
