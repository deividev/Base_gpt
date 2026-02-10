# Angular Pipes

## 📋 Información

- **Skill ID**: `angular/pipes`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Alta
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar el uso y creación de pipes en Angular para transformar datos en templates de forma declarativa y eficiente.

---

## 📊 Tipos de Pipes

```
┌──────────────────────────────────────────────────────┐
│  1. BUILT-IN PIPES                                   │
│     date, currency, uppercase, json, etc.            │
├──────────────────────────────────────────────────────┤
│  2. PURE PIPES (default)                             │
│     Se ejecutan solo cuando cambian inputs           │
│     Mejor performance                                │
├──────────────────────────────────────────────────────┤
│  3. IMPURE PIPES                                     │
│     Se ejecutan en cada ciclo de detección           │
│     Usar con precaución                              │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 Built-in Pipes

### Pipes Comunes

```typescript
@Component({
  selector: "app-demo",
  template: `
    <h2>String Pipes</h2>
    <p>{{ text | uppercase }}</p>
    <p>{{ text | lowercase }}</p>
    <p>{{ text | titlecase }}</p>

    <h2>Number Pipes</h2>
    <p>{{ price | currency }}</p>
    <p>{{ price | currency: "EUR" : "symbol" : "1.2-2" }}</p>
    <p>{{ percent | percent }}</p>
    <p>{{ percent | percent: "1.2-2" }}</p>
    <p>{{ number | number: "1.3-5" }}</p>

    <h2>Date Pipes</h2>
    <p>{{ today | date }}</p>
    <p>{{ today | date: "short" }}</p>
    <p>{{ today | date: "dd/MM/yyyy" }}</p>
    <p>{{ today | date: "fullDate" }}</p>

    <h2>Other Pipes</h2>
    <p>{{ data | json }}</p>
    <p>{{ items | slice: 1 : 3 }}</p>
    <p>{{ asyncData | async }}</p>
  `,
})
export class DemoComponent {
  text = "hello world";
  price = 1234.56;
  percent = 0.259;
  number = 1234.56789;
  today = new Date();
  data = { name: "John", age: 30 };
  items = [1, 2, 3, 4, 5];
  asyncData = of("Hello from Observable");
}
```

### Async Pipe (Fundamental)

```typescript
import { Component } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { Observable, interval, map } from "rxjs";

@Component({
  selector: "app-async-demo",
  imports: [AsyncPipe],
  template: `
    <h2>Async Pipe Demo</h2>

    <!-- Se suscribe y desuscribe automáticamente -->
    <p>Time: {{ time$ | async }}</p>

    <!-- Con observables de HTTP -->
    @if (user$ | async; as user) {
      <div class="user">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
      </div>
    } @else {
      <p>Loading user...</p>
    }

    <!-- Con múltiples referencias -->
    @let currentUser = user$ | async;
    @if (currentUser) {
      <p>Name: {{ currentUser.name }}</p>
      <p>Email: {{ currentUser.email }}</p>
    }
  `,
})
export class AsyncDemoComponent {
  time$ = interval(1000).pipe(map(() => new Date()));

  user$ = this.userService.getCurrentUser();

  constructor(private userService: UserService) {}
}
```

---

## 🎨 Custom Pure Pipes

### Pipe Simple

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'exponential',
  standalone: true,
})
export class ExponentialPipe implements PipeTransform {
  transform(value: number, exponent: number = 1): number {
    return Math.pow(value, exponent);
  }
}

// Uso
{{ 2 | exponential:3 }}  // 8
{{ 5 | exponential }}     // 5
```

### Pipe de Filtrado

```typescript
import { Pipe, PipeTransform } from '@angular/core';

interface Item {
  id: number;
  name: string;
  active: boolean;
}

@Pipe({
  name: 'filter',
  standalone: true,
})
export class FilterPipe implements PipeTransform {
  transform(items: Item[], searchText: string): Item[] {
    if (!items || !searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item =>
      item.name.toLowerCase().includes(searchText)
    );
  }
}

// Uso
<div class="search">
  <input [(ngModel)]="searchText" placeholder="Search...">

  @for (item of items | filter:searchText; track item.id) {
    <div>{{ item.name }}</div>
  }
}
```

### Pipe de Ordenamiento

