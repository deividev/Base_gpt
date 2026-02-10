# SOLID Principles in Angular & TypeScript

## 📋 Metadata

- **Difficulty**: Advanced
- **Prerequisites**: services.md, component-creation.md, dependency-injection
- **Estimated Time**: 5-7 hours
- **Version**: Angular 21, TypeScript 5.8+, Node.js 18.19+/20.11+
- **Category**: Architecture

## 🎯 Learning Objectives

- Apply SOLID principles to Angular applications
- Recognize and refactor code smells
- Design maintainable, testable class hierarchies
- Use TypeScript features for SOLID design
- Balance theory with practical constraints

---

## 1️⃣ Single Responsibility Principle (SRP)

### Concepto

**"Una clase debe tener una sola razón para cambiar"**

Una clase debe tener una única responsabilidad, es decir, debe encapsular una sola parte de la funcionalidad.

### ❌ Anti-pattern: God Component

```typescript
// ❌ BAD: Componente con múltiples responsabilidades
@Component({
  selector: "app-user-dashboard",
  template: `
    <h1>User Dashboard</h1>
    <div *ngIf="loading">Loading...</div>
    <div *ngFor="let user of users">
      {{ user.name }} - {{ user.email }}
      <button (click)="deleteUser(user.id)">Delete</button>
    </div>
  `,
})
export class UserDashboardComponent {
  users: User[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Responsabilidad 1: HTTP requests
  loadUsers() {
    this.loading = true;
    this.http.get<User[]>("https://api.example.com/users").subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading users:", error);
        this.loading = false;
      },
    });
  }

  // Responsabilidad 2: Business logic
  deleteUser(id: number) {
    this.http.delete(`https://api.example.com/users/${id}`).subscribe(() => {
      this.users = this.users.filter((u) => u.id !== id);
    });
  }

  // Responsabilidad 3: Validation
  isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Responsabilidad 4: Formatting
  formatUserName(user: User): string {
    return `${user.firstName} ${user.lastName}`.toUpperCase();
  }
}
```

### ✅ Refactorizado con SRP

```typescript
// ✅ GOOD: Servicio con una sola responsabilidad - HTTP
@Injectable({ providedIn: "root" })
export class UserApiService {
  private readonly apiUrl = "https://api.example.com/users";

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

// ✅ GOOD: Servicio con una sola responsabilidad - Business Logic
@Injectable({ providedIn: "root" })
export class UserManagementService {
  private usersSignal = signal<User[]>([]);
  users = this.usersSignal.asReadonly();

  constructor(private userApi: UserApiService) {}

  loadUsers(): Observable<User[]> {
    return this.userApi
      .getUsers()
      .pipe(tap((users) => this.usersSignal.set(users)));
  }

  removeUser(id: number): Observable<void> {
    return this.userApi.deleteUser(id).pipe(
      tap(() => {
        this.usersSignal.update((users) => users.filter((u) => u.id !== id));
      }),
    );
  }
}

// ✅ GOOD: Servicio con una sola responsabilidad - Validation
@Injectable({ providedIn: "root" })
export class UserValidationService {
  isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isUsernameValid(username: string): boolean {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  }
}

// ✅ GOOD: Pipe con una sola responsabilidad - Formatting
@Pipe({ name: "fullName", standalone: true })
export class FullNamePipe implements PipeTransform {
  transform(user: User): string {
    return `${user.firstName} ${user.lastName}`.toUpperCase();
  }
}

// ✅ GOOD: Componente enfocado solo en presentación
@Component({
  selector: "app-user-dashboard",
  standalone: true,
  imports: [FullNamePipe],
  template: `
    <h1>User Dashboard</h1>
    @if (loading()) {
      <div>Loading...</div>
    }
    @for (user of users(); track user.id) {
      <div>
        {{ user | fullName }} - {{ user.email }}
        <button (click)="deleteUser(user.id)">Delete</button>
      </div>
    }
  `,
})
export class UserDashboardComponent {
  users = this.userService.users;
  loading = signal(false);

  constructor(private userService: UserManagementService) {}

  ngOnInit() {
    this.loading.set(true);
    this.userService
      .loadUsers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe();
  }

