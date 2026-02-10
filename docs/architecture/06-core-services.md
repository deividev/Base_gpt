# 06 - Servicios Core

## Visión General

Los servicios core son singletons que proporcionan funcionalidad de infraestructura para toda la aplicación.

```
src/app/core/services/
├── api.ts           # Cliente HTTP
├── storage.ts       # LocalStorage/SessionStorage
├── logger.ts        # Logging centralizado
├── loading.ts       # Estado de carga global
├── theme.ts         # Sistema de temas
└── index.ts         # Barrel export
```

---

## ApiService

Cliente HTTP tipado con manejo de errores y logging.

### Características

- Métodos tipados (GET, POST, PUT, PATCH, DELETE)
- Timeout configurable
- Base URL desde environment
- Logging automático
- Manejo de errores consistente

### Uso

```typescript
import { inject } from "@angular/core";
import { ApiService } from "@core/services";

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly api = inject(ApiService);

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>("/users");
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.api.post<User>("/users", data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.api.patch<User>(`/users/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }
}
```

### Configuración

```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: "http://localhost:3000/api",
  apiTimeout: 30000, // 30 segundos
};
```

---

## StorageService

Wrapper tipado para localStorage y sessionStorage.

### Características

- Serialización JSON automática
- Soporte para expiración de datos
- Prefix para evitar colisiones
- Manejo de errores silencioso

### Uso

```typescript
import { StorageService } from '@core/services';

@Component({...})
export class Settings {
  private readonly storage = inject(StorageService);

  // Guardar datos
  savePreferences(prefs: UserPreferences): void {
    this.storage.set('preferences', prefs);
  }

  // Guardar con expiración (1 hora)
  saveCache(data: CacheData): void {
    this.storage.set('cache', data, { expiresIn: 3600000 });
  }

  // Obtener datos tipados
  getPreferences(): UserPreferences | null {
    return this.storage.get<UserPreferences>('preferences');
  }

  // Verificar existencia
  hasPreferences(): boolean {
    return this.storage.has('preferences');
  }

  // Eliminar
  clearPreferences(): void {
    this.storage.remove('preferences');
  }

  // Session storage (se borra al cerrar pestaña)
  saveSessionData(data: SessionData): void {
    this.storage.setSession('session_data', data);
  }

  getSessionData(): SessionData | null {
    return this.storage.getSession<SessionData>('session_data');
  }
}
```

### API Completa

```typescript
// LocalStorage
storage.get<T>(key: string): T | null
storage.set<T>(key: string, value: T, options?: { expiresIn?: number }): void
storage.remove(key: string): void
storage.has(key: string): boolean
storage.clear(): void  // Solo limpia items con el prefix de la app

// SessionStorage
storage.getSession<T>(key: string): T | null
storage.setSession<T>(key: string, value: T, options?: { expiresIn?: number }): void
storage.removeSession(key: string): void
storage.hasSession(key: string): boolean
storage.clearSession(): void
```

---

## LoggerService

Logging centralizado con niveles y control por environment.

### Niveles de Log

| Nivel   | Uso                                  | Color |
| ------- | ------------------------------------ | ----- |
| `debug` | Información detallada para debugging | 🔍    |
| `info`  | Información general del flujo        | ℹ️    |
| `warn`  | Advertencias que no bloquean         | ⚠️    |
| `error` | Errores que necesitan atención       | ❌    |

### Configuración por Environment

```typescript
// environment.ts (desarrollo)
logging: {
  level: 'debug',      // Muestra todos los logs
  enableConsole: true,
}

// environment.prod.ts (producción)
logging: {
  level: 'error',      // Solo errores
  enableConsole: false, // Deshabilitado
}
```

### Uso

```typescript
import { LoggerService } from "@core/services";

@Injectable({ providedIn: "root" })
export class DataService {
  private readonly logger = inject(LoggerService);

  loadData(): void {
    this.logger.debug("Iniciando carga de datos");

    this.api.get("/data").subscribe({
      next: (data) => {
        this.logger.info("Datos cargados", { count: data.length });
      },
      error: (err) => {
        this.logger.error("Error al cargar datos", err);
      },
    });
  }

  processItem(item: Item): void {
    this.logger.group("Procesando item");
    this.logger.debug("Item:", item);

    if (item.deprecated) {
      this.logger.warn("Item deprecado", { id: item.id });
    }

    this.logger.groupEnd();
  }

