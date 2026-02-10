# Modular Design in Angular

## 📋 Metadata
- **Difficulty**: Advanced
- **Prerequisites**: routing.md, component-creation.md, services.md
- **Estimated Time**: 4-6 hours
- **Version**: Angular 21, TypeScript 5.8+, Node.js 18.19+/20.11+
- **Category**: Architecture

## 📖 Documentación Implementada

> **IMPORTANTE**: La arquitectura modular está documentada en detalle en `docs/architecture/`.
> 
> - **Estructura de carpetas**: [01-overview.md](../../../docs/architecture/01-overview.md)
> - **Crear features**: [02-features.md](../../../docs/architecture/02-features.md)
> - **Servicios core**: [06-core-services.md](../../../docs/architecture/06-core-services.md)
>
> Esta skill proporciona fundamentos teóricos. Para la implementación práctica del proyecto, consultar la documentación de arquitectura.

## 🎯 Learning Objectives
- Organize applications with modular architecture
- Implement lazy loading for optimal performance
- Design reusable feature, shared, and core modules
- Understand standalone vs NgModule approaches
- Structure large-scale applications effectively

---

## 📦 Module Types in Angular

### 1. Core Module (Singleton Services)
**Purpose**: Global singleton services, guards, interceptors

```typescript
// core/auth/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);
  user = this.userSignal.asReadonly();

  constructor(private http: HttpClient) {}

  login(credentials: Credentials): Observable<User> {
    return this.http.post<User>('/api/auth/login', credentials).pipe(
      tap(user => this.userSignal.set(user))
    );
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem('token');
  }
}

// core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
};

// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.user()) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};

// core/index.ts (Barrel export)
export * from './auth/auth.service';
export * from './interceptors/auth.interceptor';
export * from './guards/auth.guard';
```

### 2. Shared Module (Reusable Components/Pipes/Directives)
**Purpose**: Common UI components, pipes, directives usados en toda la app

```typescript
// shared/components/button/button.component.ts
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      [type]="type" 
      [disabled]="disabled"
      [class]="'btn btn-' + variant">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn { padding: 0.5rem 1rem; border-radius: 4px; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
}

// shared/pipes/truncate.pipe.ts
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, trail: string = '...'): string {
    return value.length > limit 
      ? value.substring(0, limit) + trail 
      : value;
  }
}

// shared/directives/highlight.directive.ts
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}

// shared/index.ts
export const SHARED_COMPONENTS = [
  ButtonComponent,
  CardComponent,
  ModalComponent
] as const;

export const SHARED_PIPES = [
  TruncatePipe,
  DateAgoPipe,
  SafeHtmlPipe
] as const;

export const SHARED_DIRECTIVES = [
  HighlightDirective,
  AutofocusDirective
] as const;

export const SHARED_IMPORTS = [
  ...SHARED_COMPONENTS,
  ...SHARED_PIPES,
  ...SHARED_DIRECTIVES
] as const;
```

### 3. Feature Module (Business Logic)
**Purpose**: Funcionalidad específica de negocio agrupada

```typescript
// features/products/products.routes.ts
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsLayoutComponent,
    children: [
      { path: '', component: ProductListComponent },
      { path: ':id', component: ProductDetailComponent },
      { path: ':id/edit', component: ProductEditComponent }
    ]
  }
];

// features/products/products.service.ts
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private productsSignal = signal<Product[]>([]);
  products = this.productsSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      tap(products => this.productsSignal.set(products))
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  createProduct(product: ProductInput): Observable<Product> {
    return this.http.post<Product>('/api/products', product).pipe(
      tap(newProduct => {
        this.productsSignal.update(products => [...products, newProduct]);
      })
    );
  }
}

// features/products/components/product-list.component.ts
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  template: `
    <h1>Products</h1>
    @for (product of products(); track product.id) {
      <app-card>
        <h3>{{ product.name }}</h3>
        <p>{{ product.description | truncate:100 }}</p>
        <app-button (click)="viewProduct(product.id)">
          View Details
        </app-button>
      </app-card>
    }
  `
})
export class ProductListComponent {
  products = this.productsService.products;

  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productsService.loadProducts().subscribe();
  }

  viewProduct(id: string) {
    this.router.navigate(['/products', id]);
  }
}
```

---

## 🗂️ Folder Structure: Feature-First

