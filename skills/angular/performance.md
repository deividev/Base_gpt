# Angular Performance Optimization

## 📋 Información

- **Skill ID**: `angular/performance`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Alta
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar técnicas de optimización para crear aplicaciones Angular rápidas, eficientes y escalables.

---

## 📊 Áreas de Optimización

```
┌──────────────────────────────────────────────────────┐
│  1. CHANGE DETECTION                                 │
│     OnPush strategy, signals                         │
├──────────────────────────────────────────────────────┤
│  2. RENDERING                                        │
│     TrackBy, virtual scrolling                       │
├──────────────────────────────────────────────────────┤
│  3. BUNDLE SIZE                                      │
│     Lazy loading, tree shaking                       │
├──────────────────────────────────────────────────────┤
│  4. RUNTIME PERFORMANCE                              │
│     Memoization, web workers                         │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Change Detection Strategy

### OnPush Strategy

```typescript
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// ❌ Default (verifica en cada change detection)
@Component({
  selector: 'app-user-default',
  template: `<p>{{ user.name }}</p>`,
  changeDetection: ChangeDetectionStrategy.Default, // Default
})
export class UserDefaultComponent {
  @Input() user!: User;
}

// ✅ OnPush (solo verifica cuando inputs cambian)
@Component({
  selector: 'app-user-optimized',
  template: `<p>{{ user.name }}</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOptimizedComponent {
  @Input() user!: User;
}

// Uso en parent
@Component({
  template: `
    <!-- Disparar change detection: pasar NUEVO objeto -->
    <app-user-optimized [user]="currentUser" />
    
    <button (click)="updateUser()">Update</button>
  `,
})
export class ParentComponent {
  currentUser = { id: 1, name: 'John' };
  
  updateUser() {
    // ✅ BIEN: Nuevo objeto reference
    this.currentUser = { ...this.currentUser, name: 'Jane' };
    
    // ❌ MAL: Mutación no dispara OnPush
    // this.currentUser.name = 'Jane';
  }
}
```

### OnPush con Signals (Angular 16+)

```typescript
import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <button (click)="increment()">+</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  // Signals funcionan perfectamente con OnPush
  count = signal(0);
  
  increment() {
    this.count.update(n => n + 1); // Dispara change detection
  }
}
```

### Manual Change Detection

```typescript
import { Component, ChangeDetectorRef, inject } from '@angular/core';

@Component({
  selector: 'app-manual',
  template: `<p>{{ data }}</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualComponent {
  private cdr = inject(ChangeDetectorRef);
  data = 'Initial';
  
  loadData() {
    setTimeout(() => {
      this.data = 'Updated';
      // Forzar change detection manualmente
      this.cdr.markForCheck();
    }, 1000);
  }
  
  // Desactivar change detection temporalmente
  performHeavyOperation() {
    this.cdr.detach(); // Pausar
    
    // Operación costosa
    for (let i = 0; i < 1000000; i++) {
      // ...
    }
    
    this.cdr.reattach(); // Reanudar
    this.cdr.detectChanges(); // Forzar check
  }
}
```

---

## 🎯 TrackBy Functions

### Sin TrackBy (Ineficiente)

```typescript
// ❌ MAL: Re-renderiza todo el DOM en cada cambio
@Component({
  template: `
    @for (item of items; track $index) {
      <div class="item">{{ item.name }}</div>
    }
  `,
})
export class BadListComponent {
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];
  
  addItem() {
    this.items = [...this.items, { id: 4, name: 'Item 4' }];
    // Angular destruye y recrea TODOS los elementos del DOM
  }
}
```

### Con TrackBy (Eficiente)

```typescript
// ✅ BIEN: Solo actualiza lo que cambió
@Component({
  template: `
    @for (item of items; track item.id) {
      <div class="item">
        {{ item.name }}
        <expensive-component [data]="item" />
      </div>
    }
  `,
})
export class GoodListComponent {
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];
  
  addItem() {
    this.items = [...this.items, { id: 4, name: 'Item 4' }];
    // Angular solo crea el nuevo elemento
  }
  
  updateItem(id: number, name: string) {
    this.items = this.items.map(item =>
      item.id === id ? { ...item, name } : item
    );
    // Angular solo actualiza el elemento modificado
  }
}
```

### TrackBy con ngFor (Angular < 17)

```typescript
@Component({
  template: `
    <div *ngFor="let item of items; trackBy: trackById">
      {{ item.name }}
    </div>
  `,
})
export class TrackByComponent {
  items: Item[] = [];
  
