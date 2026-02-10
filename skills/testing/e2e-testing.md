# End-to-End Testing in Angular

## 📋 Metadata
- **Difficulty**: Advanced
- **Prerequisites**: unit-testing.md, integration-testing.md, routing.md
- **Estimated Time**: 6-8 hours
- **Version**: Angular 21, Cypress 13.16+, Playwright 1.48+, TypeScript 5.8+, Node.js 18.19+/20.11+
- **Category**: Testing

## 🎯 Learning Objectives
- Set up E2E testing with Cypress and Playwright
- Write user journey tests from end to end
- Test complex interactions and workflows
- Handle authentication and API mocking
- Implement page object pattern for E2E
- Run E2E tests in CI/CD pipelines

---

## 🔍 What is E2E Testing?

**End-to-End Testing** simula comportamiento real del usuario en un navegador real.

| Aspect | Unit | Integration | E2E |
|--------|------|-------------|-----|
| **Scope** | Single unit | Multiple units | Complete app |
| **Execution** | In-memory | In-memory | Real browser |
| **Speed** | ⚡ Very fast | 🏃 Fast | 🐢 Slow |
| **Reliability** | High | High | Medium (flaky) |
| **Cost** | Low | Medium | High |
| **Confidence** | Low | Medium | **Very High** |

**Testing Pyramid**:
```
    /\
   /E2E\      ← Few, critical flows
  /------\
 /Integration\  ← More, feature tests
/------------\
/   Unit      \ ← Many, all logic
```

---

## 🎭 Cypress Setup

### Installation

```bash
# Install Cypress (compatible with Angular 21)
npm install --save-dev cypress@^13.16.0

# Install type definitions
npm install --save-dev @types/cypress

# Initialize Cypress
npx cypress open
```

### Configuration

