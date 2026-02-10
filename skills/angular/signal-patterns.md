# Signal Patterns - Patrones Avanzados

## 📋 Información

- **Skill ID**: `angular/signal-patterns`
- **Versión**: 1.0.0 (Adaptado de Boise State University)
- **Categoría**: Angular
- **Prioridad**: Media
- **Angular Version**: 17+

## 🎯 Objetivo

Dominar patrones avanzados de signals para crear código reactivo, mantenible y eficiente en Angular.

---

## 🏗️ Patrón 1: Layered Derivation (Derivación por Capas)

Este patrón demuestra cómo construir un grafo de dependencias de computed signals donde cada capa deriva de la anterior.

### 📊 Ejemplo: Dashboard de Costos

```typescript
@Component({
  selector: "app-cost-dashboard",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stats-grid">
      @if (isLoading()) {
        <app-loading-spinner />
      } @else {
        <app-stat-card label="Total Cost" [value]="totalCost() | currency" />
        <app-stat-card
          label="Avg Cost/Request"
          [value]="averageCostPerRequest() | currency"
        />
        <app-stat-card
          label="Cache Savings"
          [value]="cacheSavingsPercentage() | percent"
        />
      }
    </div>
  `,
})
export class CostDashboardComponent {
  // ════════════════════════════════════════════════════════════
  // Layer 1: Source signals (Signals de origen)
  // ════════════════════════════════════════════════════════════
  readonly selectedPeriodType = signal<"current" | "custom">("current");

  readonly costSummary = resource({
    loader: () => fetch("/api/cost-summary").then((r) => r.json()),
  });

  readonly customReportData = signal<CostData | null>(null);

  // ════════════════════════════════════════════════════════════
  // Layer 2: Data source switching (Cambio de fuente de datos)
  // ════════════════════════════════════════════════════════════
  // Maneja elegantemente el cambio entre fuentes de datos
  // basado en la selección del usuario
  readonly activeData = computed(() => {
    const periodType = this.selectedPeriodType();
    if (periodType === "current") {
      return this.costSummary.value();
    } else {
      return this.customReportData();
    }
  });

  // ════════════════════════════════════════════════════════════
  // Layer 3: Direct derivations from active data
  // ════════════════════════════════════════════════════════════
  // Manejo seguro de null con nullish coalescing
  readonly totalCost = computed(() => this.activeData()?.totalCost ?? 0);

  readonly totalRequests = computed(
    () => this.activeData()?.totalRequests ?? 0,
  );

  readonly totalInputTokens = computed(
    () => this.activeData()?.totalInputTokens ?? 0,
  );

  readonly totalOutputTokens = computed(
    () => this.activeData()?.totalOutputTokens ?? 0,
  );

  readonly totalCacheSavings = computed(
    () => this.activeData()?.cacheSavings ?? 0,
  );

  // ════════════════════════════════════════════════════════════
  // Layer 4: Business logic computed from Layer 3
  // ════════════════════════════════════════════════════════════
  // Los cálculos encapsulados en computed signals
  // mantienen los templates simples
  readonly averageCostPerRequest = computed(() => {
    const total = this.totalCost();
    const requests = this.totalRequests();
    return requests > 0 ? total / requests : 0;
  });

  readonly totalTokens = computed(
    () => this.totalInputTokens() + this.totalOutputTokens(),
  );

  readonly cacheSavingsPercentage = computed(() => {
    const savings = this.totalCacheSavings();
    const cost = this.totalCost();
    const totalWithoutSavings = cost + savings;
    return totalWithoutSavings > 0 ? (savings / totalWithoutSavings) * 100 : 0;
  });