### Recommended Structure
```
src/
├── app/
│   ├── core/                    # Singleton services
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── token.service.ts
│   │   │   └── index.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── admin.guard.ts
│   │   │   └── index.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── shared/                  # Reusable UI
│   │   ├── components/
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   └── button.component.spec.ts
│   │   │   ├── card/
│   │   │   ├── modal/
│   │   │   └── index.ts
│   │   ├── pipes/
│   │   │   ├── truncate.pipe.ts
│   │   │   ├── date-ago.pipe.ts
│   │   │   └── index.ts
│   │   ├── directives/
│   │   │   ├── highlight.directive.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── features/                # Feature modules
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── product-list/
│   │   │   │   ├── product-detail/
│   │   │   │   └── product-form/
│   │   │   ├── services/
│   │   │   │   ├── products.service.ts
│   │   │   │   └── product-validator.service.ts
│   │   │   ├── models/
│   │   │   │   └── product.model.ts
│   │   │   ├── products.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── users.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   └── dashboard/
│   │       ├── components/
│   │       ├── widgets/
│   │       ├── dashboard.routes.ts
│   │       └── index.ts
│   │
│   ├── layout/                  # Layout components
│   │   ├── header/
│   │   ├── footer/
│   │   ├── sidebar/
│   │   └── index.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
└── assets/
    ├── images/
    ├── fonts/
    └── styles/
```

---

## 🚀 Lazy Loading Strategy

### Route-Based Lazy Loading

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Lazy load features
  {
    path: 'products',
    loadChildren: () => 
      import('./features/products/products.routes')
        .then(m => m.PRODUCTS_ROUTES)
  },
  
  {
    path: 'users',
    loadChildren: () => 
      import('./features/users/users.routes')
        .then(m => m.USERS_ROUTES)
  },
  
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => 
      import('./features/orders/orders.routes')
        .then(m => m.ORDERS_ROUTES)
  },
  
  // Lazy load layout + children
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(m => m.ADMIN_ROUTES)
  }
];
```

### Component-Level Lazy Loading

```typescript
// Lazy load modal on demand
@Component({
  selector: 'app-product-list',
  standalone: true,
  template: `
    <button (click)="openModal()">Create Product</button>
    @if (showModal) {
      <ng-container *ngComponentOutlet="modalComponent | async" />
    }
  `
})
export class ProductListComponent {
  showModal = false;
  modalComponent?: Promise<Type<any>>;

  async openModal() {
    this.showModal = true;
    
    // Lazy load component
    this.modalComponent = import('./product-modal.component')
      .then(m => m.ProductModalComponent);
  }
}
```

### Preloading Strategy

```typescript
// Custom preload strategy
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload routes with data.preload = true
    return route.data?.['preload'] ? load() : of(null);
  }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(SelectivePreloadingStrategy)
    )
  ]
};

// Route with preload flag
{
  path: 'products',
  data: { preload: true },  // ✅ Will be preloaded
  loadChildren: () => import('./features/products/products.routes')
}
```

---

## 🎨 Standalone Components Architecture

### App Config with Standalone

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimations(),
    
    // Global providers
    { provide: APP_INITIALIZER, useFactory: initializeApp, multi: true },
    { provide: LOGGER, useClass: ConsoleLogger }
  ]
};

// main.ts
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

### Feature with Standalone Components

```typescript
// features/dashboard/dashboard.routes.ts
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./widgets/overview-widget.component')
            .then(m => m.OverviewWidgetComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./widgets/analytics-widget.component')
            .then(m => m.AnalyticsWidgetComponent)
      }
    ]
  }
];

// features/dashboard/dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, SHARED_IMPORTS],
  template: `
    <div class="dashboard">
      <nav>
        <a routerLink="overview">Overview</a>
        <a routerLink="analytics">Analytics</a>
      </nav>
      <router-outlet />
    </div>
  `
})
export class DashboardComponent {}
```

---

## 🔗 Barrel Exports & Index Files

### Purpose
Simplificar imports y controlar API pública del módulo

### ✅ Good Barrel Exports

```typescript
// shared/components/index.ts
export { ButtonComponent } from './button/button.component';
export { CardComponent } from './card/card.component';
export { ModalComponent } from './modal/modal.component';

export const SHARED_COMPONENTS = [
  ButtonComponent,
  CardComponent,
  ModalComponent
] as const;

// shared/index.ts
export * from './components';
export * from './pipes';
export * from './directives';
export { SHARED_IMPORTS } from './shared-imports';

// Usage
import { SHARED_IMPORTS } from '@app/shared';
import { ButtonComponent } from '@app/shared';
```

### ❌ Barrel Export Anti-patterns

```typescript
// ❌ BAD: Re-exporting everything (circular dependencies)
export * from './component-a';
export * from './component-b';  // si component-b importa component-a

// ❌ BAD: Exporting too much (exposes internals)
export * from './internal-service';  // Debería ser privado

