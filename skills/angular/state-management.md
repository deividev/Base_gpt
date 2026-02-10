# Angular State Management

## 📋 Información

- **Skill ID**: `angular/state-management`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Crítica
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar la gestión de estado en Angular usando signals, services, y NgRx para aplicaciones escalables y mantenibles.

---

## 📊 Niveles de Estado

```
┌──────────────────────────────────────────────────────┐
│  1. LOCAL STATE (Component)                          │
│     signals, computed                                 │
├──────────────────────────────────────────────────────┤
│  2. SHARED STATE (Service)                           │
│     Service with signals                              │
├──────────────────────────────────────────────────────┤
│  3. GLOBAL STATE (NgRx Store)                        │
│     Store, Actions, Reducers, Effects                │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Nivel 1: Local State (Signals)

### Estado en Componente

```typescript
import { Component, signal, computed } from "@angular/core";

@Component({
  selector: "app-counter",
  template: `
    <div class="counter">
      <button (click)="decrement()">-</button>
      <span>{{ count() }}</span>
      <button (click)="increment()">+</button>
      <p>Double: {{ doubled() }}</p>
      <p>Is even: {{ isEven() ? "Yes" : "No" }}</p>
    </div>
  `,
})
export class CounterComponent {
  // Estado local
  count = signal(0);

  // Estado derivado
  doubled = computed(() => this.count() * 2);
  isEven = computed(() => this.count() % 2 === 0);

  // Mutaciones
  increment() {
    this.count.update((value) => value + 1);
  }

  decrement() {
    this.count.update((value) => value - 1);
  }

  reset() {
    this.count.set(0);
  }
}
```

### Estado de Lista

```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: "app-todo-list",
  template: `
    <div class="todo-list">
      <input
        #newTodo
        type="text"
        placeholder="New todo..."
        (keyup.enter)="addTodo(newTodo.value); newTodo.value = ''"
      />

      <div class="filters">
        <button (click)="setFilter('all')">All ({{ todos().length }})</button>
        <button (click)="setFilter('active')">
          Active ({{ activeTodos().length }})
        </button>
        <button (click)="setFilter('completed')">
          Completed ({{ completedTodos().length }})
        </button>
      </div>

      @for (todo of filteredTodos(); track todo.id) {
        <div class="todo-item">
          <input
            type="checkbox"
            [checked]="todo.completed"
            (change)="toggleTodo(todo.id)"
          />
          <span [class.completed]="todo.completed">
            {{ todo.title }}
          </span>
          <button (click)="removeTodo(todo.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class TodoListComponent {
  // Estado
  private todos = signal<Todo[]>([]);
  private filter = signal<"all" | "active" | "completed">("all");
  private nextId = signal(1);

  // Computed
  activeTodos = computed(() => this.todos().filter((t) => !t.completed));

  completedTodos = computed(() => this.todos().filter((t) => t.completed));

  filteredTodos = computed(() => {
    const filter = this.filter();
    const todos = this.todos();

    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  });

  // Acciones
  addTodo(title: string) {
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: this.nextId(),
      title: title.trim(),
      completed: false,
    };

    this.todos.update((todos) => [...todos, newTodo]);
    this.nextId.update((id) => id + 1);
  }

  toggleTodo(id: number) {
    this.todos.update((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  removeTodo(id: number) {
    this.todos.update((todos) => todos.filter((t) => t.id !== id));
  }

  setFilter(filter: "all" | "active" | "completed") {
    this.filter.set(filter);
  }
}
```

---

## 📦 Nivel 2: Service-based State (Shared)

### State Service Pattern

```typescript
// services/cart.service.ts
import { Injectable, signal, computed } from "@angular/core";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({ providedIn: "root" })
export class CartService {
  // Private state
  private items = signal<CartItem[]>([]);

  // Public readonly access
  readonly cartItems = this.items.asReadonly();

  // Computed values
  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  readonly isEmpty = computed(() => this.items().length === 0);

  // Actions
  addItem(product: Omit<CartItem, "quantity">) {
    this.items.update((items) => {
      const existingItem = items.find((item) => item.id === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...items, { ...product, quantity: 1 }];
      }
    });
  }

  removeItem(id: number) {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  updateQuantity(id: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }

    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }

  clear() {
    this.items.set([]);
  }
}

// Usar en componente
@Component({
  selector: "app-cart",
  template: `
    <div class="cart">
      <h2>Shopping Cart ({{ cartService.itemCount() }})</h2>

      @if (cartService.isEmpty()) {
        <p>Your cart is empty</p>
      } @else {
        @for (item of cartService.cartItems(); track item.id) {
          <div class="cart-item">
            <span>{{ item.name }}</span>
            <input
              type="number"
              [value]="item.quantity"
              (change)="updateQuantity(item.id, $any($event.target).value)"
              min="0"
            />
            <span>{{ item.price * item.quantity | currency }}</span>
            <button (click)="removeItem(item.id)">Remove</button>
          </div>
        }

        <div class="total">
          <strong>Total: {{ cartService.totalPrice() | currency }}</strong>
        </div>

        <button (click)="clearCart()">Clear Cart</button>
      }
    </div>
  `,
})
export class CartComponent {
  cartService = inject(CartService);

  updateQuantity(id: number, quantity: string) {
    this.cartService.updateQuantity(id, +quantity);
  }

  removeItem(id: number) {
    this.cartService.removeItem(id);
  }

  clearCart() {
    this.cartService.clear();
  }
}
```

