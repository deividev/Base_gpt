# RxJS in Angular

## 📋 Información

- **Skill ID**: `angular/rxjs`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Alta
- **Angular Version**: 18+
- **RxJS Version**: 7+

## 🎯 Objetivo

Dominar RxJS para programación reactiva en Angular, incluyendo operadores, subjects, manejo de errores y patrones de unsubscribe.

---

## 📊 Conceptos Fundamentales

```
┌──────────────────────────────────────────────────────┐
│  OBSERVABLE                                          │
│  Flujo de datos en el tiempo                        │
│  ────○────○────○────○────|                          │
├──────────────────────────────────────────────────────┤
│  OBSERVER                                            │
│  { next, error, complete }                           │
├──────────────────────────────────────────────────────┤
│  SUBSCRIPTION                                        │
│  Conexión activa - Debe limpiarse                   │
├──────────────────────────────────────────────────────┤
│  OPERATORS                                           │
│  Funciones que transforman observables              │
│  map, filter, switchMap, etc.                       │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Operadores Básicos

### Creation Operators

```typescript
import { of, from, interval, timer, fromEvent, ajax } from "rxjs";

// of - Emite valores en secuencia
const numbers$ = of(1, 2, 3, 4, 5);
numbers$.subscribe((val) => console.log(val));

// from - Convierte array/promise/iterable a observable
const array$ = from([1, 2, 3]);
const promise$ = from(fetch("/api/data"));

// interval - Emite números secuenciales cada X ms
const ticker$ = interval(1000); // 0, 1, 2, 3...

// timer - Emite después de delay, luego opcionalmente cada X ms
const delayed$ = timer(2000); // Emite después de 2s
const periodic$ = timer(1000, 2000); // Espera 1s, luego cada 2s

// fromEvent - Crea observable desde eventos DOM
const clicks$ = fromEvent(document, "click");
const input$ = fromEvent<InputEvent>(inputElement, "input");
```

### Transformation Operators

```typescript
import { map, pluck, mapTo, scan } from "rxjs/operators";

// map - Transforma cada valor
this.users$
  .pipe(map((users) => users.map((u) => u.name)))
  .subscribe((names) => console.log(names));

// map con tipos
interface User {
  id: number;
  name: string;
}
this.users$ = this.http
  .get<User[]>("/api/users")
  .pipe(map((users) => users.filter((u) => u.id > 10)));

// mapTo - Mapea todos los valores al mismo valor
clicks$.pipe(mapTo("clicked!")).subscribe(console.log);

// scan - Acumula valores (como reduce pero emite cada paso)
const runningTotal$ = numbers$.pipe(scan((acc, curr) => acc + curr, 0));
// Emite: 1, 3, 6, 10, 15
```

### Filtering Operators

```typescript
import {
  filter,
  take,
  takeUntil,
  takeWhile,
  first,
  last,
  skip,
} from "rxjs/operators";

// filter - Filtra valores por condición
numbers$.pipe(filter((n) => n % 2 === 0)).subscribe(console.log); // 2, 4

// take - Toma primeros N valores y completa
interval(1000).pipe(take(5)).subscribe(console.log); // 0, 1, 2, 3, 4

// takeUntil - Toma hasta que otro observable emita
const destroy$ = new Subject<void>();
interval(1000).pipe(takeUntil(destroy$)).subscribe(console.log);

// takeWhile - Toma mientras condición sea verdadera
numbers$.pipe(takeWhile((n) => n < 4)).subscribe(console.log); // 1, 2, 3

// first - Toma primer valor (o que cumpla condición)
numbers$.pipe(first()).subscribe(console.log); // 1

numbers$.pipe(first((n) => n > 3)).subscribe(console.log); // 4

// skip - Salta primeros N valores
numbers$.pipe(skip(2)).subscribe(console.log); // 3, 4, 5
```

---

## 🔄 Operadores de Combinación

### switchMap, mergeMap, concatMap

```typescript
import { switchMap, mergeMap, concatMap, exhaustMap } from "rxjs/operators";

// switchMap - Cancela request anterior (para búsquedas)
searchInput$
  .pipe(
    debounceTime(300),
    switchMap((term) => this.http.get(`/api/search?q=${term}`)),
  )
  .subscribe((results) => console.log(results));

// mergeMap (flatMap) - Mantiene todas las subscriptions activas
// Útil para operaciones independientes
userIds$
  .pipe(mergeMap((id) => this.http.get(`/api/users/${id}`)))
  .subscribe((user) => console.log(user));