// ✅ GOOD: Explicit exports
export { PublicService } from './public.service';
// InternalService NO se exporta
```

---

## 🧩 Module Dependency Management

### Dependency Rules

```typescript
/**
 * REGLAS DE DEPENDENCIAS:
 * 
 * 1. Core NO depende de Features ni Shared
 * 2. Shared NO depende de Features ni Core
 * 3. Features pueden depender de Core y Shared
 * 4. Features NO deben depender entre sí
 */

// ✅ GOOD
// features/products/product-list.component.ts
import { AuthService } from '@core/auth';     // ✅ Feature -> Core
import { ButtonComponent } from '@shared';    // ✅ Feature -> Shared

// ❌ BAD
// features/products/product-service.ts
import { UserService } from '@features/users';  // ❌ Feature -> Feature

// ✅ GOOD: Extract to core if shared
// core/api/api.service.ts (usado por múltiples features)
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}
  
  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }
}
```

### Path Aliases in tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@environment/*": ["src/environments/*"]
    }
  }
}
```

---

## 📐 Design Patterns for Modular Architecture

### 1. Facade Pattern (Simplify Complex APIs)

```typescript
// features/orders/services/orders-facade.service.ts
@Injectable({ providedIn: 'root' })
export class OrdersFacadeService {
  // Exposes simple API to components
  orders = this.ordersService.orders;
  loading = this.ordersService.loading;
  
  constructor(
    private ordersService: OrdersService,
    private ordersApiService: OrdersApiService,
    private ordersValidationService: OrdersValidationService,
    private ordersNotificationService: OrdersNotificationService
  ) {}

  createOrder(orderInput: OrderInput): Observable<Order> {
    // Orchestrates multiple services
    if (!this.ordersValidationService.validate(orderInput)) {
      return throwError(() => new Error('Invalid order'));
    }

    return this.ordersApiService.createOrder(orderInput).pipe(
      tap(order => {
        this.ordersService.addOrder(order);
        this.ordersNotificationService.notifyOrderCreated(order);
      })
    );
  }

  loadOrders(): Observable<Order[]> {
    return this.ordersService.loadOrders();
  }
}

// Component only depends on facade
@Component({...})
export class OrdersComponent {
  orders = this.ordersFacade.orders;
  loading = this.ordersFacade.loading;

  constructor(private ordersFacade: OrdersFacadeService) {}

  ngOnInit() {
    this.ordersFacade.loadOrders().subscribe();
  }

  createOrder(input: OrderInput) {
    this.ordersFacade.createOrder(input).subscribe();
  }
}
```

### 2. Repository Pattern

```typescript
// core/data/repository.interface.ts
export interface Repository<T> {
  findById(id: string): Observable<T>;
  findAll(): Observable<T[]>;
  create(item: T): Observable<T>;
  update(id: string, item: Partial<T>): Observable<T>;
  delete(id: string): Observable<void>;
}

// features/products/data/products.repository.ts
@Injectable({ providedIn: 'root' })
export class ProductsRepository implements Repository<Product> {
  private readonly endpoint = '/api/products';

  constructor(private http: HttpClient) {}

  findById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.endpoint}/${id}`);
  }

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.endpoint);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.endpoint, product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.endpoint}/${id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

---

## 🔍 Module Communication Patterns

### 1. Service-Based Communication (Recommended)

```typescript
// core/events/event-bus.service.ts
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private events = new Subject<AppEvent>();
  events$ = this.events.asObservable();

  emit(event: AppEvent): void {
    this.events.next(event);
  }

  on<T extends AppEvent>(
    eventType: new (...args: any[]) => T
  ): Observable<T> {
    return this.events$.pipe(
      filter(event => event instanceof eventType),
      map(event => event as T)
    );
  }
}

// Events
export class OrderCreatedEvent {
  constructor(public order: Order) {}
}

export class ProductUpdatedEvent {
  constructor(public product: Product) {}
}

// Feature A emits event
@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private eventBus: EventBusService) {}

  createOrder(order: Order) {
    // ... create logic
    this.eventBus.emit(new OrderCreatedEvent(order));
  }
}

// Feature B listens to event
@Component({...})
export class NotificationsPanelComponent {
  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.eventBus.on(OrderCreatedEvent).subscribe(event => {
      console.log('New order created:', event.order);
    });
  }
}
```

### 2. State Management (NgRx/Signals)

```typescript
// core/store/app.store.ts
export const AppStore = signalStore(
  { providedIn: 'root' },
  withState({
    user: null as User | null,
    cart: [] as CartItem[],
    notifications: [] as Notification[]
  }),
  withMethods((store) => ({
    setUser(user: User) {
      patchState(store, { user });
    },
    addToCart(item: CartItem) {
      patchState(store, (state) => ({
        cart: [...state.cart, item]
      }));
    }
  }))
);

// Features use store
@Component({...})
export class ProductDetailComponent {
  store = inject(AppStore);

  addToCart(product: Product) {
    this.store.addToCart({ product, quantity: 1 });
  }
}

@Component({...})
export class CartComponent {
  store = inject(AppStore);
  cart = this.store.cart;  // Signal
}
```

---

## ⚡ Performance Optimization

### 1. Tree-Shakeable Providers

```typescript
// ✅ GOOD: Provideable in 'root' (tree-shakeable)
@Injectable({ providedIn: 'root' })
export class ProductsService {}

// ❌ BAD: Provider in module (not tree-shakeable)
@NgModule({
  providers: [ProductsService]
})
export class ProductsModule {}
```

### 2. Code Splitting by Feature

```typescript
// Budget in angular.json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",
    "maximumError": "1mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "6kb"
  }
]

// Analyze bundle
// npm run build -- --stats-json
// npx webpack-bundle-analyzer dist/stats.json
```

### 3. OnPush Change Detection per Feature

```typescript
// All feature components use OnPush
@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class ProductListComponent {
  // Use signals for reactive data
  products = signal<Product[]>([]);
}
```

---

## 🧪 Testing Modular Architecture

### Unit Tests

```typescript
// features/products/services/products.service.spec.ts
describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load products', () => {
    const mockProducts = [{ id: '1', name: 'Product 1' }];

    service.loadProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne('/api/products');
    req.flush(mockProducts);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### Integration Tests

```typescript
// features/products/products.integration.spec.ts
describe('Products Feature Integration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();
  });

  it('should display products', () => {
    const fixture = TestBed.createComponent(ProductListComponent);
    const httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const req = httpMock.expectOne('/api/products');
    req.flush([
      { id: '1', name: 'Product 1' },
      { id: '2', name: 'Product 2' }
    ]);

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('.product-card').length).toBe(2);
  });
});
```

---

## ⚠️ Anti-patterns

### 1. Circular Dependencies

```typescript
// ❌ BAD
// feature-a.service.ts
import { FeatureBService } from './feature-b.service';