  measurePerformance(): void {
    this.logger.time("operacion-pesada");
    // ... operación
    this.logger.timeEnd("operacion-pesada");
  }
}
```

### API Completa

```typescript
logger.debug(message: string, ...data: unknown[]): void
logger.info(message: string, ...data: unknown[]): void
logger.warn(message: string, ...data: unknown[]): void
logger.error(message: string, ...data: unknown[]): void
logger.group(label: string): void
logger.groupEnd(): void
logger.time(label: string): void
logger.timeEnd(label: string): void
logger.table(data: unknown): void
```

---

## LoadingService

Gestiona el estado de carga global con soporte para múltiples peticiones concurrentes.

### Características

- Contador de peticiones activas
- Signals reactivos
- Usado automáticamente por el LoadingInterceptor

### Uso

```typescript
import { LoadingService } from '@core/services';

// En el componente raíz
@Component({
  template: `
    @if (loading.isLoading()) {
      <div class="global-loading">
        <app-spinner />
      </div>
    }

    <router-outlet />
  `
})
export class App {
  protected readonly loading = inject(LoadingService);
}

// Uso manual (raro, normalmente el interceptor lo maneja)
@Component({...})
export class CustomLoader {
  private readonly loading = inject(LoadingService);

  async heavyOperation(): Promise<void> {
    this.loading.show();
    try {
      await doSomethingHeavy();
    } finally {
      this.loading.hide();
    }
  }
}
```

### API

```typescript
loading.isLoading: Signal<boolean>      // true si hay peticiones activas
loading.pendingRequests: Signal<number> // número de peticiones en curso
loading.show(): void                    // incrementa contador
loading.hide(): void                    // decrementa contador
loading.reset(): void                   // resetea a 0
```

---

## ThemeService

Sistema de temas dinámico con soporte para light/dark mode.

### Características

- 28 temas predefinidos (Tailwind colors)
- Persistencia en localStorage
- Detección de preferencia del sistema
- Toggle dark/light mode

### Uso

```typescript
import { ThemeService } from "@core/services";

@Component({
  template: `
    <button (click)="toggleTheme()">
      {{ isDark() ? "☀️" : "🌙" }}
    </button>

    <select (change)="changeTheme($event)">
      @for (theme of themes; track theme) {
        <option [value]="theme">{{ theme }}</option>
      }
    </select>
  `,
})
export class ThemeSwitcher {
  protected readonly themeService = inject(ThemeService);

  protected readonly isDark = computed(
    () => this.themeService.currentConfig().mode === "dark",
  );

  protected readonly themes = [
    "blue",
    "green",
    "purple",
    "red",
    "orange",
    "dark",
    "dark-blue",
    "dark-purple",
  ];

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  changeTheme(event: Event): void {
    const theme = (event.target as HTMLSelectElement).value;
    this.themeService.setTheme(theme as ThemeName);
  }
}
```

### API

```typescript
themeService.currentTheme: Signal<ThemeName>      // nombre del tema actual
themeService.currentConfig: Signal<ThemeConfig>   // configuración completa
themeService.setTheme(theme: ThemeName): void     // cambiar tema
themeService.toggleDarkMode(): void               // alternar light/dark
```

---

## Crear un Nuevo Servicio Core

```typescript
// src/app/core/services/notification.ts
import { Injectable, signal } from "@angular/core";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);

  readonly notifications = this._notifications.asReadonly();

  success(message: string, duration = 3000): void {
    this.add({ type: "success", message, duration });
  }

  error(message: string, duration = 5000): void {
    this.add({ type: "error", message, duration });
  }

  warning(message: string, duration = 4000): void {
    this.add({ type: "warning", message, duration });
  }

  info(message: string, duration = 3000): void {
    this.add({ type: "info", message, duration });
  }

  private add(notification: Omit<Notification, "id">): void {
    const id = crypto.randomUUID();
    const newNotification = { ...notification, id };

    this._notifications.update((list) => [...list, newNotification]);

    if (notification.duration) {
      setTimeout(() => this.remove(id), notification.duration);
    }
  }

  remove(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clear(): void {
    this._notifications.set([]);
  }
}
```

Agregar al barrel export:

```typescript
// src/app/core/services/index.ts
export { NotificationService } from "./notification";
```

---

## Resumen de Servicios

| Servicio         | Propósito          | Singleton |
| ---------------- | ------------------ | --------- |
| `ApiService`     | Cliente HTTP       | ✅        |
| `StorageService` | Persistencia local | ✅        |
| `LoggerService`  | Logging            | ✅        |
| `LoadingService` | Estado de carga    | ✅        |
| `ThemeService`   | Temas de la app    | ✅        |