  trackById(index: number, item: Item): number {
    return item.id; // Usar ID único
  }
  
  // Alternativas
  trackByIndex(index: number): number {
    return index; // Usar índice (menos eficiente)
  }
  
  trackByFn = (index: number, item: Item) => item.id; // Arrow function
}
```

---

## 📦 Lazy Loading

### Route-based Lazy Loading

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'admin',
    // Lazy loading con loadComponent
    loadComponent: () =>
      import('./admin/admin.component').then(m => m.AdminComponent),
  },
  {
    path: 'dashboard',
    // Lazy loading de múltiples rutas
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./products/products.routes').then(m => m.PRODUCTS_ROUTES),
    // Preloading strategy
    data: { preload: true },
  },
];

// dashboard.routes.ts
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
  },
];
```

### Preloading Strategies

```typescript
// app.config.ts
import { 
  ApplicationConfig, 
  provideRouter,
  PreloadAllModules,
  withPreloading
} from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // Precargar todos los módulos lazy
      withPreloading(PreloadAllModules)
    ),
  ],
};

// Custom Preloading Strategy
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Precargar solo si route.data.preload === true
    if (route.data?.['preload']) {
      console.log('Preloading:', route.path);
      return load();
    }
    return of(null);
  }
}

// Preload con delay
@Injectable({ providedIn: 'root' })
export class DelayedPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.['preload']) {
      // Esperar 2 segundos antes de precargar
      return timer(2000).pipe(mergeMap(() => load()));
    }
    return of(null);
  }
}

// Uso
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(CustomPreloadingStrategy)
    ),
  ],
};
```

---

## 📜 Virtual Scrolling

### CDK Virtual Scroll

```bash
# Install Angular CDK (compatible with Angular 21)
npm install @angular/cdk@^21.0.0
```

```typescript
import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-virtual-list',
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport 
      itemSize="50"
      class="viewport"
    >
      <div 
        *cdkVirtualFor="let item of items; trackBy: trackById"
        class="item"
      >
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .viewport {
      height: 400px;
      width: 100%;
    }
    
    .item {
      height: 50px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid #ccc;
    }
  `],
})
export class VirtualListComponent {
  // 10,000 items pero solo renderiza ~10 visibles
  items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));
  
  trackById(index: number, item: any): number {
    return item.id;
  }
}
```

### Virtual Scroll con Tamaños Variables

```typescript
@Component({
  template: `
    <cdk-virtual-scroll-viewport 
      [itemSize]="50"
      class="viewport"
      minBufferPx="200"
      maxBufferPx="400"
    >
      <div 
        *cdkVirtualFor="let item of items; 
                        trackBy: trackById;
                        templateCacheSize: 0"
        class="item"
      >
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </div>
    </cdk-virtual-scroll-viewport>
  `,
})
export class VariableHeightListComponent {
  items = [...]; // Array grande
  
  trackById = (index: number, item: any) => item.id;
}
```

---

## 📦 Bundle Optimization

### Análisis de Bundle

```bash
# Generar build con stats
ng build --stats-json

# Analizar con webpack-bundle-analyzer
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/your-app/stats.json
```

### Tree Shaking

```typescript
// ❌ MAL: Importa toda la librería
import * as _ from 'lodash';
const result = _.map(array, fn);

// ✅ BIEN: Importa solo lo necesario
import map from 'lodash-es/map';
const result = map(array, fn);