// concatMap - Espera a que complete anterior antes de hacer siguiente
// Útil para operaciones secuenciales
userIds$
  .pipe(concatMap((id) => this.http.post("/api/log", { userId: id })))
  .subscribe();

// exhaustMap - Ignora nuevos valores hasta que complete el actual
// Útil para prevenir clicks múltiples
saveButton$
  .pipe(exhaustMap(() => this.http.post("/api/save", data)))
  .subscribe();

// Comparación visual:
// switchMap:  ──1───2───3──  →  ──A───B───C──  (cancela anteriores)
// mergeMap:   ──1───2───3──  →  ──A─B─C─A─B──  (mantiene todos)
// concatMap:  ──1───2───3──  →  ──A────B────C  (secuencial)
// exhaustMap: ──1───2───3──  →  ──A────────C   (ignora si ocupado)
```

### combineLatest, forkJoin, merge

```typescript
import { combineLatest, forkJoin, merge, zip } from "rxjs";

// combineLatest - Combina últimos valores de cada observable
combineLatest([this.user$, this.settings$, this.permissions$])
  .pipe(
    map(([user, settings, permissions]) => ({
      user,
      settings,
      permissions,
    })),
  )
  .subscribe((data) => console.log(data));

// forkJoin - Espera a que TODOS completen (como Promise.all)
forkJoin({
  users: this.http.get("/api/users"),
  posts: this.http.get("/api/posts"),
  comments: this.http.get("/api/comments"),
}).subscribe(({ users, posts, comments }) => {
  console.log("All loaded!", { users, posts, comments });
});

// merge - Combina múltiples observables en uno
merge(
  fromEvent(document, "mousedown"),
  fromEvent(document, "touchstart"),
).subscribe((event) => console.log("Input detected"));

// zip - Combina valores en el mismo índice
const ages$ = of(25, 30, 35);
const names$ = of("Alice", "Bob", "Charlie");
zip(ages$, names$)
  .pipe(map(([age, name]) => ({ age, name })))
  .subscribe(console.log);
// { age: 25, name: 'Alice' }
// { age: 30, name: 'Bob' }
// { age: 35, name: 'Charlie' }
```

---

## 🎯 Subjects

### Subject Types

```typescript
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from "rxjs";

// Subject - Básico, sin valor inicial
const subject$ = new Subject<number>();
subject$.next(1);
subject$.subscribe((val) => console.log("A:", val));
subject$.next(2); // A: 2
subject$.next(3); // A: 3

// BehaviorSubject - Requiere valor inicial, emite último valor
const behavior$ = new BehaviorSubject<number>(0);
behavior$.next(1);
behavior$.next(2);
behavior$.subscribe((val) => console.log("B:", val)); // B: 2 (último)
behavior$.next(3); // B: 3

// ReplaySubject - Emite N valores anteriores
const replay$ = new ReplaySubject<number>(2); // últimos 2 valores
replay$.next(1);
replay$.next(2);
replay$.next(3);
replay$.subscribe((val) => console.log("R:", val));
// R: 2
// R: 3
replay$.next(4); // R: 4

// AsyncSubject - Emite solo último valor cuando completa
const async$ = new AsyncSubject<number>();
async$.next(1);
async$.next(2);
async$.next(3);
async$.subscribe((val) => console.log("AS:", val)); // (nada aún)
async$.complete(); // AS: 3 (solo cuando completa)
```

### Subject como Store

```typescript
// service.ts
import { BehaviorSubject } from "rxjs";

export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);

  // Observable público (read-only)
  user$ = this.userSubject.asObservable();

  // Métodos para actualizar
  setUser(user: User) {
    this.userSubject.next(user);
  }

  clearUser() {
    this.userSubject.next(null);
  }

  // Obtener valor actual
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}

// component.ts
export class UserComponent implements OnInit {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user$.subscribe((user) => {
      console.log("User changed:", user);
    });
  }
}
```

---

## ⚡ Operadores de Utilidad

### debounceTime, throttleTime, distinctUntilChanged

```typescript
import {
  debounceTime,
  throttleTime,
  distinctUntilChanged,
} from "rxjs/operators";

// debounceTime - Espera X ms de silencio antes de emitir
searchInput$
  .pipe(
    debounceTime(300), // Espera 300ms sin cambios
    switchMap((term) => this.api.search(term)),
  )
  .subscribe();

// throttleTime - Emite máximo cada X ms
scroll$
  .pipe(
    throttleTime(100), // Máximo cada 100ms
    map(() => window.scrollY),
  )
  .subscribe((position) => console.log(position));