#### cypress.config.ts

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts'
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack'
    },
    specPattern: '**/*.cy.ts'
  }
});
```

#### cypress/support/commands.ts

```typescript
// Custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('not.include', '/login');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});
```

#### package.json scripts

```json
{
  "scripts": {
    "e2e": "cypress open",
    "e2e:headless": "cypress run",
    "e2e:chrome": "cypress run --browser chrome",
    "e2e:firefox": "cypress run --browser firefox"
  }
}
```

---

## 📝 Basic Cypress Tests

### Simple Navigation Test

```typescript
// cypress/e2e/navigation.cy.ts
describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to home page', () => {
    cy.url().should('include', '/');
    cy.get('h1').should('contain', 'Welcome');
  });

  it('should navigate to products page', () => {
    cy.getByTestId('products-link').click();
    cy.url().should('include', '/products');
    cy.get('h1').should('contain', 'Products');
  });

  it('should navigate to product detail', () => {
    cy.visit('/products');
    cy.getByTestId('product-card').first().click();
    cy.url().should('match', /\/products\/\d+/);
    cy.getByTestId('product-title').should('be.visible');
  });
});
```

---

### Form Submission Test

```typescript
// cypress/e2e/contact-form.cy.ts
describe('Contact Form', () => {
  beforeEach(() => {
    cy.visit('/contact');
  });

  it('should show validation errors for empty form', () => {
    cy.getByTestId('submit-button').click();
    
    cy.getByTestId('name-error').should('be.visible');
    cy.getByTestId('email-error').should('be.visible');
    cy.getByTestId('message-error').should('be.visible');
  });

  it('should show error for invalid email', () => {
    cy.getByTestId('email-input').type('invalid-email');
    cy.getByTestId('email-input').blur();
    
    cy.getByTestId('email-error')
      .should('be.visible')
      .and('contain', 'valid email');
  });

  it('should submit form successfully', () => {
    // Intercept API call
    cy.intercept('POST', '/api/contact', {
      statusCode: 200,
      body: { success: true, message: 'Message sent' }
    }).as('submitContact');

    // Fill form
    cy.getByTestId('name-input').type('John Doe');
    cy.getByTestId('email-input').type('john@example.com');
    cy.getByTestId('message-input').type('This is a test message');
    
    // Submit
    cy.getByTestId('submit-button').click();

    // Wait for API call
    cy.wait('@submitContact');

    // Verify success message
    cy.getByTestId('success-message')
      .should('be.visible')
      .and('contain', 'Message sent');

    // Form should be reset
    cy.getByTestId('name-input').should('have.value', '');
  });

  it('should handle submission error', () => {
    cy.intercept('POST', '/api/contact', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('submitContactError');

    cy.getByTestId('name-input').type('John Doe');
    cy.getByTestId('email-input').type('john@example.com');
    cy.getByTestId('message-input').type('This is a test message');
    cy.getByTestId('submit-button').click();

    cy.wait('@submitContactError');

    cy.getByTestId('error-message')
      .should('be.visible')
      .and('contain', 'error');
  });
});
```

---

### Authentication Flow

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    // Clear session storage
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
  });

  it('should login successfully', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      }
    }).as('login');

    cy.visit('/login');

    cy.getByTestId('email-input').type('test@example.com');
    cy.getByTestId('password-input').type('Password123');
    cy.getByTestId('login-button').click();

    cy.wait('@login');

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Should show user name
    cy.getByTestId('user-name').should('contain', 'Test User');
  });

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('loginError');

    cy.visit('/login');

    cy.getByTestId('email-input').type('test@example.com');
    cy.getByTestId('password-input').type('WrongPassword');
    cy.getByTestId('login-button').click();

    cy.wait('@loginError');

    cy.getByTestId('error-message')
      .should('be.visible')
      .and('contain', 'Invalid credentials');

    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    // Login first
    cy.login('test@example.com', 'Password123');

    cy.visit('/dashboard');

    cy.getByTestId('logout-button').click();

    // Should redirect to login
    cy.url().should('include', '/login');

    // Try to access protected page
    cy.visit('/dashboard');

    // Should redirect to login (guard)
    cy.url().should('include', '/login');
  });

  it('should persist session after page refresh', () => {
    cy.login('test@example.com', 'Password123');

    cy.visit('/dashboard');
    cy.getByTestId('user-name').should('be.visible');

    // Refresh page
    cy.reload();

    // Should still be logged in
    cy.url().should('include', '/dashboard');
    cy.getByTestId('user-name').should('be.visible');
  });
});
```

---

## 🎨 Page Object Pattern in Cypress

### Page Objects

```typescript
// cypress/support/page-objects/login.page.ts
export class LoginPage {
  visit() {
    cy.visit('/login');
  }

  getEmailInput() {
    return cy.getByTestId('email-input');
  }

  getPasswordInput() {
    return cy.getByTestId('password-input');
  }

  getLoginButton() {
    return cy.getByTestId('login-button');
  }

  getErrorMessage() {
    return cy.getByTestId('error-message');
  }

  fillEmail(email: string) {
    this.getEmailInput().clear().type(email);
  }

  fillPassword(password: string) {
    this.getPasswordInput().clear().type(password);
  }

  submit() {
    this.getLoginButton().click();
  }

  login(email: string, password: string) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
  }
}

// cypress/support/page-objects/products.page.ts
export class ProductsPage {
  visit() {
    cy.visit('/products');
  }

  getSearchInput() {
    return cy.getByTestId('search-input');
  }

  getProductCards() {
    return cy.getByTestId('product-card');
  }

  getProductCard(index: number) {
    return this.getProductCards().eq(index);
  }

  searchProducts(query: string) {
    this.getSearchInput().clear().type(query);
  }

  clickProduct(index: number) {
    this.getProductCard(index).click();
  }

  addToCart(productIndex: number) {
    this.getProductCard(productIndex)
      .find('[data-testid="add-to-cart"]')
      .click();
  }
}
```

### Using Page Objects

```typescript
// cypress/e2e/shopping-flow.cy.ts
import { LoginPage } from '../support/page-objects/login.page';
import { ProductsPage } from '../support/page-objects/products.page';
import { CartPage } from '../support/page-objects/cart.page';
import { CheckoutPage } from '../support/page-objects/checkout.page';

describe('Complete Shopping Flow', () => {
  const loginPage = new LoginPage();
  const productsPage = new ProductsPage();
  const cartPage = new CartPage();
  const checkoutPage = new CheckoutPage();

  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/products', { fixture: 'products.json' });
    cy.intercept('POST', '/api/cart/add', { statusCode: 200 });
    cy.intercept('POST', '/api/checkout', { 
      statusCode: 200,
      body: { orderId: '12345', status: 'success' }
    });
  });

  it('should complete purchase from login to checkout', () => {
    // Step 1: Login
    loginPage.visit();
    loginPage.login('test@example.com', 'Password123');

    cy.url().should('not.include', '/login');

    // Step 2: Browse products
    productsPage.visit();
    productsPage.searchProducts('laptop');
    productsPage.getProductCards().should('have.length.greaterThan', 0);

    // Step 3: Add to cart
    productsPage.addToCart(0);
    cy.getByTestId('cart-badge').should('contain', '1');

    // Step 4: View cart
    cartPage.visit();
    cartPage.getCartItems().should('have.length', 1);
    cartPage.getTotalPrice().should('be.visible');

    // Step 5: Proceed to checkout
    cartPage.proceedToCheckout();

    // Step 6: Fill checkout form
    checkoutPage.fillShippingInfo({
      name: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      zipCode: '10001'
    });

    checkoutPage.fillPaymentInfo({
      cardNumber: '4242424242424242',
      expiry: '12/25',
      cvv: '123'
    });

    // Step 7: Complete order
    checkoutPage.submitOrder();

    // Step 8: Verify success
    cy.getByTestId('order-success').should('be.visible');
    cy.getByTestId('order-id').should('contain', '12345');
  });
});
```

---

## 🚀 Playwright Setup

### Installation

```bash
# Install Playwright (compatible with Angular 21)
npm install --save-dev @playwright/test@^1.48.0

# Install browsers
npx playwright install

# Generate config
npx playwright codegen localhost:4200
```

### Configuration

#### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI
  }
});
```

---

## 📝 Playwright Tests

### Basic Playwright Test

```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Products' }).click();
    
    await expect(page).toHaveURL(/.*products/);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/products');
    
    await page.getByRole('link', { name: 'Home' }).click();
    
    await expect(page).toHaveURL('/');
  });
});
```

### Form Testing with Playwright

```typescript
// e2e/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should submit form successfully', async ({ page }) => {
    // Mock API
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Fill form
    await page.getByLabel('Name').fill('John Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByLabel('Message').fill('Test message');

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify success
    await expect(page.getByText('Message sent successfully')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
  });
});
```

### Authentication with Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User' }
        })
      });
    });

    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Test User')).toBeVisible();
  });

  test('should logout', async ({ page, context }) => {
    // Set auth state
    await context.addCookies([
      { name: 'auth_token', value: 'fake-token', domain: 'localhost', path: '/' }
    ]);

    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL('/login');
  });
});
```

