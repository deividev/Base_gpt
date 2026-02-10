# Unit Testing with Jest in Angular

## 📋 Metadata
- **Difficulty**: Intermediate-Advanced
- **Prerequisites**: component-creation.md, services.md, rxjs.md
- **Estimated Time**: 5-7 hours
- **Version**: Angular 21, Jest 29.7+, TypeScript 5.8+, Node.js 18.19+/20.11+
- **Category**: Testing

## 🎯 Learning Objectives
- Configure Jest for Angular (replacing Jasmine/Karma)
- Write unit tests for components, services, pipes, directives
- Mock dependencies and HTTP requests
- Test async code with RxJS and Signals
- Achieve meaningful code coverage
- Apply TDD (Test-Driven Development) principles

---

## ⚙️ Jest Setup for Angular

### Why Jest over Jasmine/Karma?

| Feature | Jest | Jasmine/Karma |
|---------|------|---------------|
| **Speed** | ⚡ Parallelized, cached | 🐌 Serial, slower |
| **DX** | ✅ Watch mode, snapshots | ❌ Limited features |
| **Angular 21** | ✅ Recommended | ⚠️ Deprecated |
| **Mocking** | 🎯 Built-in powerful mocks | 🔨 Manual |
| **Coverage** | 📊 Built-in | 🔌 Requires Istanbul |

---

### Installation

```bash
# Remove Jasmine/Karma
npm uninstall karma karma-jasmine jasmine-core @types/jasmine karma-chrome-launcher karma-coverage

# Install Jest (compatible with Angular 21)
npm install --save-dev jest@^29.7.0 @types/jest @angular-builders/jest@^18.0.0
npm install --save-dev jest-preset-angular@^14.0.0

# Install testing utilities
npm install --save-dev @testing-library/angular@^17.0.0 @testing-library/jest-dom
```

---

### Configuration

#### 1. angular.json

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "test": {
          "builder": "@angular-builders/jest:run",
          "options": {
            "configPath": "jest.config.js"
          }
        }
      }
    }
  }
}
```

#### 2. jest.config.js

```javascript
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/environments/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1'
  },
  transform: {
    '^.+\\.(ts|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|js)',
    '**/?(*.)+(spec|test).+(ts|js)'
  ],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs']
};
```

#### 3. setup-jest.ts

```typescript
import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Global mocks
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});
```

#### 4. tsconfig.spec.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jest", "node"],
    "esModuleInterop": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

#### 5. package.json scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

---

## 🧪 Testing Services

### Simple Service Test

```typescript
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private usersSignal = signal<User[]>([]);
  users = this.usersSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
      tap(users => this.usersSignal.set(users))
    );
  }

  addUser(user: User): void {
    this.usersSignal.update(users => [...users, user]);
  }

  getUserById(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }
}

// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadUsers', () => {
    it('should load and store users', () => {
      const mockUsers: User[] = [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' }
      ];

      service.loadUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(service.users()).toEqual(mockUsers);
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle error', () => {
      service.loadUsers().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/users');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('addUser', () => {
    it('should add user to signal', () => {
      const newUser: User = { id: '3', name: 'Charlie', email: 'charlie@example.com' };
      
      expect(service.users().length).toBe(0);
      
      service.addUser(newUser);
      
      expect(service.users().length).toBe(1);
      expect(service.users()[0]).toEqual(newUser);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', () => {
      const user: User = { id: '1', name: 'Alice', email: 'alice@example.com' };
      service.addUser(user);

      const result = service.getUserById('1');

      expect(result).toEqual(user);
    });

    it('should return undefined for non-existent id', () => {
      const result = service.getUserById('999');
      expect(result).toBeUndefined();
    });
  });
});
```

---

### Mocking Dependencies

```typescript
// order.service.ts
@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private loggerService: LoggerService
  ) {}

  createOrder(order: Order): Observable<Order> {
    const userId = this.authService.currentUser()?.id;
    
    if (!userId) {
      this.loggerService.error('User not authenticated');
      return throwError(() => new Error('Not authenticated'));
    }

    this.loggerService.info('Creating order for user:', userId);
    
    return this.http.post<Order>('/api/orders', { ...order, userId });
  }
}

