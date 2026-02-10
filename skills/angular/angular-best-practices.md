# Angular 21 Best Practices

## 📋 Información

- **Skill ID**: `angular/angular-best-practices`
- **Versión**: 1.0.0 (Adaptado de Boise State University)
- **Categoría**: Angular
- **Prioridad**: Alta
- **Angular Version**: 21+

## 🎯 Objetivo

Aplicar las mejores prácticas modernas de Angular 21 incluyendo signals, standalone components, patrones reactivos, y accesibilidad.

---

## 📝 TypeScript

### ✅ Reglas

- **Usar strict type checking** habilitado en `tsconfig.json`
- **Preferir type inference** cuando el tipo es obvio
- **Evitar `any`** - usar `unknown` cuando el tipo es incierto
- **Usar utility types** nativos de TypeScript cuando sea apropiado

```typescript
// ✅ CORRECTO - Type inference
const userName = "John Doe"; // TypeScript infiere string

// ✅ CORRECTO - Unknown para tipos inciertos
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// ❌ INCORRECTO - Usar any
function parseJSON(json: string): any {
  return JSON.parse(json);
}
```

---

## 🎨 Components

### ✅ Reglas Fundamentales

1. **Siempre usar standalone components**
   - **NO** establecer `standalone: true` — es el default en v20+
2. **Usar `ChangeDetectionStrategy.OnPush`** siempre
3. **Usar funciones `input()` y `output()`** en lugar de decoradores
4. **Usar `computed()` para estado derivado**
5. **Mantener componentes pequeños** con responsabilidad única
6. **Preferir inline templates** para componentes pequeños
7. **Usar Reactive forms** sobre Template-driven
8. **Usar `class` bindings** en lugar de `ngClass`
9. **Usar `style` bindings** en lugar de `ngStyle`
10. **Para templates/styles externos**, usar rutas relativas al archivo TS
11. **NO usar `@HostBinding`/`@HostListener`** — usar el objeto `host` en el decorator

```typescript
// ✅ CORRECTO - Componente moderno Angular 21
@Component({
  selector: "app-user-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    "[class.active]": "isActive()",
    "(click)": "handleClick()",
  },
  template: `
    <div [class.highlighted]="isHighlighted()">
      <h3>{{ userName() }}</h3>
      <p [style.color]="textColor()">{{ description() }}</p>
    </div>
  `,
})
export class UserCardComponent {
  // Inputs usando signals
  userName = input.required<string>();
  description = input<string>("");

  // Outputs
  userClicked = output<string>();

  // Estado local
  isActive = signal(false);
  isHighlighted = signal(false);

  // Computed
  textColor = computed(() => (this.isActive() ? "#007bff" : "#6c757d"));

  handleClick() {
    this.userClicked.emit(this.userName());
  }
}
```

```typescript
// ❌ INCORRECTO - Prácticas antiguas
@Component({
  selector: "app-user-card",
  standalone: true, // Innecesario en v21 (es default)
  // No hay changeDetection especificada (usa Default)
})
export class UserCardComponent {
  @Input() userName?: string; // Vieja API
  @Output() userClicked = new EventEmitter<string>(); // Vieja API
  @HostListener("click") onClick() {} // Usar host object en su lugar
}
```

---

## 🔄 State Management with Signals

### ✅ Reglas

1. **Usar signals para estado local** del componente
2. **Usar `computed()` para estado derivado**
3. **Mantener transformaciones de estado puras** y predecibles
4. **NO usar `mutate` en signals** — usar `update` o `set` en su lugar

```typescript
// ✅ CORRECTO
export class ProductListComponent {
  // Estado base
  products = signal<Product[]>([]);
  filter = signal<string>("");

  // Estado derivado
  filteredProducts = computed(() => {
    const query = this.filter().toLowerCase();
    return this.products().filter((p) => p.name.toLowerCase().includes(query));
  });

  productsCount = computed(() => this.filteredProducts().length);

  // Actualización de estado
  addProduct(product: Product) {
    this.products.update((products) => [...products, product]);
  }

  clearFilter() {
    this.filter.set("");
  }
}
```

```typescript
// ❌ INCORRECTO - Usar mutate
addProduct(product: Product) {
  this.products.mutate(products => products.push(product));
}
```

**Para patrones complejos de estado derivado**, ver: [signal-patterns.md](signal-patterns.md)

---

## 🌐 Resources (Async Data)

Usar `resource()` para fetching de datos asíncronos con signals:

