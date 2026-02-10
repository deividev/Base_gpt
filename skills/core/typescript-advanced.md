# TypeScript Advanced Skills

## 📋 Información

- **Skill ID**: `core/typescript-advanced`
- **Versión**: 1.0.0
- **Categoría**: Core
- **Prioridad**: Alta

## 🎯 Objetivo

Dominar características avanzadas de TypeScript para escribir código type-safe, mantenible y elegante.

## ✅ Utility Types

### 1. Tipos Genéricos
```typescript
// Generic function
function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Generic class
class Repository<T extends { id: number }> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }
}
```

### 2. Utility Types Nativos
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

// Partial - Todos los campos opcionales
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; ... }

// Required - Todos los campos requeridos
type RequiredUser = Required<Partial<User>>;

// Pick - Seleccionar campos específicos
type UserCredentials = Pick<User, 'email' | 'password'>;
// { email: string; password: string; }

// Omit - Excluir campos específicos
type PublicUser = Omit<User, 'password'>;
// { id: number; name: string; email: string; role: ... }

// Record - Objeto con claves específicas
type UserRoles = Record<'admin' | 'user' | 'guest', string[]>;
// { admin: string[]; user: string[]; guest: string[]; }

// Readonly - Inmutable
type ReadonlyUser = Readonly<User>;
```

### 3. Mapped Types
```typescript
// Make all properties nullable
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; ... }

// Make properties readonly conditionally
type ReadonlyByKey<T, K extends keyof T> = {
  readonly [P in K]: T[P];
} & {
  [P in Exclude<keyof T, K>]: T[P];
};

type UserWithReadonlyId = ReadonlyByKey<User, 'id'>;
```

### 4. Conditional Types
```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// More complex example
type NonNullable<T> = T extends null | undefined ? never : T;

type C = NonNullable<string | null>; // string
type D = NonNullable<number | undefined>; // number

// Extract function return type
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser(): User {
  return { id: 1, name: 'John', email: 'john@example.com', password: '', role: 'user' };
}

type UserType = ReturnTypeOf<typeof getUser>; // User
```

## 📝 Type Guards

### 1. Type Predicates
```typescript
// Custom type guard
function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}

// Usage
function processData(data: unknown): void {
  if (isUser(data)) {
    // data is now typed as User
    console.log(data.name);
  }
}
```

### 2. Discriminated Unions
```typescript
interface LoadingState {
  status: 'loading';
}

interface SuccessState<T> {
  status: 'success';
  data: T;
}

interface ErrorState {
  status: 'error';
  error: string;
}

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

// Type-safe handling
function handleState<T>(state: AsyncState<T>): void {
  switch (state.status) {
    case 'loading':
      console.log('Loading...');
      break;
    case 'success':
      console.log('Data:', state.data); // TypeScript knows state.data exists
      break;
    case 'error':
      console.log('Error:', state.error); // TypeScript knows state.error exists
      break;
  }
}
```

## ✨ Características Avanzadas

### 1. Template Literal Types
```typescript
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = 'users' | 'posts' | 'comments';

type APIRoute = `/${Endpoint}`;
// type APIRoute = "/users" | "/posts" | "/comments"

type APIAction = `${HTTPMethod} ${APIRoute}`;
// type APIAction = "GET /users" | "POST /users" | ...

// Practical example
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // "onClick"
type ChangeEvent = EventName<'change'>; // "onChange"
```

### 2. Indexed Access Types
```typescript
interface UserProfile {
  personal: {
    name: string;
    age: number;
  };
  contact: {
    email: string;
    phone: string;
  };
}

type PersonalInfo = UserProfile['personal'];
// { name: string; age: number; }

type EmailType = UserProfile['contact']['email'];
// string

// With arrays
type Users = User[];
type SingleUser = Users[number]; // User
```

### 3. Decorators con Tipos
```typescript
// Method decorator
function Log() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.log(`Calling ${propertyKey} with args:`, args);
      const result = originalMethod.apply(this, args);
      console.log(`Result:`, result);
      return result;
    };

    return descriptor;
  };
}

class Calculator {
  @Log()
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## 🚫 Anti-Patrones

### ❌ Usar `any`
```typescript
// ❌ INCORRECTO
function process(data: any): any {
  return data.value;
}

// ✅ CORRECTO
function process<T extends { value: unknown }>(data: T): T['value'] {
  return data.value;
}
```

### ❌ Type Assertions Innecesarios
```typescript
// ❌ INCORRECTO
const user = getUserData() as User;

// ✅ CORRECTO - Usar type guard
const userData = getUserData();
if (isUser(userData)) {
  // userData is User here
}
```

## 📋 Checklist

- [ ] Usar tipos específicos en lugar de `any`
- [ ] Aprovechar utility types nativos
- [ ] Crear type guards para validación
- [ ] Usar generics para reutilización
- [ ] Tipos discriminados para estados
- [ ] Evitar type assertions cuando sea posible

## 🔗 Skills Relacionadas

- `core/error-handling`
- `angular/services`
- `testing/unit-testing`
