# Integration Testing in Angular

## 📋 Metadata
- **Difficulty**: Advanced
- **Prerequisites**: unit-testing.md, component-creation.md, routing.md
- **Estimated Time**: 4-6 hours
- **Version**: Angular 21, Jest 29.7+, TypeScript 5.8+, Node.js 18.19+/20.11+
- **Category**: Testing

## 🎯 Learning Objectives
- Test component interactions and data flow
- Test routing and navigation scenarios
- Test form submissions and validations
- Test HTTP integration with realistic mocks
- Test feature modules end-to-end
- Apply integration testing best practices

---

## 🔍 What is Integration Testing?

**Integration Testing** verifica que múltiples unidades trabajen correctamente juntas.

| Aspect | Unit Test | Integration Test |
|--------|-----------|------------------|
| **Scope** | Single unit (service, component) | Multiple units working together |
| **Dependencies** | Mocked | Some real, some mocked |
| **Speed** | ⚡ Very fast | 🏃 Fast-Medium |
| **Complexity** | Low | Medium |
| **Purpose** | Verify logic | Verify interactions |

---

## 🧩 Component Integration Testing

### Parent-Child Component Communication

```typescript
// parent.component.ts
@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [UserListComponent, UserFormComponent],
  template: `
    <div class="user-manager">
      <app-user-form (userCreated)="onUserCreated($event)" />
      <app-user-list 
        [users]="users()"
        (userDeleted)="onUserDeleted($event)" />
    </div>
  `
})
export class UserManagerComponent {
  users = signal<User[]>([]);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(
      users => this.users.set(users)
    );
  }

  onUserCreated(user: User) {
    this.userService.createUser(user).subscribe(
      created => this.users.update(users => [...users, created])
    );
  }

  onUserDeleted(id: string) {
    this.userService.deleteUser(id).subscribe(
      () => this.users.update(users => users.filter(u => u.id !== id))
    );
  }
}

// user-form.component.ts
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Name" />
      <input formControlName="email" placeholder="Email" />
      <button type="submit" [disabled]="!form.valid">Create</button>
    </form>
  `
})
export class UserFormComponent {
  userCreated = output<User>();
  
  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  onSubmit() {
    if (this.form.valid) {
      this.userCreated.emit(this.form.value as User);
      this.form.reset();
    }
  }
}

// user-list.component.ts
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <ul>
      @for (user of users(); track user.id) {
        <li>
          {{ user.name }} - {{ user.email }}
          <button (click)="deleteUser(user.id)">Delete</button>
        </li>
      }
    </ul>
  `
})
export class UserListComponent {
  users = input.required<User[]>();
  userDeleted = output<string>();

  deleteUser(id: string) {
    this.userDeleted.emit(id);
  }
}

// user-manager.component.integration.spec.ts
describe('UserManagerComponent Integration', () => {
  let fixture: ComponentFixture<UserManagerComponent>;
  let component: UserManagerComponent;
  let userServiceMock: jest.Mocked<UserService>;

  beforeEach(async () => {
    userServiceMock = {
      getUsers: jest.fn(),
      createUser: jest.fn(),
      deleteUser: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [UserManagerComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagerComponent);
    component = fixture.componentInstance;
  });

  it('should display users on init', () => {
    const mockUsers = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' }
    ];

    userServiceMock.getUsers.mockReturnValue(of(mockUsers));

    fixture.detectChanges(); // Triggers ngOnInit

    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toContain('Alice');
    expect(listItems[1].textContent).toContain('Bob');
  });

  it('should create user through form and display in list', fakeAsync(() => {
    // Initial users
    userServiceMock.getUsers.mockReturnValue(of([]));
    fixture.detectChanges();

    // Setup create mock
    const newUser = { id: '3', name: 'Charlie', email: 'charlie@example.com' };
    userServiceMock.createUser.mockReturnValue(of(newUser));

    // Fill form
    const nameInput = fixture.nativeElement.querySelector('input[placeholder="Name"]');
    const emailInput = fixture.nativeElement.querySelector('input[placeholder="Email"]');
    
    nameInput.value = 'Charlie';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.value = 'charlie@example.com';
    emailInput.dispatchEvent(new Event('input'));
    
    fixture.detectChanges();
    tick();

    // Submit form
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    
    fixture.detectChanges();
    tick();

    // Verify user was created and added to list
    expect(userServiceMock.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Charlie', email: 'charlie@example.com' })
    );
    
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain('Charlie');
  }));

  it('should delete user from list', fakeAsync(() => {
    const mockUsers = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' }
    ];

    userServiceMock.getUsers.mockReturnValue(of(mockUsers));
    userServiceMock.deleteUser.mockReturnValue(of(undefined));

    fixture.detectChanges();
    tick();

    // Click delete on first user
    const deleteButtons = fixture.nativeElement.querySelectorAll('button');
    const firstDeleteBtn = Array.from(deleteButtons).find(
      btn => (btn as HTMLElement).textContent?.includes('Delete')
    ) as HTMLElement;
    
    firstDeleteBtn.click();
    fixture.detectChanges();
    tick();

    // Verify deletion
    expect(userServiceMock.deleteUser).toHaveBeenCalledWith('1');
    
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain('Bob');
    expect(listItems[0].textContent).not.toContain('Alice');
  }));

  it('should disable submit button when form is invalid', () => {
    userServiceMock.getUsers.mockReturnValue(of([]));
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBe(true);

    // Fill with invalid data
    const nameInput = fixture.nativeElement.querySelector('input[placeholder="Name"]');
    nameInput.value = 'Al'; // Too short
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(submitBtn.disabled).toBe(true);

    // Fill with valid data
    nameInput.value = 'Alice';
    nameInput.dispatchEvent(new Event('input'));
    
    const emailInput = fixture.nativeElement.querySelector('input[placeholder="Email"]');
    emailInput.value = 'alice@example.com';
    emailInput.dispatchEvent(new Event('input'));
    
    fixture.detectChanges();

    expect(submitBtn.disabled).toBe(false);
  });
});
```