// distinctUntilChanged - Solo emite si el valor cambió
input$
  .pipe(
    map((event) => event.target.value),
    distinctUntilChanged(), // Ignora duplicados consecutivos
  )
  .subscribe((value) => console.log(value));

// Combinados (patrón común para búsqueda)
searchInput$
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter((term) => term.length >= 3),
    switchMap((term) => this.api.search(term)),
  )
  .subscribe((results) => (this.results = results));
```

### tap, delay, timeout

```typescript
import { tap, delay, timeout } from "rxjs/operators";

// tap - Side effects sin modificar el stream
this.http
  .get("/api/users")
  .pipe(
    tap((users) => console.log("Fetched users:", users)),
    tap(() => (this.loading = false)),
    map((users) => users.filter((u) => u.active)),
  )
  .subscribe();

// delay - Retrasa emisión
of("Hello").pipe(delay(1000)).subscribe(console.log); // "Hello" después de 1s

// timeout - Error si no emite en X ms
this.http
  .get("/api/slow")
  .pipe(
    timeout(5000), // Error si tarda más de 5s
  )
  .subscribe();
```

---

## 🛡️ Manejo de Errores

### catchError, retry, retryWhen

```typescript
import { catchError, retry, retryWhen, delay, take } from "rxjs/operators";
import { of, throwError, timer } from "rxjs";

// catchError - Maneja errores y devuelve fallback
this.http
  .get<User[]>("/api/users")
  .pipe(
    catchError((error) => {
      console.error("Error loading users:", error);
      return of([]); // Devuelve array vacío en caso de error
    }),
  )
  .subscribe((users) => console.log(users));

// retry - Reintenta N veces
this.http
  .get("/api/data")
  .pipe(
    retry(3), // Reintenta hasta 3 veces
    catchError((error) => {
      console.error("Failed after retries:", error);
      return of(null);
    }),
  )
  .subscribe();

// retryWhen - Reintentos con estrategia personalizada
this.http
  .get("/api/data")
  .pipe(
    retryWhen((errors) =>
      errors.pipe(
        delay(1000), // Espera 1s entre reintentos
        take(3), // Máximo 3 reintentos
        tap(() => console.log("Retrying...")),
      ),
    ),
    catchError((error) => {
      console.error("All retries failed:", error);
      return throwError(() => error);
    }),
  )
  .subscribe();

// Exponential backoff
this.http
  .get("/api/data")
  .pipe(
    retryWhen((errors) =>
      errors.pipe(
        mergeMap((error, index) => {
          if (index >= 3) {
            return throwError(() => error);
          }
          const delayTime = Math.pow(2, index) * 1000; // 1s, 2s, 4s
          console.log(`Retry #${index + 1} in ${delayTime}ms`);
          return timer(delayTime);
        }),
      ),
    ),
  )
  .subscribe();
```

---

## 🔄 Patterns de Unsubscribe

### takeUntil Pattern (Recomendado)

```typescript
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject, interval, takeUntil } from "rxjs";

@Component({
  selector: "app-demo",
  template: `<p>{{ count }}</p>`,
})
export class DemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  count = 0;

  ngOnInit() {
    // Todas las subscriptions se limpian automáticamente
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (this.count = val));

    this.dataService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => console.log(data));

    this.otherService.updates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((update) => this.handleUpdate(update));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Async Pipe (Mejor opción)

```typescript
@Component({
  selector: "app-demo",
  template: `
    <!-- Async pipe se desuscribe automáticamente -->
    @if (user$ | async; as user) {
      <p>{{ user.name }}</p>
    }

    @for (item of items$ | async; track item.id) {
      <div>{{ item.name }}</div>
    }

    <p>Count: {{ count$ | async }}</p>
  `,
})
export class DemoComponent {
  user$ = this.userService.user$;
  items$ = this.itemService.items$;
  count$ = interval(1000);

  constructor(
    private userService: UserService,
    private itemService: ItemService,
  ) {}
}
```

### toSignal (Angular 16+)

```typescript
import { Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-demo",
  template: `
    <p>User: {{ user()?.name }}</p>
    <p>Count: {{ count() }}</p>
  `,
})
export class DemoComponent {
  private userService = inject(UserService);

  // Convierte observable a signal (auto-cleanup)
  user = toSignal(this.userService.user$);
  count = toSignal(interval(1000), { initialValue: 0 });
}
```

### Manual Subscriptions (Evitar)