// order.service.spec.ts
describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  let authServiceMock: jest.Mocked<AuthService>;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  beforeEach(() => {
    // Create mock objects
    authServiceMock = {
      currentUser: jest.fn()
    } as any;

    loggerServiceMock = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OrderService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock }
      ]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createOrder', () => {
    it('should create order when user is authenticated', () => {
      const mockUser = { id: 'user-123', name: 'Alice' };
      const orderInput = { items: ['item1'], total: 100 };
      const expectedOrder = { ...orderInput, userId: 'user-123', id: 'order-1' };

      // Setup mock
      authServiceMock.currentUser.mockReturnValue(mockUser);

      service.createOrder(orderInput as Order).subscribe(order => {
        expect(order).toEqual(expectedOrder);
        expect(loggerServiceMock.info).toHaveBeenCalledWith('Creating order for user:', 'user-123');
      });

      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ...orderInput, userId: 'user-123' });
      req.flush(expectedOrder);
    });

    it('should return error when user is not authenticated', () => {
      authServiceMock.currentUser.mockReturnValue(null);

      service.createOrder({} as Order).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Not authenticated');
          expect(loggerServiceMock.error).toHaveBeenCalledWith('User not authenticated');
        }
      });

      httpMock.expectNone('/api/orders');
    });
  });
});
```

---

## 🎨 Testing Components

### Basic Component Test

```typescript
// counter.component.ts
@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <h1>Count: {{ count() }}</h1>
      <button (click)="increment()" data-testid="increment-btn">+</button>
      <button (click)="decrement()" data-testid="decrement-btn">-</button>
      <button (click)="reset()" data-testid="reset-btn">Reset</button>
    </div>
  `
})
export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update(c => c + 1);
  }

  decrement() {
    this.count.update(c => c - 1);
  }

  reset() {
    this.count.set(0);
  }
}

// counter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial count', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Count: 0');
  });

  it('should increment count', () => {
    const incrementBtn = fixture.nativeElement.querySelector('[data-testid="increment-btn"]');
    
    incrementBtn.click();
    fixture.detectChanges();
    
    expect(component.count()).toBe(1);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Count: 1');
  });

  it('should decrement count', () => {
    component.count.set(5);
    fixture.detectChanges();

    const decrementBtn = fixture.nativeElement.querySelector('[data-testid="decrement-btn"]');
    decrementBtn.click();
    fixture.detectChanges();

    expect(component.count()).toBe(4);
  });

  it('should reset count', () => {
    component.count.set(10);
    fixture.detectChanges();

    const resetBtn = fixture.nativeElement.querySelector('[data-testid="reset-btn"]');
    resetBtn.click();
    fixture.detectChanges();

    expect(component.count()).toBe(0);
  });
});
```

---

### Component with Dependencies

```typescript
// user-list.component.ts
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading()) {
      <div>Loading...</div>
    } @else if (error()) {
      <div class="error">{{ error() }}</div>
    } @else {
      <ul>
        @for (user of users(); track user.id) {
          <li>{{ user.name }} ({{ user.email }})</li>
        }
      </ul>
    }
  `
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loading.set(true);
    this.userService.loadUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users');
        this.loading.set(false);
      }
    });
  }
}