### Store Pattern con Effects

```typescript
// services/user.store.ts
import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";

export interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class UserStore {
  private http = inject(HttpClient);

  // State
  private state = signal<UserState>({
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
  });

  // Selectors (read-only computed)
  readonly users = computed(() => this.state().users);
  readonly selectedUser = computed(() => this.state().selectedUser);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly isEmpty = computed(() => this.state().users.length === 0);

  // Effects (side effects)
  loadUsers() {
    this.patchState({ loading: true, error: null });

    this.http
      .get<User[]>("/api/users")
      .pipe(
        tap((users) => {
          this.patchState({ users, loading: false });
        }),
        catchError((error) => {
          this.patchState({
            loading: false,
            error: error.message || "Failed to load users",
          });
          return of([]);
        }),
      )
      .subscribe();
  }

  selectUser(userId: number) {
    const user = this.state().users.find((u) => u.id === userId) || null;
    this.patchState({ selectedUser: user });
  }

  addUser(user: User) {
    this.patchState({
      users: [...this.state().users, user],
    });
  }

  updateUser(id: number, updates: Partial<User>) {
    this.patchState({
      users: this.state().users.map((user) =>
        user.id === id ? { ...user, ...updates } : user,
      ),
    });
  }

  deleteUser(id: number) {
    this.patchState({
      users: this.state().users.filter((u) => u.id !== id),
      selectedUser:
        this.state().selectedUser?.id === id ? null : this.state().selectedUser,
    });
  }

  clearError() {
    this.patchState({ error: null });
  }

  // Helper para actualizar state
  private patchState(partial: Partial<UserState>) {
    this.state.update((state) => ({ ...state, ...partial }));
  }
}

// Usar en componente
@Component({
  selector: "app-user-list",
  template: `
    <div class="user-list">
      @if (userStore.loading()) {
        <p>Loading users...</p>
      } @else if (userStore.error()) {
        <div class="error">
          {{ userStore.error() }}
          <button (click)="retry()">Retry</button>
        </div>
      } @else if (userStore.isEmpty()) {
        <p>No users found</p>
      } @else {
        @for (user of userStore.users(); track user.id) {
          <div
            class="user-item"
            [class.selected]="user.id === userStore.selectedUser()?.id"
            (click)="selectUser(user.id)"
          >
            <span>{{ user.name }}</span>
            <button (click)="deleteUser(user.id); $event.stopPropagation()">
              Delete
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  userStore = inject(UserStore);

  ngOnInit() {
    this.userStore.loadUsers();
  }

  selectUser(id: number) {
    this.userStore.selectUser(id);
  }

  deleteUser(id: number) {
    this.userStore.deleteUser(id);
  }

  retry() {
    this.userStore.clearError();
    this.userStore.loadUsers();
  }
}
```

---

## 🏪 Nivel 3: NgRx Store (Global State)

### Setup

```bash
# Install NgRx (compatible with Angular 21)
npm install @ngrx/store@^18.0.0 @ngrx/effects@^18.0.0 @ngrx/store-devtools@^18.0.0
```

### Actions

```typescript
// store/user/user.actions.ts
import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user.model";

export const loadUsers = createAction("[User List] Load Users");

export const loadUsersSuccess = createAction(
  "[User API] Load Users Success",
  props<{ users: User[] }>(),
);

export const loadUsersFailure = createAction(
  "[User API] Load Users Failure",
  props<{ error: string }>(),
);

export const selectUser = createAction(
  "[User List] Select User",
  props<{ userId: number }>(),
);

export const addUser = createAction(
  "[User Form] Add User",
  props<{ user: User }>(),
);

export const updateUser = createAction(
  "[User Form] Update User",
  props<{ id: number; updates: Partial<User> }>(),
);

export const deleteUser = createAction(
  "[User List] Delete User",
  props<{ id: number }>(),
);
```

### State & Reducer

```typescript
// store/user/user.reducer.ts
import { createReducer, on } from "@ngrx/store";
import * as UserActions from "./user.actions";
import { User } from "../../models/user.model";

export interface UserState {
  users: User[];
  selectedUserId: number | null;
  loading: boolean;
  error: string | null;
}

export const initialState: UserState = {
  users: [],
  selectedUserId: null,
  loading: false,
  error: null,
};

export const userReducer = createReducer(
  initialState,

  // Load Users
  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
  })),

  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select User
  on(UserActions.selectUser, (state, { userId }) => ({
    ...state,
    selectedUserId: userId,
  })),

  // Add User
  on(UserActions.addUser, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
  })),

  // Update User
  on(UserActions.updateUser, (state, { id, updates }) => ({
    ...state,
    users: state.users.map((user) =>
      user.id === id ? { ...user, ...updates } : user,
    ),
  })),

  // Delete User
  on(UserActions.deleteUser, (state, { id }) => ({
    ...state,
    users: state.users.filter((u) => u.id !== id),
    selectedUserId: state.selectedUserId === id ? null : state.selectedUserId,
  })),
);
```

### Selectors

```typescript
// store/user/user.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('users');

