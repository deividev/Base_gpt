# Design Patterns in Angular & TypeScript

## 📋 Metadata

- **Difficulty**: Advanced
- **Prerequisites**: solid-principles.md, services.md, rxjs.md
- **Estimated Time**: 6-8 hours
- **Version**: Angular 21, TypeScript 5.8+, RxJS 7.8+, Node.js 18.19+/20.11+
- **Category**: Architecture

## 🎯 Learning Objectives

- Apply classic design patterns in Angular context
- Recognize when to use each pattern
- Implement creational, structural, and behavioral patterns
- Use Angular-specific patterns effectively
- Balance pattern usage with code simplicity

---

## 🏗️ Creational Patterns

### 1. Singleton Pattern

**Purpose**: Ensure a class has only one instance

#### ✅ Angular Native Singleton

```typescript
// ✅ GOOD: Singleton via providedIn: 'root'
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig | null = null;

  loadConfig(): Observable<AppConfig> {
    if (this.config) {
      return of(this.config);
    }

    return this.http.get<AppConfig>('/api/config').pipe(
      tap(config => this.config = config)
    );
  }

  get<T>(key: string): T {
    return this.config?.[key];
  }

  constructor(private http: HttpClient) {}
}

// Uso: Siempre la misma instancia
@Component({...})
export class ComponentA {
  constructor(private config: ConfigService) {} // Misma instancia
}

@Component({...})
export class ComponentB {
  constructor(private config: ConfigService) {} // Misma instancia
}
```

#### ❌ Manual Singleton (Not Recommended)

```typescript
// ❌ BAD: Manual singleton (antipatrón en Angular)
export class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
}

// Problemas:
// - No aprovesha DI de Angular
// - Difícil de testear
// - No tree-shakeable
```

---

### 2. Factory Pattern

**Purpose**: Create objects without specifying their exact class

#### ✅ Factory Service

```typescript
// Abstract product
export interface Notification {
  send(message: string): Observable<void>;
}

// Concrete products
export class EmailNotification implements Notification {
  constructor(private http: HttpClient) {}

  send(message: string): Observable<void> {
    return this.http.post<void>("/api/notifications/email", { message });
  }
}

export class SmsNotification implements Notification {
  constructor(private http: HttpClient) {}

  send(message: string): Observable<void> {
    return this.http.post<void>("/api/notifications/sms", { message });
  }
}

export class PushNotification implements Notification {
  constructor(private http: HttpClient) {}

  send(message: string): Observable<void> {
    return this.http.post<void>("/api/notifications/push", { message });
  }
}

// Factory
@Injectable({ providedIn: "root" })
export class NotificationFactory {
  constructor(private http: HttpClient) {}

  create(type: "email" | "sms" | "push"): Notification {
    switch (type) {
      case "email":
        return new EmailNotification(this.http);
      case "sms":
        return new SmsNotification(this.http);
      case "push":
        return new PushNotification(this.http);
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// Usage
@Injectable({ providedIn: "root" })
export class NotificationService {
  constructor(private factory: NotificationFactory) {}

  notify(type: "email" | "sms" | "push", message: string): Observable<void> {
    const notification = this.factory.create(type);
    return notification.send(message);
  }
}
```

#### ✅ Abstract Factory with InjectionToken

```typescript
// Abstract factory interface
export interface ChartFactory {
  createChart(type: string): Chart;
}

export interface Chart {
  render(data: any[]): void;
}

// Concrete factories
@Injectable()
export class ChartJsFactory implements ChartFactory {
  createChart(type: string): Chart {
    // Return ChartJS implementation
    return new ChartJsChart(type);
  }
}

@Injectable()
export class D3Factory implements ChartFactory {
  createChart(type: string): Chart {
    // Return D3 implementation
    return new D3Chart(type);
  }
}

// Token
export const CHART_FACTORY = new InjectionToken<ChartFactory>('ChartFactory');

// Configuration
export const chartProviders = [
  {
    provide: CHART_FACTORY,
    useFactory: () => {
      return environment.useChartJs
        ? new ChartJsFactory()
        : new D3Factory();
    }
  }
];

// Usage
@Component({...})
export class DashboardComponent {
  constructor(@Inject(CHART_FACTORY) private chartFactory: ChartFactory) {}

  createBarChart(data: any[]) {
    const chart = this.chartFactory.createChart('bar');
    chart.render(data);
  }
}
```