// user-list.component.spec.ts
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceMock: jest.Mocked<UserService>;

  beforeEach(async () => {
    userServiceMock = {
      loadUsers: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should display loading state', () => {
    userServiceMock.loadUsers.mockReturnValue(new Observable(subscriber => {
      // Never completes (simulates loading)
    }));

    fixture.detectChanges(); // Triggers ngOnInit

    expect(component.loading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });

  it('should display users after loading', () => {
    const mockUsers: User[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' }
    ];

    userServiceMock.loadUsers.mockReturnValue(of(mockUsers));

    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.users()).toEqual(mockUsers);
    
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toContain('Alice');
    expect(listItems[1].textContent).toContain('Bob');
  });

  it('should display error message on failure', () => {
    userServiceMock.loadUsers.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Failed to load users');
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain('Failed to load users');
  });
});
```

---

### Testing @Input() and @Output()

```typescript
// user-card.component.ts
@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ user().name }}</h3>
      <p>{{ user().email }}</p>
      <button (click)="onDelete()" [disabled]="disabled()">Delete</button>
    </div>
  `
})
export class UserCardComponent {
  user = input.required<User>();
  disabled = input(false);
  userDeleted = output<string>();

  onDelete() {
    this.userDeleted.emit(this.user().id);
  }
}

// user-card.component.spec.ts
describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
  });

  it('should display user information', () => {
    const mockUser = { id: '1', name: 'Alice', email: 'alice@example.com' };
    
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h3').textContent).toContain('Alice');
    expect(compiled.querySelector('p').textContent).toContain('alice@example.com');
  });

  it('should emit userDeleted event on delete', () => {
    const mockUser = { id: '1', name: 'Alice', email: 'alice@example.com' };
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();

    const emitSpy = jest.fn();
    component.userDeleted.subscribe(emitSpy);

    const deleteBtn = fixture.nativeElement.querySelector('button');
    deleteBtn.click();

    expect(emitSpy).toHaveBeenCalledWith('1');
  });

  it('should disable button when disabled input is true', () => {
    const mockUser = { id: '1', name: 'Alice', email: 'alice@example.com' };
    
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const deleteBtn = fixture.nativeElement.querySelector('button');
    expect(deleteBtn.disabled).toBe(true);
  });
});
```

---

## 🧬 Testing Pipes

```typescript
// truncate.pipe.ts
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, trail: string = '...'): string {
    if (!value) return '';
    return value.length > limit 
      ? value.substring(0, limit) + trail 
      : value;
  }
}

// truncate.pipe.spec.ts
describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should truncate long text', () => {
    const longText = 'This is a very long text that needs to be truncated';
    const result = pipe.transform(longText, 20);
    expect(result).toBe('This is a very long ...');
  });

  it('should not truncate short text', () => {
    const shortText = 'Short text';
    const result = pipe.transform(shortText, 50);
    expect(result).toBe('Short text');
  });

  it('should use custom trail', () => {
    const text = 'This is a long text';
    const result = pipe.transform(text, 10, '---');
    expect(result).toBe('This is a ---');
  });

  it('should handle empty string', () => {
    const result = pipe.transform('', 10);
    expect(result).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });
});
```

---

## 🎯 Testing Directives

```typescript
// highlight.directive.ts
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appHighlight);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}

// highlight.directive.spec.ts
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HighlightDirective } from './highlight.directive';

@Component({
  standalone: true,
  imports: [HighlightDirective],
  template: `
    <div appHighlight>Default highlight</div>
    <div [appHighlight]="'red'">Red highlight</div>
  `
})
class TestComponent {}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let divs: DebugElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    divs = fixture.debugElement.queryAll(By.css('div'));
  });

  it('should highlight with default color on mouse enter', () => {
    const div = divs[0].nativeElement;

    div.dispatchEvent(new Event('mouseenter'));
    expect(div.style.backgroundColor).toBe('yellow');

    div.dispatchEvent(new Event('mouseleave'));
    expect(div.style.backgroundColor).toBe('');
  });

  it('should highlight with custom color', () => {
    const div = divs[1].nativeElement;

    div.dispatchEvent(new Event('mouseenter'));
    expect(div.style.backgroundColor).toBe('red');
  });
});
```

---

## ⏱️ Testing Async Code

### Testing Observables