---

## 🛣️ Router Integration Testing

### Testing Navigation and Route Guards

```typescript
// products.routes.ts
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: ':id',
    component: ProductDetailComponent,
    resolve: {
      product: ProductResolver
    }
  },
  {
    path: ':id/edit',
    component: ProductEditComponent,
    canActivate: [authGuard]
  }
];

// product-list.component.ts
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Products</h1>
    <ul>
      @for (product of products(); track product.id) {
        <li>
          <a [routerLink]="['/products', product.id]">
            {{ product.name }}
          </a>
        </li>
      }
    </ul>
  `
})
export class ProductListComponent {
  products = signal<Product[]>([]);

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe(
      products => this.products.set(products)
    );
  }
}

// product-detail.component.ts
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>
      <h1>{{ product()?.name }}</h1>
      <p>{{ product()?.description }}</p>
      <p>Price: {{ product()?.price | currency }}</p>
      <a [routerLink]="['/products', product()?.id, 'edit']">Edit</a>
      <a routerLink="/products">Back to List</a>
    </div>
  `
})
export class ProductDetailComponent {
  product = signal<Product | null>(null);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get product from resolver
    this.route.data.subscribe(data => {
      this.product.set(data['product']);
    });
  }
}

// products-routing.integration.spec.ts
import { Location } from '@angular/common';
import { provideRouter, Router } from '@angular/router';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

describe('Products Routing Integration', () => {
  let router: Router;
  let location: Location;
  let productServiceMock: jest.Mocked<ProductService>;

  beforeEach(async () => {
    productServiceMock = {
      getProducts: jest.fn(),
      getProduct: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(PRODUCTS_ROUTES),
        { provide: ProductService, useValue: productServiceMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should navigate to product list', fakeAsync(() => {
    productServiceMock.getProducts.mockReturnValue(of([]));

    router.navigate(['/products']);
    tick();

    expect(location.path()).toBe('/products');
  }));

  it('should navigate to product detail', fakeAsync(() => {
    const mockProduct = { id: '123', name: 'Test Product', price: 99.99 };
    productServiceMock.getProduct.mockReturnValue(of(mockProduct));

    router.navigate(['/products', '123']);
    tick();

    expect(location.path()).toBe('/products/123');
  }));

  it('should navigate from list to detail on click', fakeAsync(() => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 10 },
      { id: '2', name: 'Product 2', price: 20 }
    ];

    productServiceMock.getProducts.mockReturnValue(of(mockProducts));
    productServiceMock.getProduct.mockReturnValue(of(mockProducts[0]));

    // Navigate to list
    router.navigate(['/products']);
    tick();

    const fixture = TestBed.createComponent(ProductListComponent);
    fixture.detectChanges();
    tick();

    // Click first product link
    const link = fixture.nativeElement.querySelector('a');
    link.click();
    tick();

    expect(location.path()).toBe('/products/1');
  }));

  it('should block navigation to edit without auth', fakeAsync(() => {
    // Mock authGuard to return false
    inject(AuthService).isAuthenticated = jest.fn().mockReturnValue(false);

    router.navigate(['/products', '123', 'edit']);
    tick();

    // Should redirect to login or stay on current page
    expect(location.path()).not.toBe('/products/123/edit');
  }));
});
```