```typescript
import { Pipe, PipeTransform } from "@angular/core";

type SortOrder = "asc" | "desc";

@Pipe({
  name: "sort",
  standalone: true,
})
export class SortPipe implements PipeTransform {
  transform<T>(array: T[], field: keyof T, order: SortOrder = "asc"): T[] {
    if (!array || !field) {
      return array;
    }

    return [...array].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue < bValue) {
        return order === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }
}

// Uso en componente
@Component({
  selector: "app-users",
  imports: [SortPipe],
  template: `
    <button (click)="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">
      Toggle Sort
    </button>

    @for (user of users | sort: "name" : sortOrder; track user.id) {
      <div>{{ user.name }} - {{ user.age }}</div>
    }
  `,
})
export class UsersComponent {
  sortOrder: SortOrder = "asc";
  users = [
    { id: 1, name: "John", age: 30 },
    { id: 2, name: "Alice", age: 25 },
    { id: 3, name: "Bob", age: 35 },
  ];
}
```

### Pipe de Timeago

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);

      if (interval >= 1) {
        return interval === 1
          ? `1 ${name} ago`
          : `${interval} ${name}s ago`;
      }
    }

    return 'just now';
  }
}

// Uso
<p>Posted {{ post.createdAt | timeAgo }}</p>
// Output: "2 hours ago", "5 minutes ago", etc.
```

### Pipe de Truncate

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string,
    limit: number = 50,
    completeWords: boolean = false,
    ellipsis: string = '...'
  ): string {
    if (!value || value.length <= limit) {
      return value;
    }

    if (completeWords) {
      limit = value.substring(0, limit).lastIndexOf(' ');
    }

    return value.substring(0, limit) + ellipsis;
  }
}

// Uso
<p>{{ longText | truncate:100:true }}</p>
<p>{{ description | truncate:50:false:'...' }}</p>
```

### Pipe de Safe HTML

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
  }
}

// Uso
<div [innerHTML]="htmlContent | safeHtml"></div>
```

### Pipe de Highlight

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!search || !value) {
      return value;
    }

    const regex = new RegExp(search, 'gi');
    const highlighted = value.replace(
      regex,
      match => `<mark>${match}</mark>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}

// Uso
<p [innerHTML]="text | highlight:searchTerm"></p>
```

---

## 🔄 Impure Pipes

### Impure Pipe (Usar con precaución)

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'impureFilter',
  standalone: true,
  pure: false,  // Se ejecuta en cada change detection
})
export class ImpureFilterPipe implements PipeTransform {
  transform(items: any[], filterFn: (item: any) => boolean): any[] {
    if (!items || !filterFn) {
      return items;
    }
    return items.filter(filterFn);
  }
}

// Uso
<div *ngFor="let item of items | impureFilter:myFilterFunction">
  {{ item.name }}
</div>
```

### ⚠️ Problema de Performance

```typescript
// ❌ MAL: Impure pipe con lógica compleja
@Pipe({
  name: 'expensiveFilter',
  pure: false,  // Se ejecutará constantemente
})
export class ExpensiveFilterPipe implements PipeTransform {
  transform(items: any[]): any[] {
    console.log('ExpensiveFilterPipe ejecutado'); // Se verá muchas veces
    // Operación costosa
    return items.filter(item => /* lógica compleja */);
  }
}

// ✅ BIEN: Pure pipe con inputs inmutables
@Pipe({
  name: 'efficientFilter',
  pure: true,  // Solo se ejecuta cuando cambian los inputs
})
export class EfficientFilterPipe implements PipeTransform {
  transform(items: any[], criteria: string): any[] {
    console.log('EfficientFilterPipe ejecutado'); // Solo cuando cambia items o criteria
    return items.filter(item => item.name.includes(criteria));
  }
}

// En componente: crear nuevo array para disparar el pipe
addItem(item: any) {
  this.items = [...this.items, item];  // Nuevo array reference
}
```

---

## 🎯 Pipes Avanzados

### Pipe con Memoization

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memoize',
  standalone: true,
})
export class MemoizePipe implements PipeTransform {
  private cache = new Map<string, any>();

  transform(value: any, fn: (val: any) => any): any {
    const key = JSON.stringify(value);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = fn(value);
    this.cache.set(key, result);
    return result;
  }
}

// Uso
<div>{{ data | memoize:expensiveOperation }}</div>
```

### Pipe de Formato de Bytes

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Uso
<p>File size: {{ file.size | fileSize }}</p>
// Output: "1.5 MB", "256 KB", etc.
```

### Pipe de Pluralización

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluralize',
  standalone: true,
})
export class PluralizePipe implements PipeTransform {
  transform(
    count: number,
    singular: string,
    plural?: string
  ): string {
    const pluralForm = plural || `${singular}s`;
    return count === 1 ? singular : pluralForm;
  }
}