---

### 3. Builder Pattern

**Purpose**: Construct complex objects step by step

```typescript
// Complex object
export interface HttpRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Builder
@Injectable({ providedIn: 'root' })
export class HttpRequestBuilder {
  private request: Partial<HttpRequest> = {
    method: 'GET',
    headers: {}
  };

  setUrl(url: string): this {
    this.request.url = url;
    return this;
  }

  setMethod(method: string): this {
    this.request.method = method;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.request.headers![key] = value;
    return this;
  }

  setBody(body: any): this {
    this.request.body = body;
    return this;
  }

  setParams(params: Record<string, string>): this {
    this.request.params = params;
    return this;
  }

  setTimeout(timeout: number): this {
    this.request.timeout = timeout;
    return this;
  }

  setRetries(retries: number): this {
    this.request.retries = retries;
    return this;
  }

  build(): HttpRequest {
    if (!this.request.url) {
      throw new Error('URL is required');
    }
    return this.request as HttpRequest;
  }

  reset(): this {
    this.request = { method: 'GET', headers: {} };
    return this;
  }
}

// Usage
@Component({...})
export class ApiComponent {
  constructor(private builder: HttpRequestBuilder) {}

  sendRequest() {
    const request = this.builder
      .setUrl('/api/users')
      .setMethod('POST')
      .setHeader('Content-Type', 'application/json')
      .setHeader('Authorization', 'Bearer token123')
      .setBody({ name: 'John', email: 'john@example.com' })
      .setTimeout(5000)
      .setRetries(3)
      .build();

    console.log(request);
  }
}

// Alternative: Fluent Form Builder
export class FormBuilder {
  private controls: Record<string, FormControl> = {};

  addControl(name: string, value: any, validators: ValidatorFn[] = []): this {
    this.controls[name] = new FormControl(value, validators);
    return this;
  }

  addEmail(name: string, required = true): this {
    const validators = required
      ? [Validators.required, Validators.email]
      : [Validators.email];
    return this.addControl(name, '', validators);
  }

  addPassword(name: string, minLength = 8): this {
    return this.addControl(name, '', [
      Validators.required,
      Validators.minLength(minLength)
    ]);
  }

  build(): FormGroup {
    return new FormGroup(this.controls);
  }
}

// Usage
const form = new FormBuilder()
  .addEmail('email')
  .addPassword('password', 12)
  .addControl('username', '', [Validators.required, Validators.minLength(3)])
  .build();
```

---

## 🏛️ Structural Patterns

### 4. Facade Pattern

**Purpose**: Provide a simplified interface to a complex subsystem

```typescript
// Complex subsystem
@Injectable({ providedIn: 'root' })
export class OrderApiService {
  constructor(private http: HttpClient) {}

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>('/api/orders', order);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  processPayment(orderId: string, payment: Payment): Observable<PaymentResult> {
    return this.http.post<PaymentResult>('/api/payments', { orderId, payment });
  }
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}

  reserveItems(items: OrderItem[]): Observable<void> {
    return this.http.post<void>('/api/inventory/reserve', { items });
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  sendOrderConfirmation(orderId: string): Observable<void> {
    return this.http.post<void>('/api/notifications/order-confirmation', { orderId });
  }
}

// ✅ Facade: Simplifica el flujo completo
@Injectable({ providedIn: 'root' })
export class OrderFacade {
  constructor(
    private orderApi: OrderApiService,
    private payment: PaymentService,
    private inventory: InventoryService,
    private notifications: NotificationService
  ) {}

  // Método simple que orquesta el flujo completo
  placeOrder(order: Order, payment: Payment): Observable<Order> {
    return this.inventory.reserveItems(order.items).pipe(
      switchMap(() => this.orderApi.createOrder(order)),
      switchMap(createdOrder =>
        this.payment.processPayment(createdOrder.id, payment).pipe(
          map(() => createdOrder)
        )
      ),
      tap(order => this.notifications.sendOrderConfirmation(order.id)),
      catchError(error => {
        // Rollback logic
        console.error('Order failed:', error);
        return throwError(() => error);
      })
    );
  }
}

// Component solo usa el facade
@Component({...})
export class CheckoutComponent {
  constructor(private orderFacade: OrderFacade) {}

  checkout(order: Order, payment: Payment) {
    // ✅ Una sola llamada en vez de 4
    this.orderFacade.placeOrder(order, payment).subscribe({
      next: (order) => console.log('Order placed:', order),
      error: (error) => console.error('Checkout failed:', error)
    });
  }
}
```

