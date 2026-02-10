# Arquitectura del Proyecto

## 📋 Información

- **Skill ID**: `architecture/project-architecture`
- **Versión**: 1.0.0
- **Categoría**: Architecture
- **Prioridad**: Crítica
- **Documentación completa**: `docs/architecture/`

## 🎯 Objetivo

Esta skill proporciona una vista rápida de la arquitectura implementada en el proyecto. Para documentación detallada, consultar `docs/architecture/`.

## 📖 Documentación de Referencia

| Documento               | Ubicación                                                                         | Contenido                                   |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| **Overview**            | [01-overview.md](../../../docs/architecture/01-overview.md)                       | Estructura de carpetas, capas, path aliases |
| **Features**            | [02-features.md](../../../docs/architecture/02-features.md)                       | Guía paso a paso para crear features        |
| **API Guide**           | [03-api-guide.md](../../../docs/architecture/03-api-guide.md)                     | Cliente HTTP, payloads, DTOs                |
| **Guards/Interceptors** | [04-guards-interceptors.md](../../../docs/architecture/04-guards-interceptors.md) | Guards funcionales, HTTP interceptors       |
| **Models**              | [05-models-types.md](../../../docs/architecture/05-models-types.md)               | Interfaces, DTOs, type guards               |
| **Core Services**       | [06-core-services.md](../../../docs/architecture/06-core-services.md)             | Servicios singleton                         |

---

## 📁 Estructura de Carpetas

```
src/app/
├── core/                    # 🔒 Singleton - Infraestructura
│   ├── config/              # APP_CONFIG, API_ENDPOINTS
│   ├── guards/              # authGuard, guestGuard, roleGuard
│   ├── interceptors/        # errorInterceptor, loadingInterceptor
│   ├── models/              # ApiResponse, User, PaginatedResponse
│   └── services/            # Api, Storage, Logger, Loading, Theme
│
├── features/                # 📦 Módulos de negocio
│   ├── landing/             # Feature ejemplo
│   ├── dashboard/           # Otra feature
│   └── shared/              # 🔄 Compartido entre features
│       ├── components/      # Button, Input, Modal, etc.
│       ├── pipes/           # truncate, safeHtml, relativeTime
│       └── utils/           # Funciones helper
│
├── app.config.ts            # Providers globales
├── app.routes.ts            # Rutas con lazy loading
└── app.ts                   # Componente raíz
```

---

## 🔧 Servicios Core Disponibles

### ApiService

```typescript
import { ApiService } from "@core/services";

// GET, POST, PUT, PATCH, DELETE tipados
this.api.get<User[]>("/users");
this.api.post<User>("/users", userData);
```

📖 Documentación: `docs/architecture/03-api-guide.md`

### StorageService

```typescript
import { StorageService } from "@core/services";

// localStorage
this.storage.set("key", value);
this.storage.get<Type>("key");

// sessionStorage
this.storage.setSession("key", value);
```

📖 Documentación: `docs/architecture/06-core-services.md`

### LoggerService

```typescript
import { LoggerService } from "@core/services";

this.logger.debug("Mensaje debug");
this.logger.info("Información");
this.logger.warn("Advertencia");
this.logger.error("Error", errorObject);
```

📖 Documentación: `docs/architecture/06-core-services.md`

### LoadingService

```typescript
import { LoadingService } from '@core/services';

// Automático con HTTP (via loadingInterceptor)
// En template:
@if (loading.isLoading()) { <spinner /> }
```

📖 Documentación: `docs/architecture/06-core-services.md`

---

## 🛡️ Guards Disponibles

```typescript
import { authGuard, guestGuard, roleGuard } from '@core/guards';

// Requiere autenticación
{ path: 'dashboard', canActivate: [authGuard] }

// Solo NO autenticados (login, registro)
{ path: 'login', canActivate: [guestGuard] }

// Requiere rol específico
{ path: 'admin', canActivate: [authGuard, roleGuard(['admin'])] }
```

📖 Documentación: `docs/architecture/04-guards-interceptors.md`

---

## 🔌 Interceptors Activos

```typescript
// app.config.ts
provideHttpClient(
  withInterceptors([
    errorInterceptor, // Manejo centralizado de errores
    loadingInterceptor, // Estado de loading automático
  ]),
);
```

📖 Documentación: `docs/architecture/04-guards-interceptors.md`

---

## 📝 Crear Nueva Feature

**Checklist rápido:**

1. Crear carpeta en `src/app/features/mi-feature/`
2. Crear componente principal: `mi-feature.ts`, `.html`, `.scss`, `.spec.ts`
3. Crear servicio si necesita API: `services/mi-feature.service.ts`
4. Crear modelos/DTOs: `models/mi-feature.dto.ts`
5. Crear barrel export: `index.ts`
6. Agregar ruta en `app.routes.ts`

📖 Guía completa: `docs/architecture/02-features.md`

---

## 🧪 Testing

**Framework**: Vitest 4.0.8

```typescript
// ✅ Correcto
const spy = vi.fn();
vi.spyOn(service, "method");

// ❌ Incorrecto (Jasmine - NO USAR)
jasmine.createSpy();
spyOn(service, "method");
```

**Comandos:**

```bash
npm test           # Ejecutar tests
npm test -- --watch    # Modo watch
npm test -- --coverage # Con cobertura
```

---

## 🔗 Skills Relacionadas

- `architecture/clean-architecture` - Capas y dependencias
- `architecture/modular-design` - Diseño modular
- `angular/http-client` - Detalles de HTTP
- `angular/routing` - Configuración de rutas
- `core/error-handling` - Manejo de errores

---

## ✅ Checklist de Arquitectura

Antes de hacer cambios, verificar:

- [ ] ¿El código va en core, features, o shared?
- [ ] ¿Se usan los servicios de @core/services?
- [ ] ¿Los guards están en @core/guards?
- [ ] ¿Los modelos globales van en @core/models?
- [ ] ¿El barrel export (index.ts) está actualizado?
- [ ] ¿Los tests usan vi.fn() y vi.spyOn()?