// feature-b.service.ts
import { FeatureAService } from './feature-a.service';

// ✅ GOOD: Extract common logic to shared service
// shared/common.service.ts
@Injectable({ providedIn: 'root' })
export class CommonService {}
```

### 2. God Module

```typescript
// ❌ BAD: Module with everything
@NgModule({
  declarations: [
    Component1, Component2, ... Component50
  ],
  providers: [
    Service1, Service2, ... Service30
  ]
})
export class GodModule {}

// ✅ GOOD: Split into feature modules
```

### 3. Cross-Feature Dependencies

```typescript
// ❌ BAD
// features/products/product.service.ts
import { UsersService } from '../users/users.service';

// ✅ GOOD: Extract to core
// core/data/data.service.ts
@Injectable({ providedIn: 'root' })
export class DataService {}
```

---

## ✅ Checklist

### Structure
- [ ] Core module para singleton services
- [ ] Shared module para componentes reutilizables
- [ ] Feature modules agrupados por funcionalidad
- [ ] Layout module para estructura de página
- [ ] Path aliases configurados en tsconfig.json

### Lazy Loading
- [ ] Feature routes con loadChildren/loadComponent
- [ ] Preloading strategy configurada
- [ ] Bundle size monitoreado
- [ ] Code splitting por feature

### Dependencies
- [ ] Core NO depende de Features
- [ ] Shared NO depende de Features
- [ ] Features NO dependen entre sí
- [ ] Barrel exports para public API

### Performance
- [ ] Provideable in 'root' para tree-shaking
- [ ] OnPush change detection
- [ ] Lazy loading de modals/dialogs
- [ ] Bundle budget configurado

### Testing
- [ ] Unit tests para servicios
- [ ] Integration tests para features
- [ ] E2E tests para flujos críticos

---

## 🎓 Conclusión

Modular design en Angular permite:
- **Scalability**: Agregar features sin afectar existentes
- **Maintainability**: Código organizado y localizado
- **Performance**: Lazy loading y tree-shaking
- **Team Collaboration**: Equipos trabajan en features independientes
- **Reusability**: Shared components reutilizables

**Principio clave**: "Divide y vencerás" - estructura tu app en módulos cohesivos y loosely coupled.

---

## 📚 Recursos

- Angular Architecture: https://angular.dev/guide/architecture
- Lazy Loading: https://angular.dev/guide/lazy-loading-ngmodules
- Standalone Components: https://angular.dev/guide/standalone-components
- NgRx Signals: https://ngrx.io/guide/signals