---

### 5. Adapter Pattern

**Purpose**: Convert interface of a class into another interface

```typescript
// External library with incompatible interface
export class LegacyDateService {
  getCurrentDate(): string {
    const date = new Date();
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  parseDate(dateString: string): Date {
    const parts = dateString.split('/');
    return new Date(+parts[2], +parts[0] - 1, +parts[1]);
  }
}

// Our application interface
export interface DateService {
  now(): Date;
  parse(dateString: string): Date;
  format(date: Date): string;
}

// ✅ Adapter
@Injectable({ providedIn: 'root' })
export class DateServiceAdapter implements DateService {
  private legacyService = new LegacyDateService();

  now(): Date {
    const dateString = this.legacyService.getCurrentDate();
    return this.legacyService.parseDate(dateString);
  }

  parse(dateString: string): Date {
    return this.legacyService.parseDate(dateString);
  }

  format(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
}

// Usage
@Component({...})
export class AppComponent {
  constructor(private dateService: DateService) {}

  ngOnInit() {
    const now = this.dateService.now(); // Usa interfaz moderna
    console.log(this.dateService.format(now));
  }
}

// Real-world: Adapting third-party API
export class StripeAdapter {
  constructor(private stripe: Stripe) {}

  // Adapts Stripe's interface to our PaymentProvider interface
  async processPayment(amount: number, token: string): Promise<PaymentResult> {
    const charge = await this.stripe.charges.create({
      amount: amount * 100, // Stripe uses cents
      currency: 'usd',
      source: token
    });

    // Adapt response
    return {
      success: charge.status === 'succeeded',
      transactionId: charge.id,
      amount: charge.amount / 100 // Convert back to dollars
    };
  }
}
```

---

### 6. Decorator Pattern

**Purpose**: Add behavior to objects dynamically

```typescript
// Base interface
export interface DataSource {
  read(): Observable<any[]>;
}

// Concrete component
@Injectable()
export class ApiDataSource implements DataSource {
  constructor(private http: HttpClient) {}

  read(): Observable<any[]> {
    return this.http.get<any[]>('/api/data');
  }
}

// ✅ Decorator: Adds caching
@Injectable()
export class CachedDataSource implements DataSource {
  private cache: any[] | null = null;

  constructor(private wrapped: DataSource) {}

  read(): Observable<any[]> {
    if (this.cache) {
      return of(this.cache);
    }

    return this.wrapped.read().pipe(
      tap(data => this.cache = data)
    );
  }
}

// ✅ Decorator: Adds logging
@Injectable()
export class LoggedDataSource implements DataSource {
  constructor(
    private wrapped: DataSource,
    private logger: Logger
  ) {}

  read(): Observable<any[]> {
    this.logger.log('Reading data...');
    return this.wrapped.read().pipe(
      tap(data => this.logger.log(`Read ${data.length} items`)),
      catchError(error => {
        this.logger.error('Error reading data:', error);
        return throwError(() => error);
      })
    );
  }
}

// ✅ Decorator: Adds retry logic
@Injectable()
export class RetryDataSource implements DataSource {
  constructor(private wrapped: DataSource) {}

  read(): Observable<any[]> {
    return this.wrapped.read().pipe(
      retry({ count: 3, delay: 1000 })
    );
  }
}

// Stack decorators
export const dataSourceProviders = [
  {
    provide: DataSource,
    useFactory: (http: HttpClient, logger: Logger) => {
      // Base
      let source: DataSource = new ApiDataSource(http);

      // Add retry
      source = new RetryDataSource(source);

      // Add caching
      source = new CachedDataSource(source);

      // Add logging
      source = new LoggedDataSource(source, logger);

      return source;
    },
    deps: [HttpClient, Logger]
  }
];

// Usage is transparent
@Component({...})
export class DataComponent {
  // Receives decorated data source
  constructor(private dataSource: DataSource) {}

  loadData() {
    // Automatically has retry + cache + logging
    this.dataSource.read().subscribe();
  }
}

// Angular's built-in decorator: HTTP Interceptors
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Request:', req.url);
  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        console.log('Response:', event.status);
      }
    })
  );
};
```