```typescript
export class UserProfileComponent {
  userId = input.required<number>();

  // Resource para cargar datos del usuario
  userResource = resource({
    params: () => ({ id: this.userId() }),
    loader: ({ params, abortSignal }) =>
      fetch(`/api/users/${params.id}`, { signal: abortSignal }).then((r) =>
        r.json(),
      ),
  });

  // Estado derivado del resource
  userName = computed(() =>
    this.userResource.hasValue() ? this.userResource.value().name : undefined,
  );

  isLoading = computed(() => this.userResource.status() === "loading");
}
```

### 🔑 Key Resource Patterns

1. **`params` returns `undefined`** → loader no se ejecuta, status se vuelve `'idle'`
2. **Usar `abortSignal`** para cancelar requests en curso
3. **Verificar `hasValue()`** antes de acceder a `value()` para manejar estados loading/error
4. **Status values**: `'idle'`, `'loading'`, `'reloading'`, `'resolved'`, `'error'`, `'local'`

---

## 📄 Templates

### ✅ Reglas

1. **Usar native control flow**: `@if`, `@for`, `@switch` (**NO** `*ngIf`, `*ngFor`, `*ngSwitch`)
2. **Usar async pipe** para observables
3. **Mantener templates simples** — sin lógica compleja
4. **NO usar arrow functions** en templates (no soportado)
5. **NO asumir que globals** como `new Date()` están disponibles

```typescript
// ✅ CORRECTO - Nueva sintaxis de control flow
@Component({
  template: `
    @if (isLoading()) {
      <app-loading-spinner />
    } @else if (hasError()) {
      <app-error-message [error]="errorMessage()" />
    } @else {
      <div class="content">
        @for (item of items(); track item.id) {
          <app-item-card [item]="item" />
        }

        @if (items().length === 0) {
          <p>No items found</p>
        }
      </div>
    }

    @switch (status()) {
      @case ("pending") {
        <span class="badge-warning">Pending</span>
      }
      @case ("approved") {
        <span class="badge-success">Approved</span>
      }
      @default {
        <span class="badge-secondary">Unknown</span>
      }
    }
  `,
})
export class ExampleComponent {
  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal("");
  items = signal<Item[]>([]);
  status = signal<string>("pending");
}
```

```typescript
// ❌ INCORRECTO - Sintaxis antigua
@Component({
  template: `
    <div *ngIf="isLoading">Loading...</div>
    <div *ngFor="let item of items">{{ item.name }}</div>

    <!-- ❌ INCORRECTO - Arrow function en template -->
    <div *ngFor="let item of items.filter(i => i.active)">

    <!-- ❌ INCORRECTO - Usar new Date() en template -->
    <p>{{ new Date() | date }}</p>
  `,
})
```

---

## 🛠️ Services

### ✅ Reglas

1. **Responsabilidad única por servicio**
2. **Usar `providedIn: 'root'`** para singletons
3. **Usar función `inject()`** en lugar de constructor injection

```typescript
// ✅ CORRECTO - Servicio moderno
@Injectable({ providedIn: "root" })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private usersSignal = signal<User[]>([]);
  readonly users = this.usersSignal.asReadonly();

  loadUsers(): void {
    this.http.get<User[]>("/api/users").subscribe({
      next: (users) => this.usersSignal.set(users),
      error: (err) => console.error("Error loading users:", err),
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

```typescript
// ❌ INCORRECTO - Constructor injection antigua
export class UserService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
}
```

---

## 🗺️ Routing

### ✅ Implementar Lazy Loading

```typescript
// ✅ CORRECTO - Lazy loading de componentes
export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home/home.page").then((m) => m.HomePage),
  },
  {
    path: "admin",
    loadComponent: () => import("./admin/admin.page").then((m) => m.AdminPage),
  },
  {
    path: "profile/:id",
    loadComponent: () =>
      import("./profile/profile.page").then((m) => m.ProfilePage),
  },
];
```

---

## 📁 File Naming Convention

### ✅ Convenciones

- **Routable view components**: `file-name.page.ts`, `file-name.page.html`, `file-name.page.css`
- **Regular components**: `file-name.component.ts`, `file-name.component.html`, `file-name.component.scss`
- **Services**: `file-name.service.ts`
- **Guards**: `file-name.guard.ts`
- **Interceptors**: `file-name.interceptor.ts`
- **Pipes**: `file-name.pipe.ts`
- **Directives**: `file-name.directive.ts`

```
feature/
├── components/
│   └── user-card/
│       ├── user-card.component.ts
│       ├── user-card.component.html
│       └── user-card.component.scss
├── pages/
│   └── user-list/
│       ├── user-list.page.ts
│       ├── user-list.page.html
│       └── user-list.page.scss
└── services/
    └── user.service.ts