// Uso
<p>{{ count }} {{ count | pluralize:'item' }}</p>
// Output: "1 item" or "5 items"

<p>{{ count }} {{ count | pluralize:'person':'people' }}</p>
// Output: "1 person" or "5 people"
```

### Pipe de Callback

```typescript
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "callback",
  standalone: true,
})
export class CallbackPipe implements PipeTransform {
  transform<T, R>(items: T[], callback: (item: T) => R): R[] {
    if (!items || !callback) {
      return [];
    }
    return items.map(callback);
  }
}

// Uso en componente
@Component({
  selector: "app-demo",
  imports: [CallbackPipe],
  template: `
    @for (name of users | callback: getUserName; track $index) {
      <p>{{ name }}</p>
    }
  `,
})
export class DemoComponent {
  users = [
    { firstName: "John", lastName: "Doe" },
    { firstName: "Jane", lastName: "Smith" },
  ];

  getUserName = (user: any) => `${user.firstName} ${user.lastName}`;
}
```

---

## 🔗 Composición de Pipes

### Encadenar Pipes

```typescript
@Component({
  template: `
    <!-- Pipes encadenados -->
    <p>{{ text | lowercase | titlecase }}</p>

    <!-- Múltiples transformaciones -->
    <p>{{ price | currency:'USD' | uppercase }}</p>

    <!-- Con arrays -->
    @for (item of items | filter:search | sort:'name':'asc' | slice:0:5; track item.id) {
      <div>{{ item.name }}</div>
    }

    <!-- Con async pipe al final -->
    <p>{{ data$ | async | json }}</p>
  `,
})
export class ChainedPipesComponent {
  text = 'HELLO world';
  price = 42.50;
  items = [...];
  search = 'term';
  data$ = this.service.getData();
}
```

---

## ⚠️ Anti-Patterns

### ❌ MAL: Funciones en templates

```typescript
// NO HACER ESTO
@Component({
  template: `
    @for (item of getFilteredItems(); track item.id) {
      <div>{{ item.name }}</div>
    }
  `,
})
export class BadComponent {
  // Se ejecuta en cada change detection
  getFilteredItems() {
    console.log("Called every time!");
    return this.items.filter((item) => item.active);
  }
}
```

### ✅ BIEN: Usar pipe

```typescript
// HACER ESTO
@Component({
  imports: [FilterPipe],
  template: `
    @for (item of items | filter:criteria; track item.id) {
      <div>{{ item.name }}</div>
    }
  `,
})
export class GoodComponent {
  items = [...];
  criteria = 'active';
}
```

### ❌ MAL: Impure pipe sin necesidad

```typescript
// NO HACER ESTO
@Pipe({
  name: "unnecessary",
  pure: false, // Innecesario si inputs son inmutables
})
export class UnnecessaryPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

### ✅ BIEN: Pure pipe por defecto

```typescript
// HACER ESTO
@Pipe({
  name: "efficient",
  // pure: true es el default
})
export class EfficientPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

---

## 📋 Checklist

### Development

- [ ] Usar `standalone: true` para pipes
- [ ] Mantener pipes pure por defecto
- [ ] Implementar solo el método `transform`
- [ ] Manejar valores null/undefined
- [ ] Proporcionar valores por defecto
- [ ] Documentar parámetros y uso

### Performance

- [ ] Evitar lógica compleja en impure pipes
- [ ] Usar memoization para operaciones costosas
- [ ] No modificar inputs (mantener inmutabilidad)
- [ ] Considerar async pipe para observables
- [ ] Evitar funciones en templates

### Testing

- [ ] Crear tests para cada pipe
- [ ] Probar con diferentes inputs
- [ ] Probar casos edge (null, undefined, empty)
- [ ] Verificar transformaciones correctas

### Best Practices

- [ ] Nombre descriptivo en camelCase
- [ ] Un pipe, una responsabilidad
- [ ] Reutilizar pipes existentes cuando sea posible
- [ ] Preferir pure pipes sobre impure
- [ ] Documentar side effects si existen

---

## 🔗 Skills Relacionadas

- `angular/component-creation` - Usar pipes en templates
- `angular/rxjs` - Async pipe con observables
- `angular/performance` - Optimización de pipes
- `typescript/advanced` - Tipos genéricos en pipes

---

## 📚 Referencias

- [Angular Pipes](https://angular.dev/guide/pipes)
- [Custom Pipes](https://angular.dev/guide/pipes/custom-pipes)
- [Async Pipe](https://angular.dev/api/common/AsyncPipe)
- [Pure vs Impure Pipes](https://angular.dev/guide/pipes/change-detection)