```typescript
// data.service.ts
@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data').pipe(
      retry(3),
      timeout(5000),
      catchError(error => {
        console.error('Error fetching data:', error);
        return of([]);
      })
    );
  }
}

// data.service.spec.ts
import { fakeAsync, tick } from '@angular/core/testing';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retry failed requests', fakeAsync(() => {
    let result: Data[] | undefined;

    service.getData().subscribe(data => {
      result = data;
    });

    // First attempt fails
    const req1 = httpMock.expectOne('/api/data');
    req1.flush('Error', { status: 500, statusText: 'Server Error' });

    // Second attempt fails
    const req2 = httpMock.expectOne('/api/data');
    req2.flush('Error', { status: 500, statusText: 'Server Error' });

    // Third attempt fails
    const req3 = httpMock.expectOne('/api/data');
    req3.flush('Error', { status: 500, statusText: 'Server Error' });

    // Fourth attempt succeeds
    const req4 = httpMock.expectOne('/api/data');
    req4.flush([{ id: 1, name: 'Data' }]);

    tick();

    expect(result).toEqual([{ id: 1, name: 'Data' }]);
  }));

  it('should timeout after 5 seconds', fakeAsync(() => {
    let error: any;

    service.getData().subscribe({
      error: (err) => {
        error = err;
      }
    });

    const req = httpMock.expectOne('/api/data');
    // Don't respond, simulate timeout
    tick(5001);

    expect(error.name).toBe('TimeoutError');
  }));
});
```

### Testing Signals

```typescript
// cart.service.ts
@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);
  
  items = this.itemsSignal.asReadonly();
  totalPrice = computed(() => 
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  addItem(item: CartItem) {
    this.itemsSignal.update(items => [...items, item]);
  }

  removeItem(id: string) {
    this.itemsSignal.update(items => items.filter(i => i.id !== id));
  }

  clear() {
    this.itemsSignal.set([]);
  }
}

// cart.service.spec.ts
import { TestBed } from '@angular/core/testing';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should start with empty cart', () => {
    expect(service.items()).toEqual([]);
    expect(service.totalPrice()).toBe(0);
    expect(service.totalItems()).toBe(0);
  });

  it('should add item to cart', () => {
    const item: CartItem = { id: '1', name: 'Product', price: 10, quantity: 2 };
    
    service.addItem(item);
    
    expect(service.items()).toContain(item);
    expect(service.totalItems()).toBe(2);
    expect(service.totalPrice()).toBe(20);
  });

  it('should calculate total price correctly', () => {
    service.addItem({ id: '1', name: 'A', price: 10, quantity: 2 });
    service.addItem({ id: '2', name: 'B', price: 5, quantity: 3 });
    
    expect(service.totalPrice()).toBe(35); // (10*2) + (5*3)
  });

  it('should remove item from cart', () => {
    const item1 = { id: '1', name: 'A', price: 10, quantity: 1 };
    const item2 = { id: '2', name: 'B', price: 5, quantity: 1 };
    
    service.addItem(item1);
    service.addItem(item2);
    service.removeItem('1');
    
    expect(service.items()).not.toContain(item1);
    expect(service.items()).toContain(item2);
    expect(service.totalPrice()).toBe(5);
  });

  it('should clear cart', () => {
    service.addItem({ id: '1', name: 'A', price: 10, quantity: 1 });
    service.clear();
    
    expect(service.items()).toEqual([]);
    expect(service.totalPrice()).toBe(0);
  });
});
```

---

## 📸 Snapshot Testing

```typescript
// product-card.component.ts
@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `<div class="card">
      <img [src]="product().image" [alt]="product().name">
      <h3>{{ product().name }}</h3>
      <p>{{ product().description }}</p>
      <span class="price">{{ product().price | currency }}</span>
    </div>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
}

// product-card.component.spec.ts
describe('ProductCardComponent', () => {
  it('should match snapshot', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      description: 'A test product',
      price: 29.99,
      image: 'test.jpg'
    };

    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();

    expect(fixture.nativeElement).toMatchSnapshot();
  });
});
```

---

## 📊 Code Coverage

### View Coverage Report

```bash
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/app/core/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