  deleteUser(id: number) {
    this.userService.removeUser(id).subscribe();
  }
}
```

### 🎯 Beneficios SRP

- **Testability**: Cada clase se prueba de forma aislada
- **Maintainability**: Cambios en una responsabilidad no afectan otras
- **Reusability**: Servicios específicos reutilizables en múltiples contextos
- **Clarity**: Código más fácil de entender

---

## 2️⃣ Open/Closed Principle (OCP)

### Concepto

**"Las entidades deben estar abiertas a extensión, pero cerradas a modificación"**

Debes poder agregar nuevas funcionalidades sin modificar el código existente.

### ❌ Anti-pattern: Switch/If statements

```typescript
// ❌ BAD: Cada nuevo tipo de notificación requiere modificar esta clase
@Injectable({ providedIn: "root" })
export class NotificationService {
  send(notification: Notification) {
    if (notification.type === "email") {
      console.log(`Sending email to ${notification.recipient}`);
      // Lógica de email
    } else if (notification.type === "sms") {
      console.log(`Sending SMS to ${notification.recipient}`);
      // Lógica de SMS
    } else if (notification.type === "push") {
      console.log(`Sending push to ${notification.recipient}`);
      // Lógica de push
    } else if (notification.type === "slack") {
      // Nueva funcionalidad = modificar clase existente ❌
      console.log(`Sending Slack message to ${notification.recipient}`);
    }
  }
}
```

### ✅ Refactorizado con OCP - Strategy Pattern

```typescript
// ✅ GOOD: Abstracción para envío de notificaciones
export interface NotificationChannel {
  send(recipient: string, message: string): Observable<void>;
}

// Implementaciones específicas
@Injectable({ providedIn: "root" })
export class EmailNotificationChannel implements NotificationChannel {
  constructor(private http: HttpClient) {}

  send(recipient: string, message: string): Observable<void> {
    return this.http.post<void>("/api/email", { recipient, message });
  }
}

@Injectable({ providedIn: "root" })
export class SmsNotificationChannel implements NotificationChannel {
  constructor(private http: HttpClient) {}

  send(recipient: string, message: string): Observable<void> {
    return this.http.post<void>("/api/sms", { recipient, message });
  }
}

@Injectable({ providedIn: "root" })
export class PushNotificationChannel implements NotificationChannel {
  constructor(private http: HttpClient) {}

  send(recipient: string, message: string): Observable<void> {
    return this.http.post<void>("/api/push", { recipient, message });
  }
}

// ✅ Nueva implementación sin modificar código existente
@Injectable({ providedIn: "root" })
export class SlackNotificationChannel implements NotificationChannel {
  constructor(private http: HttpClient) {}

  send(recipient: string, message: string): Observable<void> {
    return this.http.post<void>("/api/slack", { recipient, message });
  }
}

// Servicio que usa estrategias
@Injectable({ providedIn: "root" })
export class NotificationService {
  private channels = new Map<string, NotificationChannel>();

  constructor(
    private email: EmailNotificationChannel,
    private sms: SmsNotificationChannel,
    private push: PushNotificationChannel,
    private slack: SlackNotificationChannel,
  ) {
    this.channels.set("email", email);
    this.channels.set("sms", sms);
    this.channels.set("push", push);
    this.channels.set("slack", slack);
  }

  send(type: string, recipient: string, message: string): Observable<void> {
    const channel = this.channels.get(type);
    if (!channel) {
      return throwError(() => new Error(`Unknown notification type: ${type}`));
    }
    return channel.send(recipient, message);
  }
}
```

### ✅ Alternativa con InjectionToken

```typescript
// Token para inyección múltiple
export const NOTIFICATION_CHANNEL = new InjectionToken<NotificationChannel>(
  "NotificationChannel",
);

// Registro en providers
export const notificationProviders = [
  {
    provide: NOTIFICATION_CHANNEL,
    useClass: EmailNotificationChannel,
    multi: true,
  },
  {
    provide: NOTIFICATION_CHANNEL,
    useClass: SmsNotificationChannel,
    multi: true,
  },
  {
    provide: NOTIFICATION_CHANNEL,
    useClass: PushNotificationChannel,
    multi: true,
  },
  // Agregar nuevos canales sin modificar servicio
  {
    provide: NOTIFICATION_CHANNEL,
    useClass: SlackNotificationChannel,
    multi: true,
  },
];

@Injectable({ providedIn: "root" })
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_CHANNEL) private channels: NotificationChannel[],
  ) {}

  send(type: string, recipient: string, message: string): Observable<void> {
    const channel = this.channels.find((c) =>
      c.constructor.name.startsWith(type),
    );
    if (!channel) {
      return throwError(() => new Error(`Unknown notification type: ${type}`));
    }
    return channel.send(recipient, message);
  }
}
```

### 🎯 Beneficios OCP

- **Extensibility**: Agregar funcionalidad sin modificar código
- **Stability**: Código existente no se toca (menos bugs)
- **Plugin Architecture**: Sistema modular y extensible

---

## 3️⃣ Liskov Substitution Principle (LSP)

### Concepto

**"Los objetos de una clase derivada deben poder reemplazar objetos de la clase base sin alterar el correcto funcionamiento del programa"**

Las subclases deben cumplir el contrato de su clase base.

### ❌ Violación de LSP

```typescript
// ❌ BAD: Jerarquía que viola LSP
export interface DataStore {
  save(data: any): Observable<void>;
  load(): Observable<any>;
  delete(id: string): Observable<void>;
}

