# Progressive Web App (PWA) in Angular

## 📋 Información

- **Skill ID**: `angular/pwa`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Media
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar la creación de Progressive Web Apps con Angular para aplicaciones que funcionan offline, son instalables y ofrecen experiencia nativa.

---

## 📊 Características de PWA

```
┌──────────────────────────────────────────────────────┐
│  1. OFFLINE SUPPORT                                  │
│     Service Worker, Cache API                        │
├──────────────────────────────────────────────────────┤
│  2. INSTALLABLE                                      │
│     Manifest, Add to Home Screen                     │
├──────────────────────────────────────────────────────┤
│  3. NATIVE-LIKE                                      │
│     Full screen, splash screen, app icon             │
├──────────────────────────────────────────────────────┤
│  4. PUSH NOTIFICATIONS                               │
│     Background sync, notifications                   │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Básico

### Instalar PWA Support

```bash
# Agregar PWA support a proyecto existente
ng add @angular/pwa

# O crear nuevo proyecto con PWA
ng new my-pwa-app --standalone
cd my-pwa-app
ng add @angular/pwa
```

Esto automáticamente:

- ✅ Crea `ngsw-config.json` (configuración del service worker)
- ✅ Crea `manifest.webmanifest` (manifiesto de la app)
- ✅ Agrega iconos en `/assets/icons/`
- ✅ Actualiza `index.html` con meta tags
- ✅ Actualiza `angular.json` para incluir service worker

---

## 📱 Web App Manifest

### manifest.webmanifest

```json
{
  "name": "Mi Aplicación Angular",
  "short_name": "MiApp",
  "theme_color": "#1976d2",
  "background_color": "#fafafa",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "description": "Una aplicación Progressive Web App con Angular",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Ver dashboard principal",
      "url": "/dashboard",
      "icons": [{ "src": "assets/icons/dashboard.png", "sizes": "192x192" }]
    },
    {
      "name": "Perfil",
      "short_name": "Perfil",
      "description": "Ver mi perfil",
      "url": "/profile",
      "icons": [{ "src": "assets/icons/profile.png", "sizes": "192x192" }]
    }
  ],
  "screenshots": [
    {
      "src": "assets/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

### Display Modes

- **`standalone`**: Aspecto de app nativa, sin barra del navegador
- **`fullscreen`**: Pantalla completa, sin UI del sistema
- **`minimal-ui`**: UI mínima del navegador
- **`browser`**: Tab normal del navegador

---

## ⚙️ Service Worker Configuration

### ngsw-config.json

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-performance",
      "urls": ["https://api.example.com/api/fast/**"],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 100,
        "maxAge": "2d"
      }
    },
    {
      "name": "api-freshness",
      "urls": ["https://api.example.com/api/data/**"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 50,
        "maxAge": "1h",
        "timeout": "5s"
      }
    }
  ],
  "navigationUrls": ["/**", "!/**/*.*", "!/**/*__*", "!/**/*__*/**"]
}
```

### Estrategias de Caché

**Performance (Cache-First)**

```json
{
  "strategy": "performance",
  "maxSize": 100,
  "maxAge": "2d"
}
```

- Sirve desde caché primero
- Actualiza caché en background
- Mejor para contenido estático

**Freshness (Network-First)**

```json
{
  "strategy": "freshness",
  "maxSize": 50,
  "maxAge": "1h",
  "timeout": "5s"
}
```

- Intenta red primero
- Fallback a caché si falla
- Mejor para contenido dinámico

---

## 🎯 Service Worker en Componente

### Detectar Actualizaciones

```typescript
import { Component, OnInit, inject } from "@angular/core";
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { filter, map } from "rxjs/operators";

@Component({
  selector: "app-root",
  template: `
    @if (updateAvailable) {
      <div class="update-banner">
        <p>Nueva versión disponible!</p>
        <button (click)="updateApp()">Actualizar</button>
        <button (click)="dismissUpdate()">Después</button>
      </div>
    }

    <router-outlet />
  `,
})
export class AppComponent implements OnInit {
  private swUpdate = inject(SwUpdate);
  updateAvailable = false;

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      // Detectar actualizaciones
      this.swUpdate.versionUpdates
        .pipe(
          filter(
            (evt): evt is VersionReadyEvent => evt.type === "VERSION_READY",
          ),
          map((evt) => ({
            type: "UPDATE_AVAILABLE",
            current: evt.currentVersion,
            available: evt.latestVersion,
          })),
        )
        .subscribe(() => {
          this.updateAvailable = true;
        });

      // Check por actualizaciones cada 6 horas
      setInterval(
        () => {
          this.swUpdate.checkForUpdate();
        },
        6 * 60 * 60 * 1000,
      );
    }
  }

  updateApp() {
    this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }

  dismissUpdate() {
    this.updateAvailable = false;
  }
}
```

### Manejar Errores del Service Worker

```typescript
import { SwUpdate } from "@angular/service-worker";