---

## 🎭 Behavioral Patterns

### 7. Observer Pattern

**Purpose**: Define subscription mechanism for notifying multiple objects

#### ✅ RxJS (Angular's Native Observer)

```typescript
// Subject = Observable + Observer
@Injectable({ providedIn: "root" })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);

  // Observable stream
  items$ = this.itemsSubject.asObservable();

  // Computed observables
  totalPrice$ = this.items$.pipe(
    map((items) =>
      items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    ),
  );

  totalItems$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
  );

  addItem(item: CartItem): void {
    const current = this.itemsSubject.value;
    this.itemsSubject.next([...current, item]);
  }

  removeItem(id: string): void {
    const current = this.itemsSubject.value;
    this.itemsSubject.next(current.filter((item) => item.id !== id));
  }
}

// Multiple observers
@Component({
  selector: "app-cart-icon",
  template: ` <button>Cart ({{ totalItems$ | async }})</button> `,
})
export class CartIconComponent {
  totalItems$ = this.cartService.totalItems$;

  constructor(private cartService: CartService) {}
}

@Component({
  selector: "app-cart-summary",
  template: ` <div>Total: {{ totalPrice$ | async | currency }}</div> `,
})
export class CartSummaryComponent {
  totalPrice$ = this.cartService.totalPrice$;

  constructor(private cartService: CartService) {}
}

// Both components react to cart changes automatically
```

#### ✅ Event Emitter Pattern

```typescript
@Component({
  selector: "app-child",
  template: `<button (click)="onClick()">Click Me</button>`,
})
export class ChildComponent {
  @Output() itemSelected = new EventEmitter<string>();

  onClick() {
    this.itemSelected.emit("Item 1");
  }
}

@Component({
  selector: "app-parent",
  template: `<app-child (itemSelected)="onItemSelected($event)" />`,
})
export class ParentComponent {
  onItemSelected(item: string) {
    console.log("Selected:", item);
  }
}
```

---

### 8. Strategy Pattern

**Purpose**: Define a family of algorithms, encapsulate each one, make them interchangeable

