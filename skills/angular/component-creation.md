# Angular Component Creation Skill

## 📋 Información

- **Skill ID**: `angular/component-creation`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Alta
- **Angular Version**: 18+

## 🎯 Objetivo

Crear componentes Angular optimizados, mantenibles y siguiendo las mejores prácticas actuales de Angular 21.

## ✅ Reglas Fundamentales

### 1. Usar Standalone Components por Defecto

```typescript
// ✅ CORRECTO - Standalone component
@Component({
  selector: "app-user-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./user-profile.component.html",
  styleUrl: "./user-profile.component.scss",
})
export class UserProfileComponent {}
```

### 2. Estructura de Archivos

```
feature/
├── components/
│   ├── user-profile/
│   │   ├── user-profile.component.ts
│   │   ├── user-profile.component.html
│   │   ├── user-profile.component.scss
│   │   └── user-profile.component.spec.ts
```

### 3. Nomenclatura

- **Selector**: Usar prefijo `app-` + nombre descriptivo en kebab-case
- **Clase**: PascalCase + sufijo `Component`
- **Archivo**: kebab-case + `.component.ts`

### 4. Signals para Estado Local

```typescript
// ✅ CORRECTO - Usar signals
export class UserProfileComponent {
  userName = signal("John Doe");
  isLoading = signal(false);
  userData = signal<User | null>(null);

  updateUser(name: string) {
    this.userName.set(name);
  }
}
```

### 5. Change Detection OnPush

```typescript
@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

## 📝 Template de Componente

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-example",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./example.component.html",
  styleUrl: "./example.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  // Inputs usando signals
  title = input<string>(""); // input signal
  userId = input.required<number>(); // required input

  // Outputs
  itemSelected = output<string>();

  // Estado local
  isActive = signal(false);
  items = signal<Item[]>([]);

  // Computed values
  itemCount = computed(() => this.items().length);

  // Lifecycle
  constructor() {
    // Inicialización
  }

  // Methods
  onItemClick(item: string): void {
    this.itemSelected.emit(item);
  }
}
```

## 🚫 Malas Prácticas a Evitar

### ❌ No usar NgModules innecesarios

```typescript
// ❌ INCORRECTO
@NgModule({
  declarations: [UserProfileComponent],
  imports: [CommonModule],
})
export class UserProfileModule {}
```

### ❌ No usar @Input/@Output tradicionales

```typescript
// ❌ INCORRECTO
@Input() title?: string;
@Output() clicked = new EventEmitter<void>();

// ✅ CORRECTO
title = input<string>('');
clicked = output<void>();
```

### ❌ Lógica de negocio en el componente

```typescript
// ❌ INCORRECTO - Lógica compleja en el componente
fetchUserData() {
  this.http.get('/api/users')
    .pipe(
      map(data => this.transformData(data)),
      catchError(err => this.handleError(err))
    )
    .subscribe(/* ... */);
}

// ✅ CORRECTO - Delegar a servicios
constructor(private userService: UserService) {}

ngOnInit() {
  this.userData = toSignal(this.userService.getUserData());
}
```

## ✨ Características Avanzadas

### 1. Control Flow Syntax (Angular 17+)

```html
<!-- ✅ CORRECTO - Nueva sintaxis -->
@if (isLoading()) {
<app-loading-spinner />
} @for (item of items(); track item.id) {
<app-item-card [item]="item" />
} @switch (status()) { @case ('active') {
<span class="badge-success">Active</span>
} @case ('inactive') {
<span class="badge-danger">Inactive</span>
} @default {
<span class="badge-secondary">Unknown</span>
} }
```

### 2. ViewChild con Signals

```typescript
// Nueva API de ViewChild
viewChild = viewChild<ElementRef>("myElement"); // signal-based
viewChildren = viewChildren(ItemComponent); // multiple elements
```

### 3. Effect para Side Effects

```typescript
constructor() {
  // Ejecutar side effects cuando cambie un signal
  effect(() => {
    console.log('User changed:', this.userName());
    // Analytics, logging, etc.
  });
}
```

## 📋 Checklist de Creación

- [ ] Componente es standalone
- [ ] Usa ChangeDetectionStrategy.OnPush
- [ ] Inputs/Outputs usan nueva API de signals
- [ ] Estado local usa signals
- [ ] Template usa nueva sintaxis de control flow (@if, @for)
- [ ] Sin lógica de negocio compleja
- [ ] Nombre y selector siguen convenciones
- [ ] Archivo de test creado
- [ ] Componente es pequeño (< 400 líneas)
- [ ] Responsabilidad única y clara

## 🔗 Skills Relacionadas

- `angular/services` - Para inyectar dependencias
- `angular/routing` - Para componentes que son rutas
- `angular/state-management` - Para estado compartido
- `testing/unit-testing` - Para crear tests del componente

## 📚 Referencias

- [Angular Component Guide](https://angular.dev/guide/components)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [Signals Guide](https://angular.dev/guide/signals)