---

## ✅ Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should calculate total price', () => {
  // Arrange
  const service = new CartService();
  const item = { id: '1', price: 10, quantity: 2 };
  
  // Act
  service.addItem(item);
  const total = service.totalPrice();
  
  // Assert
  expect(total).toBe(20);
});
```

### 2. One Assertion per Test

```typescript
// ❌ BAD: Multiple assertions
it('should handle user creation', () => {
  const user = service.createUser({ name: 'Alice' });
  expect(user.id).toBeDefined();
  expect(user.name).toBe('Alice');
  expect(user.createdAt).toBeInstanceOf(Date);
});

// ✅ GOOD: Split into separate tests
describe('createUser', () => {
  it('should generate user id', () => {
    const user = service.createUser({ name: 'Alice' });
    expect(user.id).toBeDefined();
  });

  it('should set user name', () => {
    const user = service.createUser({ name: 'Alice' });
    expect(user.name).toBe('Alice');
  });

  it('should set creation timestamp', () => {
    const user = service.createUser({ name: 'Alice' });
    expect(user.createdAt).toBeInstanceOf(Date);
  });
});
```

### 3. Test Data Builders

```typescript
// test-helpers/builders.ts
export class UserBuilder {
  private user: Partial<User> = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  withId(id: string): this {
    this.user.id = id;
    return this;
  }

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  asAdmin(): this {
    this.user.role = 'admin';
    return this;
  }

  build(): User {
    return this.user as User;
  }
}

// Usage
it('should validate admin user', () => {
  const admin = new UserBuilder()
    .withName('Admin User')
    .asAdmin()
    .build();

  expect(service.isAdmin(admin)).toBe(true);
});
```

---

## ⚠️ Common Pitfalls

### 1. Not Cleaning Up Subscriptions

```typescript
// ❌ BAD
it('should load users', () => {
  service.loadUsers().subscribe(users => {
    expect(users.length).toBeGreaterThan(0);
  });
  // Subscription never completed
});

// ✅ GOOD
it('should load users', (done) => {
  service.loadUsers().subscribe({
    next: users => {
      expect(users.length).toBeGreaterThan(0);
      done();
    },
    error: done.fail
  });
});
```

### 2. Testing Implementation Details

```typescript
// ❌ BAD: Testing private methods
it('should format date', () => {
  expect(component['formatDate'](new Date())).toBe('2024-01-01');
});

// ✅ GOOD: Test public behavior
it('should display formatted date', () => {
  component.ngOnInit();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('2024-01-01');
});
```

---

## ✅ Checklist

### Setup
- [ ] Jest configured with angular-builders/jest
- [ ] setup-jest.ts with global mocks
- [ ] Path aliases in jest.config.js
- [ ] Coverage thresholds defined

### Test Quality
- [ ] Follow AAA pattern
- [ ] One assertion per test
- [ ] Meaningful test descriptions
- [ ] Test edge cases and errors

### Coverage
- [ ] Services: 90%+ coverage
- [ ] Components: 80%+ coverage
- [ ] Pipes: 100% coverage
- [ ] Critical paths: 100% coverage

### CI/CD
- [ ] Tests run in CI pipeline
- [ ] Coverage reports generated
- [ ] Failed tests block merges

---

## 🎓 Conclusión

Unit testing con Jest en Angular:
- **Fast**: Parallelización y caching
- **Modern**: Recomendado para Angular 21
- **Powerful**: Mocking, snapshots, coverage built-in
- **Confidence**: Tests garantizan calidad y previenen regresiones

**Regla de oro**: Si el código es difícil de testear, probablemente tiene problemas de diseño.

---

## 📚 Recursos

- Jest Documentation: https://jestjs.io/
- Angular Testing: https://angular.dev/guide/testing
- @angular-builders/jest: https://github.com/just-jeb/angular-builders/tree/master/packages/jest
- Testing Library: https://testing-library.com/docs/angular-testing-library/intro/