// ❌ MAL: Importa todo RxJS
import { Observable } from 'rxjs';

// ✅ BIEN: Import específico
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
```

### Differential Loading (automático)

```json
// angular.json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "optimization": true,
            "buildOptimizer": true,
            "aot": true
          }
        }
      }
    }
  }
}
```

---

## 🎨 Rendering Performance

### Pure Pipes

```typescript
// ✅ Pure pipe (default) - Cachea resultados
@Pipe({ name: 'expensiveCalculation' })
export class ExpensiveCalculationPipe implements PipeTransform {
  transform(value: number): number {
    console.log('Calculation executed'); // Se ve poco
    return Math.pow(value, 2) * Math.sqrt(value);
  }
}

// ❌ Impure pipe - Ejecuta constantemente
@Pipe({ 
  name: 'expensiveCalculation',
  pure: false 
})
export class ImpureExpensiveCalculationPipe implements PipeTransform {
  transform(value: number): number {
    console.log('Calculation executed'); // Se ve TODO EL TIEMPO
    return Math.pow(value, 2) * Math.sqrt(value);
  }
}
```

### Memoization

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MemoizationService {
  private cache = new Map<string, any>();
  
  memoize<T>(key: string, fn: () => T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = fn();
    this.cache.set(key, result);
    return result;
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Uso en componente
export class ProductComponent {
  private memoService = inject(MemoizationService);
  
  getExpensiveCalculation(id: number): number {
    return this.memoService.memoize(
      `calc-${id}`,
      () => this.performExpensiveCalculation(id)
    );
  }
  
  private performExpensiveCalculation(id: number): number {
    // Operación costosa
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i * id);
    }
    return result;
  }
}
```

### Computed Signals (Memoization Automática)

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-calc',
  template: `
    <p>Input: {{ input() }}</p>
    <p>Result: {{ expensiveResult() }}</p>
    <button (click)="increment()">Increment</button>
  `,
})
export class CalcComponent {
  input = signal(5);
  
  // Computed se re-ejecuta SOLO cuando input cambia
  expensiveResult = computed(() => {
    console.log('Computing...'); // Solo cuando input cambia
    const value = this.input();
    return Math.pow(value, 2) * Math.sqrt(value);
  });
  
  increment() {
    this.input.update(n => n + 1);
  }
}
```

---

## 🔧 Web Workers

### Angular Worker

```bash
ng generate web-worker app
```

```typescript
// app.worker.ts
addEventListener('message', ({ data }) => {
  const result = heavyComputation(data);
  postMessage(result);
});

function heavyComputation(data: any) {
  // Operación costosa en background thread
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += Math.sqrt(i * data.value);
  }
  return result;
}

// component.ts
@Component({
  selector: 'app-worker-demo',
  template: `
    <button (click)="calculate()">Calculate</button>
    <p>Result: {{ result }}</p>
    <p>{{ message }}</p>
  `,
})
export class WorkerDemoComponent {
  result: number = 0;
  message = 'Ready';
  
  calculate() {
    if (typeof Worker !== 'undefined') {
      this.message = 'Calculating...';
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      
      worker.onmessage = ({ data }) => {
        this.result = data;
        this.message = 'Done!';
        worker.terminate();
      };
      
      worker.postMessage({ value: 42 });
    } else {
      // Web Workers no soportados
      this.result = this.heavyComputationFallback(42);
    }
  }
  
  private heavyComputationFallback(value: number): number {
    // Fallback sin worker
    return 0;
  }
}
```

---

## ⚡ Image Optimization

### NgOptimizedImage (Angular 15+)

```typescript
import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [NgOptimizedImage],
  template: `
    <!-- Lazy loading automático -->
    <img 
      ngSrc="assets/hero.jpg"
      alt="Hero image"
      width="1600"
      height="900"
      priority
    />
    
    <!-- Con placeholder -->
    <img 
      ngSrc="assets/product.jpg"
      alt="Product"
      width="400"
      height="300"
      placeholder
    />
    
    <!-- Fill mode -->
    <div style="position: relative; width: 100%; height: 400px;">
      <img 
        ngSrc="assets/background.jpg"
        alt="Background"
        fill
      />
    </div>
  `,
})
export class GalleryComponent {}
```

### Image Loader para CDN

```typescript
// image-loader.ts
import { ImageLoaderConfig } from '@angular/common';