// Base funciona bien
@Injectable({ providedIn: 'root' })
export class LocalStorageDataStore implements DataStore {
  save(data: any): Observable<void> {
    localStorage.setItem('data', JSON.stringify(data));
    return of(undefined);
  }

  load(): Observable<any> {
    const data = localStorage.getItem('data');
    return of(JSON.parse(data || '{}'));
  }

  delete(id: string): Observable<void> {
    localStorage.removeItem(id);
    return of(undefined);
  }
}

// ❌ Subclase que viola el contrato (solo lectura)
@Injectable({ providedIn: 'root' })
export class ReadOnlyDataStore implements DataStore {
  load(): Observable<any> {
    return this.http.get('/api/data');
  }

  // ❌ Viola LSP: lanza error en vez de cumplir contrato
  save(data: any): Observable<void> {
    throw new Error('Read-only store cannot save');
  }

  delete(id: string): Observable<void> {
    throw new Error('Read-only store cannot delete');
  }

  constructor(private http: HttpClient) {}
}

// Código que falla al sustituir
@Component({...})
export class DataComponent {
  constructor(private store: DataStore) {} // ❌ Puede ser ReadOnlyDataStore

  saveData(data: any) {
    // ❌ Falla si store es ReadOnlyDataStore
    this.store.save(data).subscribe();
  }
}
```

### ✅ Refactorizado con LSP - Interface Segregation

```typescript
// ✅ GOOD: Interfaces segregadas según capacidades
export interface DataReader {
  load(): Observable<any>;
}

export interface DataWriter {
  save(data: any): Observable<void>;
  delete(id: string): Observable<void>;
}

// Implementación completa
@Injectable({ providedIn: 'root' })
export class LocalStorageDataStore implements DataReader, DataWriter {
  save(data: any): Observable<void> {
    localStorage.setItem('data', JSON.stringify(data));
    return of(undefined);
  }

  load(): Observable<any> {
    const data = localStorage.getItem('data');
    return of(JSON.parse(data || '{}'));
  }

  delete(id: string): Observable<void> {
    localStorage.removeItem(id);
    return of(undefined);
  }
}

// ✅ Solo lectura cumple su contrato
@Injectable({ providedIn: 'root' })
export class ReadOnlyDataStore implements DataReader {
  constructor(private http: HttpClient) {}

  load(): Observable<any> {
    return this.http.get('/api/data');
  }
}

// Componentes con dependencias específicas
@Component({...})
export class DataViewerComponent {
  constructor(private reader: DataReader) {} // ✅ Solo lectura

  loadData() {
    this.reader.load().subscribe();
  }
}

@Component({...})
export class DataEditorComponent {
  constructor(
    private reader: DataReader,
    private writer: DataWriter
  ) {}

  loadData() {
    this.reader.load().subscribe();
  }

  saveData(data: any) {
    this.writer.save(data).subscribe();
  }
}
```

### ✅ LSP con Type Guards

```typescript
// Type guard para verificar capacidades
export function isDataWriter(store: any): store is DataWriter {
  return 'save' in store && 'delete' in store;
}

@Component({...})
export class SmartDataComponent {
  constructor(private store: DataReader) {}

  loadData() {
    this.store.load().subscribe();
  }