  readonly isLoading = computed(() => this.costSummary.status() === "loading");
}
```

### ✨ Por Qué Funciona Este Patrón

1. **Derivación por capas** — Cada capa construye sobre la anterior, creando un grafo de dependencias limpio
2. **Cambio de fuente de datos** — `activeData` abstrae la fuente, manteniendo los signals downstream agnósticos
3. **Manejo seguro de null** — Nullish coalescing (`?? 0`) proporciona valores por defecto sensatos
4. **Aislamiento de lógica de negocio** — Los cálculos viven en computed signals, no en templates
5. **Memoización automática** — Angular solo recalcula cuando las dependencias cambian

---

## 📝 Patrón 2: Form State with Signals

Combinar reactive forms con signals para gestionar el estado del formulario.

```typescript
@Component({
  selector: "app-user-form",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          [class.invalid]="
            form.get('email')?.invalid && form.get('email')?.touched
          "
        />
      </div>

      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" type="text" formControlName="name" />
      </div>

      @if (submitError()) {
        <div class="error-message" role="alert">
          {{ submitError() }}
        </div>
      }

      <button type="submit" [disabled]="!canSubmit()">
        @if (isSubmitting()) {
          <span>Submitting...</span>
        } @else {
          <span>Submit</span>
        }
      </button>
    </form>
  `,
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    name: ["", Validators.required],
  });

  // Derivar estado de submission
  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly canSubmit = computed(() => this.form.valid && !this.isSubmitting());

  async onSubmit() {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      await this.userService.save(this.form.getRawValue());
      this.form.reset();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : "Unknown error");
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

---

## 👨‍👦 Patrón 3: Parent-Child Communication

Comunicación reactiva entre componentes padre e hijo usando signals.

### Child Component

```typescript
@Component({
  selector: "app-counter",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="counter">
      <button (click)="decrement()">-</button>
      <span class="count">{{ value() }}</span>
      <button (click)="increment()">+</button>
    </div>
  `,
  styles: [
    `
      .counter {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .count {
        font-size: 1.5rem;
        font-weight: bold;
        min-width: 3rem;
        text-align: center;
      }
    `,
  ],
})
export class CounterComponent {
  // Input signal - valor del contador
  readonly value = input.required<number>();

  // Output - emite cambios de valor
  readonly valueChange = output<number>();

  increment() {
    this.valueChange.emit(this.value() + 1);
  }

  decrement() {
    this.valueChange.emit(this.value() - 1);
  }
}
```

### Parent Component

```typescript
@Component({
  selector: "app-parent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CounterComponent],
  template: `
    <div class="container">
      <h2>Counter Demo</h2>

      <app-counter [value]="count()" (valueChange)="count.set($event)" />

      <div class="info">
        <p>Current value: {{ count() }}</p>
        <p>Double: {{ doubled() }}</p>
        <p>Is even: {{ isEven() ? "Yes" : "No" }}</p>
      </div>

      <button (click)="reset()">Reset</button>
    </div>
  `,
})
export class ParentComponent {
  // Estado en el padre
  readonly count = signal(0);

  // Estado derivado
  readonly doubled = computed(() => this.count() * 2);
  readonly isEven = computed(() => this.count() % 2 === 0);

  reset() {
    this.count.set(0);
  }
}
```

---

## 📋 Patrón 4: List with Derived Selection State

Gestión de selección en listas con estado derivado.

```typescript
interface Item {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: "app-item-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-container">
      <div class="list-header">
        <label>
          <input
            type="checkbox"
            [checked]="allSelected()"
            [indeterminate]="someSelected()"
            (change)="toggleAll()"
          />
          Select All ({{ selectedIds().size }} / {{ items().length }})
        </label>

        @if (selectedIds().size > 0) {
          <button (click)="deleteSelected()">Delete Selected</button>
        }
      </div>

      <div class="list-items">
        @for (item of items(); track item.id) {
          <div class="item">
            <label>
              <input
                type="checkbox"
                [checked]="selectedIds().has(item.id)"
                (change)="toggleItem(item.id)"
              />
              <div class="item-content">
                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </label>
          </div>
        }
      </div>

      @if (selectedItems().length > 0) {
        <div class="selection-summary">
          <h3>Selected Items:</h3>
          <ul>
            @for (item of selectedItems(); track item.id) {
              <li>{{ item.name }}</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class ItemListComponent {
  // Input: lista de items
  readonly items = input.required<Item[]>();

  // Estado: IDs seleccionados
  readonly selectedIds = signal<Set<string>>(new Set());

  // Estado derivado: items seleccionados
  readonly selectedItems = computed(() =>
    this.items().filter((item) => this.selectedIds().has(item.id)),
  );

  // Estado derivado: todos seleccionados
  readonly allSelected = computed(
    () =>
      this.items().length > 0 &&
      this.selectedIds().size === this.items().length,
  );

  // Estado derivado: algunos seleccionados (indeterminate state)
  readonly someSelected = computed(
    () => this.selectedIds().size > 0 && !this.allSelected(),
  );

  toggleItem(id: string) {
    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  toggleAll() {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.items().map((i) => i.id)));
    }
  }

  deleteSelected() {
    // Lógica para eliminar items seleccionados
    console.log("Deleting:", this.selectedItems());
    this.selectedIds.set(new Set());
  }
}
```

---

## 🎨 Patrón 5: Filter & Search with Debounce

Búsqueda y filtrado con debounce usando signals y effects.

```typescript
@Component({
  selector: "app-search-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-container">
      <input
        type="search"
        [value]="searchQuery()"
        (input)="searchQuery.set($any($event.target).value)"
        placeholder="Search items..."
      />

      @if (isSearching()) {
        <span class="searching">Searching...</span>
      }

      <div class="results">
        <p>Found {{ filteredItems().length }} items</p>

        @for (item of filteredItems(); track item.id) {
          <div class="item">{{ item.name }}</div>
        }
      </div>
    </div>
  `,
})
export class SearchListComponent implements OnInit {
  private readonly searchService = inject(SearchService);

  // Estado: query de búsqueda
  readonly searchQuery = signal("");

  // Estado: resultados
  readonly items = signal<Item[]>([]);
  readonly isSearching = signal(false);

  // Estado derivado: items filtrados
  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.items();

    return this.items().filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  });

  ngOnInit() {
    // Effect con debounce para búsqueda
    let timeoutId: any;
    effect(() => {
      const query = this.searchQuery();

      clearTimeout(timeoutId);

      if (!query.trim()) {
        this.items.set([]);
        return;
      }

      this.isSearching.set(true);

      timeoutId = setTimeout(async () => {
        try {
          const results = await this.searchService.search(query);
          this.items.set(results);
        } catch (error) {
          console.error("Search error:", error);
          this.items.set([]);
        } finally {
          this.isSearching.set(false);
        }
      }, 300); // 300ms debounce
    });
  }
}
```

---

## 💡 Mejores Prácticas

### ✅ DO's

1. **Usar capas de derivación** para organizar computed signals complejos
2. **Mantener computed signals puros** - sin side effects
3. **Usar `update()` para actualizaciones funcionales** de arrays y objetos
4. **Verificar `hasValue()`** antes de acceder a `value()` en resources
5. **Crear signals readonly** cuando sea apropiado con `asReadonly()`
6. **Usar `track` en @for** para optimizar rendering

### ❌ DON'Ts

1. **NO usar `mutate()`** - usar `update()` o `set()`
2. **NO crear side effects** dentro de computed signals
3. **NO hacer computations complejas** en el template
4. **NO olvidar trackBy** en listas grandes
5. **NO mutar objetos/arrays** directamente - crear nuevas instancias

---

## 📋 Checklist

- [ ] Signals organizados en capas lógicas
- [ ] Estado derivado usa `computed()`
- [ ] Manejo seguro de null/undefined
- [ ] Resources usan `hasValue()` antes de `value()`
- [ ] Listas usan `track` en @for
- [ ] Sin side effects en computed signals
- [ ] Actualizaciones usan `update()` o `set()`
- [ ] Effects son necesarios (no abusar)

---

## 🔗 Skills Relacionadas

- `angular/angular-best-practices` - Mejores prácticas generales
- `angular/component-creation` - Creación de componentes
- `angular/state-management` - Gestión de estado avanzada
- `angular/forms` - Formularios reactivos

---

## 📚 Referencias

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Computed Signals](https://angular.dev/guide/signals#computed-signals)
- [Effect API](https://angular.dev/guide/signals#effects)
- Original skill by: Boise State University

---

## 📝 Fuente

Esta skill ha sido adaptada del proyecto open-source de Boise State University:

- **Repositorio**: [agentcore-public-stack](https://github.com/Boise-State-Development/agentcore-public-stack)
- **Licencia**: MIT
- **Créditos**: Boise State Development Team