---

## 📝 Form Integration Testing

### Complex Form with Validation

```typescript
// registration-form.component.ts
@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <input formControlName="username" placeholder="Username" />
        @if (form.get('username')?.invalid && form.get('username')?.touched) {
          <span class="error">Username is required (min 3 chars)</span>
        }
      </div>

      <div>
        <input formControlName="email" type="email" placeholder="Email" />
        @if (form.get('email')?.invalid && form.get('email')?.touched) {
          <span class="error">Valid email required</span>
        }
      </div>

      <div formGroupName="passwords">
        <input formControlName="password" type="password" placeholder="Password" />
        <input formControlName="confirmPassword" type="password" placeholder="Confirm" />
        @if (form.get('passwords')?.hasError('mismatch') && form.get('passwords')?.touched) {
          <span class="error">Passwords do not match</span>
        }
      </div>

      <button type="submit" [disabled]="!form.valid || submitting()">
        {{ submitting() ? 'Submitting...' : 'Register' }}
      </button>

      @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
      }

      @if (successMessage()) {
        <div class="success">{{ successMessage() }}</div>
      }
    </form>
  `
})
export class RegistrationFormComponent {
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    passwords: new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', Validators.required)
    }, { validators: this.passwordMatchValidator })
  });

  constructor(private authService: AuthService) {}

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { username, email, passwords } = this.form.value;
    
    this.authService.register({
      username: username!,
      email: email!,
      password: passwords!.password!
    }).subscribe({
      next: () => {
        this.successMessage.set('Registration successful!');
        this.form.reset();
        this.submitting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Registration failed');
        this.submitting.set(false);
      }
    });
  }
}