  saveData(data: any) {
    if (isDataWriter(this.store)) {
      this.store.save(data).subscribe();
    } else {
      console.warn('Store does not support writing');
    }
  }
}
```

### 🎯 Beneficios LSP

- **Polymorphism**: Sustitución confiable de implementaciones
- **Contracts**: Contratos claros y respetados
- **Predictability**: Comportamiento esperado sin sorpresas

---

## 4️⃣ Interface Segregation Principle (ISP)

### Concepto

**"Los clientes no deben depender de interfaces que no usan"**

Es mejor tener interfaces pequeñas y específicas que interfaces grandes y genéricas.

### ❌ Fat Interface

```typescript
// ❌ BAD: Interfaz demasiado grande
export interface Repository<T> {
  // CRUD básico
  findById(id: string): Observable<T>;
  findAll(): Observable<T[]>;
  create(item: T): Observable<T>;
  update(id: string, item: Partial<T>): Observable<T>;
  delete(id: string): Observable<void>;

  // Búsquedas avanzadas
  search(query: string): Observable<T[]>;
  findByFields(fields: Partial<T>): Observable<T[]>;

  // Operaciones batch
  createMany(items: T[]): Observable<T[]>;
  deleteMany(ids: string[]): Observable<void>;

  // Estadísticas
  count(): Observable<number>;
  aggregate(pipeline: any[]): Observable<any>;

  // Cache
  clearCache(): void;
  getCached(id: string): T | null;
}

// ❌ Implementación forzada a definir métodos que no usa
@Injectable({ providedIn: "root" })
export class ReadOnlyUserRepository implements Repository<User> {
  // Implementación real
  findById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  findAll(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }

  // ❌ Métodos que no tienen sentido en solo lectura
  create(user: User): Observable<User> {
    throw new Error("Read-only repository");
  }

  update(id: string, user: Partial<User>): Observable<User> {
    throw new Error("Read-only repository");
  }

  delete(id: string): Observable<void> {
    throw new Error("Read-only repository");
  }

  // ❌ Métodos que no necesitamos
  search(query: string): Observable<User[]> {
    throw new Error("Not implemented");
  }

  findByFields(fields: Partial<User>): Observable<User[]> {
    throw new Error("Not implemented");
  }

  createMany(users: User[]): Observable<User[]> {
    throw new Error("Not implemented");
  }

  deleteMany(ids: string[]): Observable<void> {
    throw new Error("Not implemented");
  }

  count(): Observable<number> {
    throw new Error("Not implemented");
  }

  aggregate(pipeline: any[]): Observable<any> {
    throw new Error("Not implemented");
  }

  clearCache(): void {
    throw new Error("Not implemented");
  }

  getCached(id: string): User | null {
    throw new Error("Not implemented");
  }

  constructor(private http: HttpClient) {}
}
```

### ✅ Interfaces Segregadas

```typescript
// ✅ GOOD: Interfaces pequeñas y específicas
export interface Readable<T> {
  findById(id: string): Observable<T>;
  findAll(): Observable<T[]>;
}

export interface Writable<T> {
  create(item: T): Observable<T>;
  update(id: string, item: Partial<T>): Observable<T>;
  delete(id: string): Observable<void>;
}

export interface Searchable<T> {
  search(query: string): Observable<T[]>;
  findByFields(fields: Partial<T>): Observable<T[]>;
}

export interface BatchOperations<T> {
  createMany(items: T[]): Observable<T[]>;
  deleteMany(ids: string[]): Observable<void>;
}

export interface Cacheable<T> {
  clearCache(): void;
  getCached(id: string): T | null;
}

export interface Aggregatable {
  count(): Observable<number>;
  aggregate(pipeline: any[]): Observable<any>;
}

// ✅ Implementaciones específicas
@Injectable({ providedIn: 'root' })
export class ReadOnlyUserRepository implements Readable<User> {
  constructor(private http: HttpClient) {}