---

## 🎭 Page Object Pattern in Playwright

### Page Objects

```typescript
// e2e/page-objects/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}

// e2e/page-objects/products.page.ts
export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly productCards: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search products');
    this.productCards = page.getByTestId('product-card');
    this.cartBadge = page.getByTestId('cart-badge');
  }

  async goto() {
    await this.page.goto('/products');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async addToCart(productIndex: number) {
    await this.productCards.nth(productIndex)
      .getByRole('button', { name: 'Add to Cart' })
      .click();
  }

  async getCartItemCount(): Promise<string> {
    return await this.cartBadge.textContent() || '0';
  }
}
```

### Using Page Objects

```typescript
// e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { ProductsPage } from './page-objects/products.page';

test.describe('Shopping Flow', () => {
  test('should add product to cart after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);

    // Mock APIs
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ token: 'token', user: { id: '1' } })
      });
    });

    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: '1', name: 'Product 1', price: 99.99 },
          { id: '2', name: 'Product 2', price: 49.99 }
        ])
      });
    });

    // Login
    await loginPage.goto();
    await loginPage.login('test@example.com', 'Password123');

    // Browse products
    await productsPage.goto();
    await expect(productsPage.productCards).toHaveCount(2);

    // Add to cart
    await productsPage.addToCart(0);

    // Verify cart badge
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe('1');
  });
});
```

---

## 🌐 API Mocking & Fixtures

### Cypress Fixtures

```json
// cypress/fixtures/products.json
[
  {
    "id": "1",
    "name": "Laptop",
    "price": 999.99,
    "description": "High-performance laptop",
    "image": "laptop.jpg"
  },
  {
    "id": "2",
    "name": "Mouse",
    "price": 29.99,
    "description": "Wireless mouse",
    "image": "mouse.jpg"
  }
]
```