export function cloudinaryLoader(config: ImageLoaderConfig): string {
  const url = `https://res.cloudinary.com/demo/image/upload`;
  const params = `w_${config.width},q_auto`;
  return `${url}/${params}/${config.src}`;
}

// app.config.ts
import { provideImageConfig } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideImageConfig({
      imageLoader: cloudinaryLoader,
    }),
  ],
};
```

---

## 📋 Checklist de Performance

### Change Detection
- [ ] Usar OnPush en componentes cuando sea posible
- [ ] Usar signals para estado reactivo
- [ ] Evitar mutaciones, crear nuevos objetos
- [ ] Desactivar change detection para operaciones pesadas

### Rendering
- [ ] Implementar trackBy en listas
- [ ] Usar virtual scrolling para listas grandes (>100 items)
- [ ] Lazy load de imágenes con NgOptimizedImage
- [ ] Minimizar DOM manipulations

### Bundle Size
- [ ] Lazy load de rutas
- [ ] Tree shaking (imports específicos)
- [ ] Analizar bundle size regularmente
- [ ] Implementar preloading strategy apropiada
- [ ] Code splitting por features

### Runtime
- [ ] Usar pure pipes por defecto
- [ ] Memoizar cálculos costosos con computed
- [ ] Web workers para operaciones pesadas
- [ ] Optimizar subscriptions (async pipe, takeUntil)
- [ ] Avoid memory leaks

### Network
- [ ] HTTP interceptors para caching
- [ ] Comprimir responses (gzip)
- [ ] Service workers para offline
- [ ] CDN para assets estáticos

---

## 🔍 Herramientas de Profiling

### Chrome DevTools

```typescript
// Marcar performance
performance.mark('component-init-start');

// ... código ...

performance.mark('component-init-end');
performance.measure(
  'Component Init',
  'component-init-start',
  'component-init-end'
);

// Ver en DevTools > Performance
```

### Angular DevTools

```bash
# Instalar extensión de Chrome
# https://chrome.google.com/webstore/detail/angular-devtools
```

### Lighthouse

- Ejecutar auditoría en Chrome DevTools
- Revisar Performance, Accessibility, Best Practices, SEO
- Implementar recomendaciones

---

## ⚠️ Anti-Patterns

### ❌ Funciones en Templates

```typescript
// ❌ MAL
@Component({
  template: `
    <div>{{ getTotal() }}</div>
  `,
})
export class BadComponent {
  getTotal() {
    // Se ejecuta en CADA change detection
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// ✅ BIEN
@Component({
  template: `
    <div>{{ total() }}</div>
  `,
})
export class GoodComponent {
  items = signal<Item[]>([]);
  
  total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price, 0)
  );
}
```

### ❌ Memory Leaks

```typescript
// ❌ MAL
export class LeakyComponent implements OnInit {
  ngOnInit() {
    interval(1000).subscribe(val => console.log(val));
    // Nunca se desuscribe
  }
}

// ✅ BIEN
export class CleanComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => console.log(val));
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## 🔗 Skills Relacionadas

- `angular/component-creation` - OnPush components
- `angular/rxjs` - Subscription management
- `angular/routing` - Lazy loading
- `angular/state-management` - Signals optimization

---

## 📚 Referencias

- [Angular Performance](https://angular.dev/best-practices/runtime-performance)
- [Change Detection](https://angular.dev/best-practices/runtime-performance)
- [Bundle Optimization](https://angular.dev/tools/cli/build)
- [CDK Virtual Scroll](https://material.angular.io/cdk/scrolling/overview)