  findById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  findAll(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

@Injectable({ providedIn: 'root' })
export class UserRepository
  implements Readable<User>, Writable<User>, Searchable<User> {

  constructor(private http: HttpClient) {}

  // Readable
  findById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  findAll(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  // Writable
  create(user: User): Observable<User> {
    return this.http.post<User>('/api/users', user);
  }

  update(id: string, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`/api/users/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }

  // Searchable
  search(query: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/users/search?q=${query}`);
  }

  findByFields(fields: Partial<User>): Observable<User[]> {
    const params = new HttpParams({ fromObject: fields as any });
    return this.http.get<User[]>('/api/users', { params });
  }
}

// Componente depende solo de lo que necesita
@Component({...})
export class UserListComponent {
  // ✅ Solo depende de Readable
  constructor(private userRepo: Readable<User>) {}

  loadUsers() {
    this.userRepo.findAll().subscribe();
  }
}

@Component({...})
export class UserEditorComponent {
  // ✅ Depende de Readable y Writable
  constructor(
    private reader: Readable<User>,
    private writer: Writable<User>
  ) {}

  loadUser(id: string) {
    this.reader.findById(id).subscribe();
  }

  saveUser(user: User) {
    this.writer.create(user).subscribe();
  }
}
```

### 🎯 Beneficios ISP

- **Flexibility**: Clientes dependen solo de lo necesario
- **Decoupling**: Menos acoplamiento entre componentes
- **Testability**: Mocks más simples

---

## 5️⃣ Dependency Inversion Principle (DIP)

### Concepto

**"Depende de abstracciones, no de implementaciones concretas"**

Módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

### ❌ Dependencia Directa

```typescript
// ❌ BAD: Componente depende de implementación concreta
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  save(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  load(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}

@Component({...})
export class SettingsComponent {
  // ❌ Dependencia concreta - difícil de testear y cambiar
  constructor(private storage: LocalStorageService) {}

  saveSettings(settings: Settings) {
    this.storage.save('settings', settings);
  }

  loadSettings(): Settings {
    return this.storage.load('settings');
  }
}
```

### ✅ Dependencia de Abstracción

```typescript
// ✅ GOOD: Abstracción para almacenamiento
export abstract class StorageService {
  abstract save(key: string, value: any): void;
  abstract load(key: string): any;
  abstract remove(key: string): void;
  abstract clear(): void;
}

// Implementaciones concretas
@Injectable({ providedIn: 'root' })
export class LocalStorageService implements StorageService {
  save(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  load(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

@Injectable({ providedIn: 'root' })
export class SessionStorageService implements StorageService {
  save(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  load(key: string): any {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}

@Injectable({ providedIn: 'root' })
export class IndexedDbStorageService implements StorageService {
  // Implementación con IndexedDB
  save(key: string, value: any): void {
    // IndexedDB logic
  }

  load(key: string): any {
    // IndexedDB logic
    return null;
  }

  remove(key: string): void {
    // IndexedDB logic
  }

  clear(): void {
    // IndexedDB logic
  }
}

// ✅ Componente depende de abstracción
@Component({
  ...
  providers: [
    { provide: StorageService, useClass: LocalStorageService }
  ]
})
export class SettingsComponent {
  // ✅ Dependencia de abstracción
  constructor(private storage: StorageService) {}

  saveSettings(settings: Settings) {
    this.storage.save('settings', settings);
  }

  loadSettings(): Settings {
    return this.storage.load('settings');
  }
}
```

### ✅ DIP con InjectionToken

```typescript
// Token para abstracción
export interface Logger {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}

export const LOGGER = new InjectionToken<Logger>("Logger");

// Implementaciones
export class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.error(message);
  }

  warn(message: string): void {
    console.warn(message);
  }
}

export class RemoteLogger implements Logger {
  constructor(private http: HttpClient) {}

  log(message: string): void {
    this.http.post("/api/logs", { level: "info", message }).subscribe();
  }

  error(message: string): void {
    this.http.post("/api/logs", { level: "error", message }).subscribe();
  }

  warn(message: string): void {
    this.http.post("/api/logs", { level: "warn", message }).subscribe();
  }
}

// Configuración en app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOGGER,
      useFactory: () => {
        return environment.production
          ? inject(RemoteLogger)
          : new ConsoleLogger();
      },
    },
  ],
};

// Uso en servicio
@Injectable({ providedIn: "root" })
export class DataService {
  constructor(@Inject(LOGGER) private logger: Logger) {}

  loadData() {
    this.logger.log("Loading data...");
    // ...
  }
}
```

### 🎯 Beneficios DIP

- **Testability**: Fácil reemplazar con mocks
- **Flexibility**: Cambiar implementación sin afectar clientes
- **Decoupling**: Bajo acoplamiento entre módulos

---

## 🔄 SOLID en Conjunto: Caso Real

### Problema: Sistema de Reportes

```typescript
// Sistema de reportes aplicando todos los principios SOLID

// 1️⃣ SRP: Interfaces específicas por responsabilidad
export interface DataSource {
  fetchData(): Observable<any[]>;
}

export interface ReportFormatter {
  format(data: any[]): string;
}

export interface ReportExporter {
  export(content: string, filename: string): void;
}

// 2️⃣ OCP: Abierto a extensión
export interface ReportFilter {
  apply(data: any[]): any[];
}

// 3️⃣ LSP: Implementaciones intercambiables
@Injectable({ providedIn: 'root' })
export class ApiDataSource implements DataSource {
  constructor(private http: HttpClient) {}

  fetchData(): Observable<any[]> {
    return this.http.get<any[]>('/api/reports/data');
  }
}

@Injectable({ providedIn: 'root' })
export class LocalDataSource implements DataSource {
  fetchData(): Observable<any[]> {
    const data = JSON.parse(localStorage.getItem('reportData') || '[]');
    return of(data);
  }
}

// 4️⃣ ISP: Interfaces segregadas
@Injectable({ providedIn: 'root' })
export class PdfFormatter implements ReportFormatter {
  format(data: any[]): string {
    // Formato PDF
    return `PDF Report:\n${JSON.stringify(data, null, 2)}`;
  }
}

@Injectable({ providedIn: 'root' })
export class CsvFormatter implements ReportFormatter {
  format(data: any[]): string {
    // Formato CSV
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }
}

@Injectable({ providedIn: 'root' })
export class HtmlFormatter implements ReportFormatter {
  format(data: any[]): string {
    // Formato HTML
    return `<table><tbody>${data.map(row =>
      `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join('')}</tr>`
    ).join('')}</tbody></table>`;
  }
}

// Filters extensibles
@Injectable({ providedIn: 'root' })
export class DateRangeFilter implements ReportFilter {
  constructor(private startDate: Date, private endDate: Date) {}

  apply(data: any[]): any[] {
    return data.filter(item => {
      const date = new Date(item.date);
      return date >= this.startDate && date <= this.endDate;
    });
  }
}

@Injectable({ providedIn: 'root' })
export class StatusFilter implements ReportFilter {
  constructor(private status: string) {}

  apply(data: any[]): any[] {
    return data.filter(item => item.status === this.status);
  }
}

// 5️⃣ DIP: Depende de abstracciones
@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private dataSource: DataSource,
    private formatter: ReportFormatter,
    private exporter: ReportExporter,
    @Optional() @Inject(REPORT_FILTERS) private filters: ReportFilter[] = []
  ) {}