export const selectAllUsers = createSelector(
  selectUserState,
  state => state.users
);

export const selectUserLoading = createSelector(
  selectUserState,
  state => state.loading
);

export const selectUserError = createSelector(
  selectUserState,
  state => state.error
);

export const selectSelectedUserId = createSelector(
  selectUserState,
  state => state.selectedUserId
);

export const selectSelectedUser = createSelector(
  selectAllUsers,
  selectSelectedUserId,
  (users, selectedId) => users.find(u => u.id === selectedId) || null
);

export const selectActiveUsers = createSelector(
  selectAllUsers,
  users => users.filter(u => u.active)
);

export const selectUserById = (id: number) = createSelector(
  selectAllUsers,
  users => users.find(u => u.id === id)
);
```

### Effects

```typescript
// store/user/user.effects.ts
import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { map, catchError, switchMap } from "rxjs/operators";
import { UserService } from "../../services/user.service";
import * as UserActions from "./user.actions";

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(() =>
        this.userService.getUsers().pipe(
          map((users) => UserActions.loadUsersSuccess({ users })),
          catchError((error) =>
            of(UserActions.loadUsersFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
```

### Store Configuration

```typescript
// main.ts
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { userReducer } from "./store/user/user.reducer";
import { UserEffects } from "./store/user/user.effects";

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      users: userReducer,
    }),
    provideEffects([UserEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
});
```

### Usar en Componente

```typescript
import { Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { toSignal } from "@angular/core/rxjs-interop";
import * as UserActions from "./store/user/user.actions";
import * as UserSelectors from "./store/user/user.selectors";

@Component({
  selector: "app-user-list",
  template: `
    <div class="user-list">
      @if (loading()) {
        <p>Loading...</p>
      } @else if (error()) {
        <p>Error: {{ error() }}</p>
      } @else {
        @for (user of users(); track user.id) {
          <div class="user-item" (click)="selectUser(user.id)">
            {{ user.name }}
          </div>
        }
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private store = inject(Store);

  // Convertir observables a signals
  users = toSignal(this.store.select(UserSelectors.selectAllUsers), {
    initialValue: [],
  });
  loading = toSignal(this.store.select(UserSelectors.selectUserLoading), {
    initialValue: false,
  });
  error = toSignal(this.store.select(UserSelectors.selectUserError), {
    initialValue: null,
  });
  selectedUser = toSignal(this.store.select(UserSelectors.selectSelectedUser), {
    initialValue: null,
  });

  ngOnInit() {
    this.store.dispatch(UserActions.loadUsers());
  }

  selectUser(userId: number) {
    this.store.dispatch(UserActions.selectUser({ userId }));
  }

  deleteUser(id: number) {
    this.store.dispatch(UserActions.deleteUser({ id }));
  }
}
```

---

## 📋 Checklist

### Local State

- [ ] Signals para estado local
- [ ] Computed para derivados
- [ ] Actualizaciones inmutables con update()

### Shared State (Service)

- [ ] Service con signals
- [ ] asReadonly() para exponer state
- [ ] Computed selectors
- [ ] Métodos públicos para mutaciones

### Global State (NgRx)

- [ ] Actions definidas
- [ ] Reducer implementado
- [ ] Selectors creados
- [ ] Effects para side effects
- [ ] Store configurado
- [ ] Devtools habilitados

---

## 🔗 Skills Relacionadas

- `angular/signal-patterns` - Patrones avanzados
- `angular/services` - Services como stores
- `angular/http-client` - Effects con HTTP
- `architecture/clean-architecture` - Separación de capas

---

## 📚 Referencias

- [Angular Signals](https://angular.dev/guide/signals)
- [NgRx Store](https://ngrx.io/guide/store)
- [NgRx Effects](https://ngrx.io/guide/effects)