```typescript
// Strategy interface
export interface SortStrategy<T> {
  sort(items: T[]): T[];
}

// Concrete strategies
export class AlphabeticalSortStrategy implements SortStrategy<string> {
  sort(items: string[]): string[] {
    return [...items].sort((a, b) => a.localeCompare(b));
  }
}

export class NumericSortStrategy implements SortStrategy<number> {
  sort(items: number[]): number[] {
    return [...items].sort((a, b) => a - b);
  }
}

export class DateSortStrategy implements SortStrategy<Date> {
  sort(items: Date[]): Date[] {
    return [...items].sort((a, b) => a.getTime() - b.getTime());
  }
}

// Context
@Injectable()
export class SortService<T> {
  private strategy?: SortStrategy<T>;

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(items: T[]): T[] {
    if (!this.strategy) {
      throw new Error('Sort strategy not set');
    }
    return this.strategy.sort(items);
  }
}

// Usage
@Component({...})
export class ListComponent {
  items: string[] = ['Zebra', 'Apple', 'Mango'];

  constructor(private sortService: SortService<string>) {}

  sortAlphabetically() {
    this.sortService.setStrategy(new AlphabeticalSortStrategy());
    this.items = this.sortService.sort(this.items);
  }
}

// Real-world: Validation strategy
export interface ValidationStrategy {
  validate(value: any): ValidationErrors | null;
}

export class EmailValidationStrategy implements ValidationStrategy {
  validate(value: string): ValidationErrors | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : { email: true };
  }
}

export class PasswordValidationStrategy implements ValidationStrategy {
  validate(value: string): ValidationErrors | null {
    if (value.length < 8) {
      return { minLength: true };
    }
    if (!/[A-Z]/.test(value)) {
      return { uppercase: true };
    }
    if (!/[0-9]/.test(value)) {
      return { number: true };
    }
    return null;
  }
}

// Validator function factory
export function strategyValidator(strategy: ValidationStrategy): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return strategy.validate(control.value);
  };
}

// Usage in forms
const form = new FormGroup({
  email: new FormControl('', strategyValidator(new EmailValidationStrategy())),
  password: new FormControl('', strategyValidator(new PasswordValidationStrategy()))
});
```

---

### 9. Template Method Pattern

**Purpose**: Define skeleton of algorithm, let subclasses override steps

```typescript
// Abstract class with template method
export abstract class DataProcessor {
  // ✅ Template method
  process(data: any[]): any[] {
    const validated = this.validate(data);
    const transformed = this.transform(validated);
    const filtered = this.filter(transformed);
    return this.sort(filtered);
  }

  // Steps to be implemented/overridden
  protected abstract validate(data: any[]): any[];
  protected abstract transform(data: any[]): any[];

  // Default implementations
  protected filter(data: any[]): any[] {
    return data; // No filtering by default
  }

  protected sort(data: any[]): any[] {
    return data; // No sorting by default
  }
}

// Concrete implementation
export class UserDataProcessor extends DataProcessor {
  protected validate(data: any[]): any[] {
    return data.filter(user => user.email && user.name);
  }

  protected transform(data: any[]): any[] {
    return data.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      emailLower: user.email.toLowerCase()
    }));
  }

  protected filter(data: any[]): any[] {
    // Only active users
    return data.filter(user => user.status === 'active');
  }

  protected sort(data: any[]): any[] {
    return data.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
}

// Usage
@Injectable({ providedIn: 'root' })
export class UserService {
  private processor = new UserDataProcessor();

  processUsers(users: any[]): any[] {
    return this.processor.process(users);
  }
}

// Angular example: Component lifecycle is template method
export abstract class BaseListComponent<T> implements OnInit {
  items: T[] = [];
  loading = false;

  // ✅ Template method
  ngOnInit(): void {
    this.loading = true;
    this.fetchData().subscribe({
      next: (data) => {
        this.items = this.processData(data);
        this.loading = false;
        this.onDataLoaded();
      },
      error: (error) => this.onError(error)
    });
  }

  // Abstract methods
  protected abstract fetchData(): Observable<T[]>;

  // Hook methods with default implementation
  protected processData(data: T[]): T[] {
    return data; // No processing by default
  }

  protected onDataLoaded(): void {
    // No-op by default
  }

  protected onError(error: any): void {
    console.error(error);
    this.loading = false;
  }
}

// Concrete implementation
@Component({...})
export class ProductListComponent extends BaseListComponent<Product> {
  constructor(private productService: ProductService) {
    super();
  }

  protected fetchData(): Observable<Product[]> {
    return this.productService.getProducts();
  }

  protected processData(data: Product[]): Product[] {
    // Filter out discontinued products
    return data.filter(p => !p.discontinued);
  }

  protected onDataLoaded(): void {
    console.log(`Loaded ${this.items.length} products`);
  }
}
```