```

---

## 🎨 Icons (ng-icon)

```typescript
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroSparkles, heroTrash } from "@ng-icons/heroicons/outline";

@Component({
  selector: "app-example",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ heroSparkles, heroTrash })],
  template: `
    <ng-icon name="heroSparkles" />
    <button>
      <ng-icon name="heroTrash" />
      Delete
    </button>
  `,
})
export class ExampleComponent {}
```

---

## 🖼️ Images

### ✅ Reglas

1. **Usar `NgOptimizedImage`** para todas las imágenes estáticas
2. **`NgOptimizedImage` NO funciona** para imágenes base64 inline

```typescript
import { NgOptimizedImage } from "@angular/common";

@Component({
  imports: [NgOptimizedImage],
  template: `
    <img
      ngSrc="/assets/hero.jpg"
      alt="Hero image"
      width="800"
      height="600"
      priority
    />
  `,
})
export class HeroComponent {}
```

---

## 🎨 Styling

### ✅ Reglas

1. **Usar Tailwind CSS 4.1** para estilos (ver skill de Tailwind si está disponible)
2. **Angular CDK disponible** cuando se necesite
3. **CSS Modules** para estilos específicos del componente

---

## ♿ Accessibility

### ✅ Requisitos

1. **DEBE pasar todos los checks de AXE**
2. **DEBE cumplir con WCAG AA mínimos**:
   - Focus management adecuado
   - Contraste de color suficiente
   - Atributos ARIA apropiados
   - Labels en formularios
   - Navegación por teclado

```typescript
// ✅ CORRECTO - Accesibilidad aplicada
@Component({
  template: `
    <button
      type="button"
      [attr.aria-label]="'Delete ' + itemName()"
      [attr.aria-pressed]="isSelected()"
      (click)="onDelete()"
    >
      <ng-icon name="heroTrash" aria-hidden="true" />
      <span class="sr-only">Delete {{ itemName() }}</span>
    </button>

    <form [formGroup]="form">
      <label for="email">Email Address</label>
      <input
        id="email"
        type="email"
        formControlName="email"
        [attr.aria-invalid]="form.get('email')?.invalid"
        [attr.aria-describedby]="
          form.get('email')?.invalid ? 'email-error' : null
        "
      />
      @if (form.get("email")?.invalid) {
        <span id="email-error" role="alert"> Please enter a valid email </span>
      }
    </form>
  `,
})
export class AccessibleComponent {}
```

---

## 📋 Checklist Completo

- [ ] Componente es standalone (default, no especificar)
- [ ] Usa `ChangeDetectionStrategy.OnPush`
- [ ] Inputs/Outputs usan `input()` y `output()`
- [ ] Estado local usa signals
- [ ] Estado derivado usa `computed()`
- [ ] Template usa `@if`, `@for`, `@switch`
- [ ] Sin arrow functions en templates
- [ ] Servicios usan `inject()` en lugar de constructor
- [ ] Routing usa lazy loading
- [ ] Nombres de archivos siguen convención
- [ ] Imágenes usan `NgOptimizedImage`
- [ ] Estilos usan Tailwind CSS
- [ ] Pasa todos los checks de accesibilidad
- [ ] TypeScript strict habilitado
- [ ] Sin uso de `any`
- [ ] Resources para datos async

---

## 🔗 Skills Relacionadas

- `angular/signal-patterns` - Patrones avanzados con signals
- `angular/component-creation` - Creación de componentes
- `angular/services` - Servicios e inyección
- `angular/state-management` - Gestión de estado
- `angular/forms` - Formularios reactivos
- `core/typescript-advanced` - TypeScript avanzado

---

## 📚 Referencias

- [Angular Official Docs](https://angular.dev)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular Best Practices](https://angular.dev/best-practices)
- Original skill by: Boise State University

---

## 📝 Fuente

Esta skill ha sido adaptada del proyecto open-source de Boise State University:

- **Repositorio**: [agentcore-public-stack](https://github.com/Boise-State-Development/agentcore-public-stack)
- **Licencia**: MIT
- **Créditos**: Boise State Development Team