```typescript
// ❌ MAL: Memory leaks
export class BadComponent implements OnInit {
  ngOnInit() {
    this.service.data$.subscribe((data) => {
      // Nunca se desuscribe
    });
  }
}

// ✅ BIEN: Guardar y limpiar subscriptions
export class GoodComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const sub1 = this.service.data$.subscribe((data) => {});
    const sub2 = this.other$.subscribe((val) => {});

    this.subscriptions.push(sub1, sub2);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
```

---

## 🎯 Patrones Comunes en Angular

### HTTP con Loading State

```typescript
import { Component, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, finalize, tap } from "rxjs/operators";
import { of, BehaviorSubject } from "rxjs";

@Component({
  selector: "app-users",
  template: `
    @if (loading()) {
      <p>Loading...</p>
    } @else if (error()) {
      <p>Error: {{ error() }}</p>
    } @else {
      @for (user of users(); track user.id) {
        <div>{{ user.name }}</div>
      }
    }
  `,
})
export class UsersComponent {
  private http = inject(HttpClient);

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<User[]>("/api/users")
      .pipe(
        tap((users) => this.users.set(users)),
        catchError((err) => {
          this.error.set(err.message);
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }
}
```

### Search con Debounce

```typescript
import { Component, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";

@Component({
  selector: "app-search",
  template: `
    <input [formControl]="searchControl" placeholder="Search..." />

    @if (loading()) {
      <p>Searching...</p>
    }

    @for (result of results(); track result.id) {
      <div>{{ result.name }}</div>
    }
  `,
})
export class SearchComponent {
  searchControl = new FormControl("");

  results = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.loading.set(true)),
      switchMap((term) => this.searchService.search(term || "")),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] },
  );

  loading = signal(false);

  constructor(private searchService: SearchService) {}
}
```

### Polling

```typescript
import { Component, OnInit, OnDestroy } from "@angular/core";
import { interval, Subject, switchMap, takeUntil } from "rxjs";

@Component({
  selector: "app-dashboard",
  template: `<p>Data: {{ data | json }}</p>`,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  data: any;

  ngOnInit() {
    // Polling cada 5 segundos
    interval(5000)
      .pipe(
        switchMap(() => this.http.get("/api/status")),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => (this.data = data));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## ⚠️ Anti-Patterns

### ❌ Nested Subscriptions

```typescript
// ❌ MAL
this.userService.getUser(id).subscribe((user) => {
  this.postService.getPosts(user.id).subscribe((posts) => {
    this.commentService.getComments(posts[0].id).subscribe((comments) => {
      // Callback hell
    });
  });
});

// ✅ BIEN
this.userService
  .getUser(id)
  .pipe(
    switchMap((user) => this.postService.getPosts(user.id)),
    switchMap((posts) => this.commentService.getComments(posts[0].id)),
  )
  .subscribe((comments) => {
    // Clean!
  });
```

### ❌ No Unsubscribe

```typescript
// ❌ MAL - Memory leak
ngOnInit() {
  this.data$.subscribe(data => this.data = data);
}

// ✅ BIEN - Usar async pipe
template: `{{ data$ | async }}`

// ✅ BIEN - takeUntil
ngOnInit() {
  this.data$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(data => this.data = data);
}
```

---

## 📋 Checklist

### Development

- [ ] Usar operadores apropiados (switchMap para búsquedas, etc.)
- [ ] Implementar manejo de errores con catchError
- [ ] Limpiar subscriptions (takeUntil, async pipe, toSignal)
- [ ] Usar debounceTime para inputs de usuario
- [ ] Usar distinctUntilChanged para evitar duplicados

### Performance

- [ ] Preferir async pipe sobre subscriptions manuales
- [ ] Usar shareReplay para compartir HTTP requests
- [ ] Evitar nested subscriptions
- [ ] Usar switchMap para cancelar requests anteriores

### Best Practices

- [ ] BehaviorSubject para estado
- [ ] toSignal para integrar con signals
- [ ] Nombrar observables con sufijo $
- [ ] Documentar comportamientos complejos
- [ ] Usar tipos TypeScript

---

## 🔗 Skills Relacionadas

- `angular/http-client` - RxJS con HTTP
- `angular/state-management` - Subjects como stores
- `angular/forms` - valueChanges observables
- `angular/performance` - Optimización de subscriptions

---

## 📚 Referencias

- [RxJS Official Docs](https://rxjs.dev/)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [Learn RxJS](https://www.learnrxjs.io/)
- [RxJS Marbles](https://rxmarbles.com/)