@Component({
  selector: "app-root",
})
export class AppComponent implements OnInit {
  private swUpdate = inject(SwUpdate);

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.unrecoverable.subscribe((event) => {
        console.error("Service worker error:", event.reason);

        // Notificar al usuario
        const shouldReload = confirm(
          "Error en la aplicación. ¿Recargar para resolver?",
        );

        if (shouldReload) {
          window.location.reload();
        }
      });
    }
  }
}
```

---

## 📲 Prompt de Instalación

### Detectar Instalabilidad

```typescript
import { Component, OnInit } from "@angular/core";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

@Component({
  selector: "app-install-prompt",
  template: `
    @if (showInstallPrompt && !isInstalled) {
      <div class="install-banner">
        <p>Instala nuestra app para mejor experiencia!</p>
        <button (click)="installApp()">Instalar</button>
        <button (click)="dismissPrompt()">No, gracias</button>
      </div>
    }

    @if (isInstalled) {
      <div class="installed-badge">✓ App instalada</div>
    }
  `,
})
export class InstallPromptComponent implements OnInit {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  showInstallPrompt = false;
  isInstalled = false;

  ngOnInit() {
    // Detectar si ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      this.isInstalled = true;
      return;
    }

    // Capturar evento beforeinstallprompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallPrompt = true;
    });

    // Detectar cuando se instala
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.showInstallPrompt = false;
      this.deferredPrompt = null;
    });
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    await this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);

    if (outcome === "accepted") {
      console.log("App installed");
    }

    this.deferredPrompt = null;
    this.showInstallPrompt = false;
  }

  dismissPrompt() {
    this.showInstallPrompt = false;

    // Recordar que se rechazó (no mostrar por 7 días)
    localStorage.setItem("installPromptDismissed", Date.now().toString());
  }
}
```

---

## 🔔 Push Notifications

### Solicitar Permiso

```typescript
import { Component, inject } from "@angular/core";
import { SwPush } from "@angular/service-worker";

@Component({
  selector: "app-notifications",
  template: `
    <button (click)="subscribeToNotifications()">
      Habilitar Notificaciones
    </button>
  `,
})
export class NotificationsComponent {
  private swPush = inject(SwPush);

  // VAPID public key (generar con web-push)
  private readonly VAPID_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

  async subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      console.error("Service Worker not supported");
      return;
    }

    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      });

      // Enviar subscription al backend
      await this.sendSubscriptionToServer(subscription);

      console.log("Subscription successful:", subscription);
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    return fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
  }
}
```

### Recibir Notificaciones

```typescript
@Component({
  selector: "app-root",
})
export class AppComponent implements OnInit {
  private swPush = inject(SwPush);

  ngOnInit() {
    if (this.swPush.isEnabled) {
      this.swPush.messages.subscribe((message: any) => {
        console.log("Push notification received:", message);

        // Procesar mensaje
        this.handleNotification(message);
      });

      this.swPush.notificationClicks.subscribe(({ action, notification }) => {
        console.log("Notification clicked:", action, notification);

        // Navegar según la acción
        if (action === "view") {
          window.open(notification.data.url);
        }
      });
    }
  }