  generateReport(filename: string): Observable<void> {
    return this.dataSource.fetchData().pipe(
      map(data => {
        // Aplicar filtros
        let filteredData = data;
        for (const filter of this.filters) {
          filteredData = filter.apply(filteredData);
        }
        return filteredData;
      }),
      map(data => this.formatter.format(data)),
      tap(content => this.exporter.export(content, filename)),
      map(() => undefined)
    );
  }
}

// Configuración
export const REPORT_FILTERS = new InjectionToken<ReportFilter[]>('ReportFilters');

export const reportProviders = [
  { provide: DataSource, useClass: ApiDataSource },
  { provide: ReportFormatter, useClass: PdfFormatter },
  { provide: ReportExporter, useClass: FileExporter },
  {
    provide: REPORT_FILTERS,
    useFactory: () => [
      new DateRangeFilter(new Date('2024-01-01'), new Date()),
      new StatusFilter('active')
    ],
    multi: true
  }
];

// Uso en componente
@Component({
  ...
  providers: [reportProviders]
})
export class ReportComponent {
  constructor(private reportService: ReportService) {}

  generateReport() {
    this.reportService.generateReport('monthly-report.pdf').subscribe({
      next: () => console.log('Report generated'),
      error: (err) => console.error('Error generating report:', err)
    });
  }
}
```

---

## 🧪 Testing SOLID Code

### Unit Tests con Dependencias Inyectadas

```typescript
describe("ReportService", () => {
  it("should generate report with filters", (done) => {
    // Mocks que implementan las interfaces
    const mockDataSource: DataSource = {
      fetchData: () =>
        of([
          { id: 1, name: "Item 1", status: "active" },
          { id: 2, name: "Item 2", status: "inactive" },
        ]),
    };

    const mockFormatter: ReportFormatter = {
      format: (data) => JSON.stringify(data),
    };

    const mockExporter: ReportExporter = {
      export: jasmine.createSpy("export"),
    };

    const statusFilter = new StatusFilter("active");

    const service = new ReportService(
      mockDataSource,
      mockFormatter,
      mockExporter,
      [statusFilter],
    );

    service.generateReport("test.pdf").subscribe(() => {
      expect(mockExporter.export).toHaveBeenCalledWith(
        JSON.stringify([{ id: 1, name: "Item 1", status: "active" }]),
        "test.pdf",
      );
      done();
    });
  });
});
```

---

## ⚠️ Anti-patterns Comunes

### 1. Violación de SRP: Classes doing too much

```typescript
// ❌ Clase que hace HTTP, validación, formateo, cache
export class UserService {
  getUsers() {
    /* HTTP */
  }
  validateUser() {
    /* Validation */
  }
  formatUserName() {
    /* Formatting */
  }
  cacheUser() {
    /* Caching */
  }
}
```

### 2. Violación de OCP: Modificar en vez de extender

```typescript
// ❌ Modificar método cada vez que hay nuevo tipo
processPayment(type: string) {
  if (type === 'credit') { /* ... */ }
  else if (type === 'debit') { /* ... */ }
  else if (type === 'paypal') { /* ... */ } // Modificación
}
```

### 3. Violación de LSP: Subclase que lanza excepciones

```typescript
// ❌ Subclase que no cumple contrato
class ReadOnlyList extends List {
  add(item: any) {
    throw new Error("Read-only"); // Viola LSP
  }
}
```

### 4. Violación de ISP: Fat interfaces

```typescript
// ❌ Interfaz con muchos métodos opcionales
interface Repository {
  find();
  create();
  update();
  delete();
  search?(); // Opcional
  export?(); // Opcional
  import?(); // Opcional
}
```

### 5. Violación de DIP: Dependencia concreta

```typescript
// ❌ Dependencia de clase concreta
constructor(private localStorage: LocalStorageService) {}
```

---

## ✅ Checklist de Implementación

### Single Responsibility

- [ ] Cada clase tiene una razón para cambiar
- [ ] Servicios específicos (API, business logic, validation)
- [ ] Componentes enfocados en presentación
- [ ] Pipes para transformación de datos

### Open/Closed

- [ ] Interfaces para abstracciones
- [ ] Strategy pattern para variaciones
- [ ] InjectionToken para extensibilidad
- [ ] No modificar código existente al agregar features

### Liskov Substitution

- [ ] Subclases cumplen contrato de clase base
- [ ] No lanzar excepciones inesperadas
- [ ] Type guards para verificar capacidades
- [ ] Interfaces segregadas en vez de jerarquías profundas

### Interface Segregation

- [ ] Interfaces pequeñas y específicas
- [ ] Clientes dependen solo de lo que usan
- [ ] Evitar métodos opcionales
- [ ] Composición sobre herencia

### Dependency Inversion

- [ ] Depende de abstracciones (abstract class, interface)
- [ ] InjectionToken para tokens de inyección
- [ ] Configuración en providers
- [ ] Fácil reemplazar implementaciones en tests

---

## 🎓 Conclusión

SOLID no son reglas absolutas, son **principios guía**:

- **Balance**: No sobre-diseñar aplicaciones simples
- **Pragmatism**: Aplicar según complejidad del proyecto
- **Evolution**: Refactorizar hacia SOLID según necesidad
- **Testability**: Codigo SOLID es más fácil de testear
- **Maintainability**: Código escalable y mantenible

**Regla de oro**: Si el código es difícil de testear, probablemente viola algún principio SOLID.

---

## 📚 Recursos Adicionales

- Angular Dependency Injection: https://angular.dev/guide/di
- TypeScript Interfaces: https://www.typescriptlang.org/docs/handbook/interfaces.html
- SOLID Principles: https://en.wikipedia.org/wiki/SOLID
- Design Patterns in TypeScript: https://refactoring.guru/design-patterns/typescript