```typescript
// cypress/e2e/products.cy.ts
describe('Products with fixtures', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/products', { fixture: 'products.json' }).as('getProducts');
    cy.visit('/products');
    cy.wait('@getProducts');
  });

  it('should display products from fixture', () => {
    cy.getByTestId('product-card').should('have.length', 2);
    cy.contains('Laptop').should('be.visible');
    cy.contains('Mouse').should('be.visible');
  });
});
```

### Playwright Mock Handlers

```typescript
// e2e/helpers/mock-api.ts
import { Page } from '@playwright/test';

export class MockAPI {
  constructor(private page: Page) {}

  async mockProducts(products: Product[]) {
    await this.page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(products)
      });
    });
  }

  async mockLogin(user: User) {
    await this.page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ token: 'fake-token', user })
      });
    });
  }

  async mockError(endpoint: string, status: number, message: string) {
    await this.page.route(endpoint, async (route) => {
      await route.fulfill({
        status,
        body: JSON.stringify({ error: message })
      });
    });
  }
}

// Usage
test('should handle products', async ({ page }) => {
  const mockAPI = new MockAPI(page);
  
  await mockAPI.mockProducts([
    { id: '1', name: 'Product 1', price: 99.99 }
  ]);

  await page.goto('/products');
  // Test continues...
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build app
        run: npm run build
        
      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          start: npm start
          wait-on: 'http://localhost:4200'
          browser: chrome
          
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
          
      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos

  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: npx playwright test
        
      - name: Upload test report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## ⚡ Best Practices

### 1. Use Data-TestID Attributes

```typescript
// ✅ GOOD: Stable selectors
<button data-testid="submit-button">Submit</button>

cy.getByTestId('submit-button').click();

// ❌ BAD: Fragile selectors
cy.get('.btn.btn-primary.mt-3').click();
```

### 2. Wait for Network Requests

```typescript
// ✅ GOOD: Wait for API
cy.intercept('GET', '/api/users').as('getUsers');
cy.visit('/users');
cy.wait('@getUsers');

// ❌ BAD: Hard-coded waits
cy.wait(3000);
```

### 3. Test User Flows, Not Implementation

```typescript
// ✅ GOOD: User perspective
test('should complete checkout', async ({ page }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByLabel('Card Number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Pay' }).click();
  await expect(page.getByText('Order successful')).toBeVisible();
});

// ❌ BAD: Testing internals
test('should call checkout API', async ({ page }) => {
  // Don't test implementation details
});
```

### 4. Isolate Tests

```typescript
// ✅ GOOD: Clean state per test
beforeEach(() => {
  cy.clearAllSessionStorage();
  cy.clearAllLocalStorage();
});

// ❌ BAD: Tests depend on each other
test('add item'); // Test 1
test('checkout'); // Test 2 depends on Test 1
```

---

## ✅ Checklist

### Setup
- [ ] Cypress or Playwright configured
- [ ] Custom commands/helpers created
- [ ] Page objects implemented
- [ ] API mocking configured

### Test Coverage
- [ ] Critical user journeys tested
- [ ] Authentication flows covered
- [ ] Form submissions tested
- [ ] Error scenarios handled

### Performance
- [ ] Tests run in parallel
- [ ] API responses mocked
- [ ] Unnecessary waits removed
- [ ] Flaky tests fixed

### CI/CD
- [ ] E2E tests run on PRs
- [ ] Screenshots on failure
- [ ] Videos recorded
- [ ] Test reports published

---

## 🎓 Conclusión

E2E testing brinda máxima confianza:
- **Real user simulation**: Prueba en navegador real
- **Critical flows**: Enfócate en journeys importantes
- **Catch integration bugs**: Detecta problemas que unit tests no ven
- **Expensive but valuable**: Usa estratégicamente

**Regla de oro**: E2E tests son caros - úsalos para flujos críticos, no para todo.

---

## 📚 Recursos

- Cypress: https://www.cypress.io/
- Playwright: https://playwright.dev/
- Testing Library: https://testing-library.com/
- Angular E2E Guide: https://angular.dev/guide/testing