  private handleNotification(message: any) {
    // Mostrar notificación local si la app está abierta
    if (Notification.permission === "granted") {
      new Notification(message.title, {
        body: message.body,
        icon: "/assets/icons/icon-192x192.png",
        badge: "/assets/icons/badge-72x72.png",
        data: message.data,
      });
    }
  }
}
```

---

## 💾 Cache Storage API

### Caché Manual

```typescript
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CacheService {
  private readonly CACHE_NAME = "my-app-cache-v1";

  async addToCache(url: string, response: Response): Promise<void> {
    const cache = await caches.open(this.CACHE_NAME);
    await cache.put(url, response.clone());
  }

  async getFromCache(url: string): Promise<Response | undefined> {
    const cache = await caches.open(this.CACHE_NAME);
    return await cache.match(url);
  }

  async clearCache(): Promise<void> {
    await caches.delete(this.CACHE_NAME);
  }

  async cacheUrls(urls: string[]): Promise<void> {
    const cache = await caches.open(this.CACHE_NAME);
    await cache.addAll(urls);
  }
}
```

### Estrategia de Caché Custom

```typescript
@Injectable({ providedIn: "root" })
export class OfflineFirstService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);

  getData<T>(url: string): Observable<T> {
    return from(this.fetchWithCacheFallback<T>(url));
  }

  private async fetchWithCacheFallback<T>(url: string): Promise<T> {
    try {
      // Intentar red primero
      const data = await firstValueFrom(
        this.http.get<T>(url).pipe(timeout(5000)),
      );

      // Guardar en caché
      await this.cacheData(url, data);

      return data;
    } catch (error) {
      // Fallback a caché
      console.warn("Network failed, using cache");
      return await this.getFromCache<T>(url);
    }
  }

  private async cacheData(url: string, data: any): Promise<void> {
    const response = new Response(JSON.stringify(data));
    await this.cache.addToCache(url, response);
  }

  private async getFromCache<T>(url: string): Promise<T> {
    const response = await this.cache.getFromCache(url);

    if (!response) {
      throw new Error("No data available offline");
    }

    return await response.json();
  }
}
```

---

## 🔍 Detectar Estado Offline/Online

### Network Status Service

```typescript
import { Injectable, signal } from "@angular/core";
import { fromEvent, merge, of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class NetworkStatusService {
  online = signal(navigator.onLine);

  constructor() {
    merge(
      of(navigator.onLine),
      fromEvent(window, "online").pipe(map(() => true)),
      fromEvent(window, "offline").pipe(map(() => false)),
    ).subscribe((status) => {
      this.online.set(status);
    });
  }
}
```

### Uso en Componente

```typescript
@Component({
  selector: "app-status-bar",
  template: `
    @if (!networkStatus.online()) {
      <div class="offline-banner">
        ⚠️ Sin conexión - Trabajando en modo offline
      </div>
    }
  `,
  styles: [
    `
      .offline-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f44336;
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 9999;
      }
    `,
  ],
})
export class StatusBarComponent {
  networkStatus = inject(NetworkStatusService);
}
```

---

## 🏗️ Build y Deploy

### Build para Producción

```bash
# Build con service worker habilitado
ng build --configuration production

# Verificar que se genera ngsw.json
ls dist/my-app/ngsw.json
```

### Testing Local

```bash
# Instalar http-server
npm install -g http-server

# Servir build
cd dist/my-app
http-server -p 8080 -c-1

# Abrir en: http://localhost:8080
```

### Lighthouse Audit

```bash
# Instalar lighthouse
npm install -g lighthouse

# Correr audit
lighthouse http://localhost:8080 --view

# O usar Chrome DevTools > Lighthouse
```

---

## 📋 Checklist PWA

### Básico

- [ ] Service worker configurado con `ng add @angular/pwa`
- [ ] Manifest.webmanifest completo
- [ ] Iconos en todos los tamaños (72 a 512px)
- [ ] Meta tags en index.html
- [ ] HTTPS en producción

### Service Worker

- [ ] ngsw-config.json configurado
- [ ] Estrategias de caché definidas
- [ ] Detección de actualizaciones implementada
- [ ] Manejo de errores del SW

### Instalación

- [ ] Prompt de instalación implementado
- [ ] Detectar si ya está instalada
- [ ] Display mode: standalone
- [ ] Shortcuts definidos (opcional)

### Offline

- [ ] App funciona sin conexión
- [ ] Detección de estado online/offline
- [ ] Mensajes apropiados para usuario
- [ ] Estrategia de sync cuando vuelva online

### Notificaciones (Opcional)

- [ ] Solicitar permiso de notificaciones
- [ ] Subscription al servidor push
- [ ] Manejo de notificaciones entrantes
- [ ] Acciones en notificaciones

### Testing

- [ ] Probar en incógnito (limpia service worker)
- [ ] Probar modo offline en DevTools
- [ ] Audit con Lighthouse (score > 90)
- [ ] Probar instalación en móvil

---

## ⚠️ Anti-Patterns

### ❌ No Manejar Caché Obsoleto

```typescript
// ❌ MAL: No actualizar caché antiguo
// Usuario queda con versión vieja

// ✅ BIEN: Detectar y actualizar
swUpdate.versionUpdates.subscribe((evt) => {
  if (evt.type === "VERSION_READY") {
    if (confirm("Nueva versión disponible. ¿Actualizar?")) {
      swUpdate.activateUpdate().then(() => {
        document.location.reload();
      });
    }
  }
});
```

### ❌ No Probar en Producción

```typescript
// ❌ MAL: ng serve (service worker deshabilitado)
// Service worker solo funciona en build de producción

// ✅ BIEN: Build y servir
// ng build --configuration production
// http-server dist/my-app
```

---

## 🔗 Skills Relacionadas

- `angular/http-client` - Caché de requests
- `angular/services` - Services para PWA features
- `angular/routing` - Navigation preload
- `angular/performance` - Optimización de assets

---

## 📚 Referencias

- [Angular PWA](https://angular.dev/ecosystem/service-workers)
- [Service Worker Config](https://angular.dev/ecosystem/service-workers/config)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Checklist](https://web.dev/pwa-checklist/)