---

### 10. State Pattern

**Purpose**: Allow object to alter behavior when internal state changes

```typescript
// State interface
export interface OrderState {
  cancel(order: Order): void;
  ship(order: Order): void;
  deliver(order: Order): void;
  getStatus(): string;
}

// Concrete states
export class PendingState implements OrderState {
  cancel(order: Order): void {
    console.log("Order cancelled");
    order.setState(new CancelledState());
  }

  ship(order: Order): void {
    console.log("Order shipped");
    order.setState(new ShippedState());
  }

  deliver(order: Order): void {
    throw new Error("Cannot deliver pending order");
  }

  getStatus(): string {
    return "Pending";
  }
}

export class ShippedState implements OrderState {
  cancel(order: Order): void {
    throw new Error("Cannot cancel shipped order");
  }

  ship(order: Order): void {
    throw new Error("Order already shipped");
  }

  deliver(order: Order): void {
    console.log("Order delivered");
    order.setState(new DeliveredState());
  }

  getStatus(): string {
    return "Shipped";
  }
}

export class DeliveredState implements OrderState {
  cancel(order: Order): void {
    throw new Error("Cannot cancel delivered order");
  }

  ship(order: Order): void {
    throw new Error("Order already delivered");
  }

  deliver(order: Order): void {
    throw new Error("Order already delivered");
  }

  getStatus(): string {
    return "Delivered";
  }
}

export class CancelledState implements OrderState {
  cancel(order: Order): void {
    throw new Error("Order already cancelled");
  }

  ship(order: Order): void {
    throw new Error("Cannot ship cancelled order");
  }

  deliver(order: Order): void {
    throw new Error("Cannot deliver cancelled order");
  }

  getStatus(): string {
    return "Cancelled";
  }
}

// Context
export class Order {
  private state: OrderState = new PendingState();

  setState(state: OrderState): void {
    this.state = state;
  }

  cancel(): void {
    this.state.cancel(this);
  }

  ship(): void {
    this.state.ship(this);
  }

  deliver(): void {
    this.state.deliver(this);
  }

  getStatus(): string {
    return this.state.getStatus();
  }
}

// Usage
const order = new Order();
console.log(order.getStatus()); // "Pending"

order.ship();
console.log(order.getStatus()); // "Shipped"

order.deliver();
console.log(order.getStatus()); // "Delivered"

order.cancel(); // Throws error: Cannot cancel delivered order
```

---

## 🅰️ Angular-Specific Patterns

### 11. Dependency Injection Pattern

```typescript
// ✅ Constructor injection (recommended)
@Component({...})
export class MyComponent {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
}

// ✅ inject() function (modern)
@Component({...})
export class MyComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  // Can use in initializers
  users = toSignal(this.userService.getUsers());
}

// ✅ Optional dependency
@Component({...})
export class MyComponent {
  constructor(
    @Optional() private analytics?: AnalyticsService
  ) {}

  trackEvent() {
    this.analytics?.track('event');
  }
}

// ✅ InjectionToken for non-class dependencies
export const API_URL = new InjectionToken<string>('API_URL');

// Provider
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' }
  ]
};

// Injection
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(@Inject(API_URL) private apiUrl: string) {}
}
```

---

### 12. Repository Pattern (with Signals)