// registration-form.integration.spec.ts
describe('RegistrationFormComponent Integration', () => {
  let fixture: ComponentFixture<RegistrationFormComponent>;
  let component: RegistrationFormComponent;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [RegistrationFormComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const fillForm = (data: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    
    if (data.username !== undefined) {
      const usernameInput = inputs[0] as HTMLInputElement;
      usernameInput.value = data.username;
      usernameInput.dispatchEvent(new Event('input'));
      usernameInput.dispatchEvent(new Event('blur'));
    }

    if (data.email !== undefined) {
      const emailInput = inputs[1] as HTMLInputElement;
      emailInput.value = data.email;
      emailInput.dispatchEvent(new Event('input'));
      emailInput.dispatchEvent(new Event('blur'));
    }

    if (data.password !== undefined) {
      const passwordInput = inputs[2] as HTMLInputElement;
      passwordInput.value = data.password;
      passwordInput.dispatchEvent(new Event('input'));
      passwordInput.dispatchEvent(new Event('blur'));
    }

    if (data.confirmPassword !== undefined) {
      const confirmInput = inputs[3] as HTMLInputElement;
      confirmInput.value = data.confirmPassword;
      confirmInput.dispatchEvent(new Event('input'));
      confirmInput.dispatchEvent(new Event('blur'));
    }

    fixture.detectChanges();
  };

  it('should show validation errors for invalid fields', fakeAsync(() => {
    fillForm({ username: 'ab', email: 'invalid-email' });
    tick();

    const errors = fixture.nativeElement.querySelectorAll('.error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].textContent).toContain('Username is required');
  }));

  it('should show password mismatch error', fakeAsync(() => {
    fillForm({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'DifferentPassword'
    });
    tick();

    const errors = fixture.nativeElement.querySelectorAll('.error');
    const mismatchError = Array.from(errors).find(
      el => (el as HTMLElement).textContent?.includes('do not match')
    );
    expect(mismatchError).toBeTruthy();
  }));

  it('should enable submit button when form is valid', fakeAsync(() => {
    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBe(true);

    fillForm({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    tick();

    expect(submitBtn.disabled).toBe(false);
  }));

  it('should submit form and show success message', fakeAsync(() => {
    authServiceMock.register.mockReturnValue(of({ id: '1', username: 'testuser' }));

    fillForm({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    tick();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    tick();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    });

    fixture.detectChanges();

    const successMsg = fixture.nativeElement.querySelector('.success');
    expect(successMsg).toBeTruthy();
    expect(successMsg.textContent).toContain('Registration successful');
  }));

  it('should show error message on submission failure', fakeAsync(() => {
    authServiceMock.register.mockReturnValue(
      throwError(() => ({ message: 'Username already exists' }))
    );

    fillForm({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    tick();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    tick();
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('.error');
    expect(errorMsg.textContent).toContain('Username already exists');
    expect(component.submitting()).toBe(false);
  }));

  it('should disable submit button while submitting', fakeAsync(() => {
    authServiceMock.register.mockReturnValue(
      new Observable(subscriber => {
        setTimeout(() => subscriber.next({ id: '1' }), 1000);
      })
    );

    fillForm({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    tick();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBe(false);

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.textContent).toContain('Submitting...');

    tick(1000);
    fixture.detectChanges();

    expect(submitBtn.disabled).toBe(true); // Still disabled after form reset
  }));
});
```

---

## 🌐 HTTP Integration Testing

### Testing Real HTTP Flow with Interceptors

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redirect to login
        inject(Router).navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

// http-integration.spec.ts
describe('HTTP Integration with Interceptors', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authServiceMock: jest.Mocked<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceMock = {
      getToken: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor, errorInterceptor])
        ),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add authorization header when token exists', () => {
    authServiceMock.getToken.mockReturnValue('my-token-123');

    http.get('/api/users').subscribe();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token-123');
    req.flush([]);
  });

  it('should not add authorization header when no token', () => {
    authServiceMock.getToken.mockReturnValue(null);

    http.get('/api/users').subscribe();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should redirect to login on 401 error', fakeAsync(() => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    http.get('/api/protected').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/protected');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    tick();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));
});
```

---

## 🏗️ Feature Module Integration Testing

### Testing Complete Feature Flow

```typescript
// Complete shopping cart feature test
describe('Shopping Cart Feature Integration', () => {
  let fixture: ComponentFixture<CartPageComponent>;
  let productServiceMock: jest.Mocked<ProductService>;
  let cartServiceMock: jest.Mocked<CartService>;
  let checkoutServiceMock: jest.Mocked<CheckoutService>;

  beforeEach(async () => {
    productServiceMock = {
      getProduct: jest.fn()
    } as any;

    cartServiceMock = {
      items: signal([]),
      totalPrice: computed(() => 0),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn()
    } as any;

    checkoutServiceMock = {
      checkout: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: CheckoutService, useValue: checkoutServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartPageComponent);
  });

  it('should display cart items and total', () => {
    const mockItems = [
      { id: '1', productId: 'p1', name: 'Product 1', price: 10, quantity: 2 },
      { id: '2', productId: 'p2', name: 'Product 2', price: 20, quantity: 1 }
    ];

    cartServiceMock.items = signal(mockItems);
    cartServiceMock.totalPrice = computed(() => 40);

    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.cart-item');
    expect(items.length).toBe(2);

    const total = fixture.nativeElement.querySelector('.total');
    expect(total.textContent).toContain('40');
  });

  it('should update quantity and recalculate total', fakeAsync(() => {
    const mockItems = [
      { id: '1', productId: 'p1', name: 'Product 1', price: 10, quantity: 2 }
    ];

    cartServiceMock.items = signal(mockItems);
    cartServiceMock.totalPrice = computed(() => 20);

    fixture.detectChanges();

    // Increase quantity
    const increaseBtn = fixture.nativeElement.querySelector('.increase-qty');
    increaseBtn.click();
    tick();

    expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith('1', 3);

    // Update mock to reflect change
    mockItems[0].quantity = 3;
    cartServiceMock.items = signal(mockItems);
    cartServiceMock.totalPrice = computed(() => 30);
    
    fixture.detectChanges();

    const total = fixture.nativeElement.querySelector('.total');
    expect(total.textContent).toContain('30');
  }));

  it('should remove item from cart', fakeAsync(() => {
    const mockItems = [
      { id: '1', productId: 'p1', name: 'Product 1', price: 10, quantity: 2 },
      { id: '2', productId: 'p2', name: 'Product 2', price: 20, quantity: 1 }
    ];

    cartServiceMock.items = signal(mockItems);
    fixture.detectChanges();

    const removeBtn = fixture.nativeElement.querySelector('.remove-item');
    removeBtn.click();
    tick();

    expect(cartServiceMock.removeItem).toHaveBeenCalledWith('1');

    // Update mock
    cartServiceMock.items = signal([mockItems[1]]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.cart-item');
    expect(items.length).toBe(1);
  }));

  it('should complete checkout flow', fakeAsync(() => {
    const mockItems = [
      { id: '1', productId: 'p1', name: 'Product 1', price: 10, quantity: 2 }
    ];

    cartServiceMock.items = signal(mockItems);
    cartServiceMock.totalPrice = computed(() => 20);
    
    checkoutServiceMock.checkout.mockReturnValue(
      of({ orderId: 'order-123', status: 'success' })
    );

    fixture.detectChanges();

    const checkoutBtn = fixture.nativeElement.querySelector('.checkout-btn');
    checkoutBtn.click();
    tick();

    expect(checkoutServiceMock.checkout).toHaveBeenCalledWith(mockItems);

    fixture.detectChanges();

    const successMsg = fixture.nativeElement.querySelector('.success-message');
    expect(successMsg).toBeTruthy();
    expect(successMsg.textContent).toContain('Order placed successfully');
  }));
});
```

---

## 🎭 Testing with Real Services (Partial Integration)

```typescript
// Sometimes we want to test with real services but mock HTTP
describe('UserService with Real HTTP', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService] // Real service
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should cache users after first load', fakeAsync(() => {
    const mockUsers = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' }
    ];

    // First call
    service.loadUsers().subscribe();
    const req1 = httpMock.expectOne('/api/users');
    req1.flush(mockUsers);
    tick();

    expect(service.users()).toEqual(mockUsers);

    // Second call should use cache (no HTTP request)
    service.loadUsers().subscribe();
    httpMock.expectNone('/api/users');
    tick();

    expect(service.users()).toEqual(mockUsers);
  }));
});
```

---

## 🧪 Testing Async Pipes and Observables

```typescript
// async-data.component.ts
@Component({
  selector: 'app-async-data',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  template: `
    @if (data$ | async; as data) {
      <ul>
        @for (item of data; track item.id) {
          <li>{{ item.name }}</li>
        }
      </ul>
    } @else {
      <div>Loading...</div>
    }
  `
})
export class AsyncDataComponent {
  data$: Observable<Item[]>;

  constructor(private dataService: DataService) {
    this.data$ = this.dataService.getData();
  }
}

// async-data.component.spec.ts
describe('AsyncDataComponent', () => {
  it('should display data from observable', fakeAsync(() => {
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ];

    const dataServiceMock = {
      getData: jest.fn().mockReturnValue(of(mockData).pipe(delay(100)))
    };

    TestBed.configureTestingModule({
      imports: [AsyncDataComponent],
      providers: [
        { provide: DataService, useValue: dataServiceMock }
      ]
    });

    const fixture = TestBed.createComponent(AsyncDataComponent);
    fixture.detectChanges();

    // Initially shows loading
    expect(fixture.nativeElement.textContent).toContain('Loading...');

    tick(100);
    fixture.detectChanges();

    // After delay shows data
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Item 1');
  }));
});
```

---

## ✅ Best Practices

### 1. Test User Flows, Not Implementation

```typescript
// ❌ BAD: Testing implementation details
it('should call loadUsers method', () => {
  spyOn(component, 'loadUsers');
  component.ngOnInit();
  expect(component.loadUsers).toHaveBeenCalled();
});

// ✅ GOOD: Testing user-visible behavior
it('should display users after page loads', () => {
  mockService.getUsers.mockReturnValue(of([...]));
  fixture.detectChanges();
  
  const users = fixture.nativeElement.querySelectorAll('.user-card');
  expect(users.length).toBeGreaterThan(0);
});
```

### 2. Use Page Object Pattern

```typescript
// page-objects/login-page.po.ts
export class LoginPageObject {
  constructor(private fixture: ComponentFixture<LoginComponent>) {}

  get usernameInput(): HTMLInputElement {
    return this.fixture.nativeElement.querySelector('#username');
  }

  get passwordInput(): HTMLInputElement {
    return this.fixture.nativeElement.querySelector('#password');
  }

  get submitButton(): HTMLButtonElement {
    return this.fixture.nativeElement.querySelector('button[type="submit"]');
  }

  get errorMessage(): HTMLElement | null {
    return this.fixture.nativeElement.querySelector('.error-message');
  }

  fillUsername(username: string): void {
    this.usernameInput.value = username;
    this.usernameInput.dispatchEvent(new Event('input'));
  }

  fillPassword(password: string): void {
    this.passwordInput.value = password;
    this.passwordInput.dispatchEvent(new Event('input'));
  }

  submit(): void {
    this.submitButton.click();
  }

  login(username: string, password: string): void {
    this.fillUsername(username);
    this.fillPassword(password);
    this.submit();
  }
}

// login.component.spec.ts
describe('LoginComponent', () => {
  let page: LoginPageObject;

  beforeEach(() => {
    const fixture = TestBed.createComponent(LoginComponent);
    page = new LoginPageObject(fixture);
  });

  it('should show error for invalid credentials', fakeAsync(() => {
    authServiceMock.login.mockReturnValue(
      throwError(() => ({ message: 'Invalid credentials' }))
    );

    page.login('user', 'wrong-password');
    tick();
    fixture.detectChanges();

    expect(page.errorMessage?.textContent).toContain('Invalid credentials');
  }));
});
```

### 3. Test Edge Cases

```typescript
describe('CartComponent edge cases', () => {
  it('should handle empty cart', () => {
    cartService.items = signal([]);
    fixture.detectChanges();

    const emptyMessage = fixture.nativeElement.querySelector('.empty-cart');
    expect(emptyMessage).toBeTruthy();
  });

  it('should handle large quantities', () => {
    const item = { id: '1', name: 'Product', price: 10, quantity: 999 };
    cartService.items = signal([item]);
    cartService.totalPrice = computed(() => 9990);
    
    fixture.detectChanges();

    const total = fixture.nativeElement.querySelector('.total');
    expect(total.textContent).toContain('9990');
  });

  it('should handle network errors gracefully', fakeAsync(() => {
    cartService.checkout.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    const checkoutBtn = fixture.nativeElement.querySelector('.checkout-btn');
    checkoutBtn.click();
    tick();
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('.error');
    expect(errorMsg).toBeTruthy();
  }));
});
```

---

## ✅ Checklist

### Component Integration
- [ ] Test parent-child communication
- [ ] Test @Input() and @Output()
- [ ] Test form submissions with validation
- [ ] Test async data loading and display

### Routing Integration
- [ ] Test navigation between routes
- [ ] Test route guards and resolvers
- [ ] Test query params and route params
- [ ] Test redirects

### HTTP Integration
- [ ] Test interceptors
- [ ] Test error handling
- [ ] Test retry logic
- [ ] Test caching

### Feature Integration
- [ ] Test complete user flows
- [ ] Test state management across components
- [ ] Test real service interactions
- [ ] Test edge cases and error scenarios

---

## 🎓 Conclusión

Integration testing en Angular:
- **Scope**: Prueba interacciones entre múltiples componentes/servicios
- **Balance**: Combina real dependencies con mocks estratégicos
- **Coverage**: Complementa unit tests con flujos end-to-end
- **Confidence**: Asegura que las piezas funcionan juntas

**Regla de oro**: Si unit tests verifican que cada pieza funciona, integration tests verifican que funcionan **juntas**.

---

## 📚 Recursos

- Angular Testing Guide: https://angular.dev/guide/testing
- Testing Library: https://testing-library.com/docs/angular-testing-library/intro
- Jest Documentation: https://jestjs.io/
- Component Harnesses: https://material.angular.io/guide/using-component-harnesses