```typescript
// Repository interface
export interface Repository<T, ID> {
  findAll(): Signal<T[]>;
  findById(id: ID): Signal<T | undefined>;
  create(item: Omit<T, 'id'>): Observable<T>;
  update(id: ID, item: Partial<T>): Observable<T>;
  delete(id: ID): Observable<void>;
}

// Base repository implementation
export abstract class BaseRepository<T extends { id: ID }, ID> implements Repository<T, ID> {
  private itemsSignal = signal<T[]>([]);
  private loadingSignal = signal(false);

  items = this.itemsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  constructor(
    protected http: HttpClient,
    protected endpoint: string
  ) {}

  findAll(): Signal<T[]> {
    this.loadingSignal.set(true);
    this.http.get<T[]>(this.endpoint).subscribe({
      next: (items) => {
        this.itemsSignal.set(items);
        this.loadingSignal.set(false);
      },
      error: () => this.loadingSignal.set(false)
    });
    return this.items;
  }

  findById(id: ID): Signal<T | undefined> {
    return computed(() =>
      this.items().find(item => item.id === id)
    );
  }

  create(item: Omit<T, 'id'>): Observable<T> {
    return this.http.post<T>(this.endpoint, item).pipe(
      tap(newItem => {
        this.itemsSignal.update(items => [...items, newItem]);
      })
    );
  }

  update(id: ID, item: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.endpoint}/${id}`, item).pipe(
      tap(updatedItem => {
        this.itemsSignal.update(items =>
          items.map(i => i.id === id ? updatedItem : i)
        );
      })
    );
  }

  delete(id: ID): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        this.itemsSignal.update(items => items.filter(i => i.id !== id));
      })
    );
  }
}

// Concrete repository
@Injectable({ providedIn: 'root' })
export class ProductRepository extends BaseRepository<Product, string> {
  constructor(http: HttpClient) {
    super(http, '/api/products');
  }

  // Additional methods specific to products
  findByCategory(category: string): Signal<Product[]> {
    return computed(() =>
      this.items().filter(p => p.category === category)
    );
  }
}

// Usage in component
@Component({...})
export class ProductListComponent {
  products = this.productRepo.findAll();
  loading = this.productRepo.loading;

  constructor(private productRepo: ProductRepository) {}

  deleteProduct(id: string) {
    this.productRepo.delete(id).subscribe();
  }
}
```

---

## ⚠️ Anti-patterns

### 1. God Object

```typescript
// ❌ BAD: One class does everything
export class UserService {
  getUsers() {}
  createUser() {}
  validateUser() {}
  formatUserName() {}
  sendUserEmail() {}
  logUserActivity() {}
  cacheUserData() {}
  exportUsersToCSV() {}
}

// ✅ GOOD: Split responsibilities
export class UserService {}
export class UserValidationService {}
export class UserFormatterService {}
export class UserEmailService {}
export class UserActivityLogger {}
export class UserCacheService {}
export class UserExportService {}
```

---

### 2. Pattern Overuse

```typescript
// ❌ BAD: Using pattern when not needed
export class SimpleCalculatorFactory {
  create(): Calculator {
    return new Calculator(); // Unnecessary factory
  }
}

// ✅ GOOD: Direct instantiation
const calculator = new Calculator();
```

---

## ✅ Checklist

### Creational

- [ ] Use `providedIn: 'root'` for singletons
- [ ] Factory for creating related objects
- [ ] Builder for complex object construction

### Structural

- [ ] Facade to simplify complex APIs
- [ ] Adapter to integrate third-party libraries
- [ ] Decorator (interceptors, pipe operators)

### Behavioral

- [ ] Observer (RxJS, Signals) for reactive data
- [ ] Strategy for interchangeable algorithms
- [ ] State for complex state machines

### Angular-Specific

- [ ] DI for loose coupling
- [ ] Repository for data access layer
- [ ] Smart/Presentation component split

---

## 🎓 Conclusión

Design patterns son **soluciones probadas** pero no reglas absolutas:

- **Know when to apply**: No usar patterns innecesariamente
- **Balance complexity**: Patterns agregan estructura pero también complejidad
- **Favor composition**: Compose behavior over deep inheritance
- **Use Angular's strengths**: DI, RxJS, Signals son patterns built-in

**Regla de oro**: "YAGNI" (You Aren't Gonna Need It) - No agregues patterns "por si acaso".

---

## 📚 Recursos

- Gang of Four Design Patterns: https://refactoring.guru/design-patterns
- TypeScript Design Patterns: https://www.patterns.dev/posts/classic-design-patterns
- Angular Patterns: https://angular.dev/guide/styleguide
- RxJS Patterns: https://rxjs.dev/guide/operators
