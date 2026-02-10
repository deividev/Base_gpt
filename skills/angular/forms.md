# Angular Reactive Forms

## 📋 Información

- **Skill ID**: `angular/forms`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Crítica
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar Reactive Forms para crear formularios robustos, validados, dinámicos y type-safe con excelente UX.

---

## ✅ Configuración Básica

### 1. Proveer Reactive Forms

```typescript
// main.ts (para standalone apps)
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

// Reactive Forms Module no necesita provider - se importa directamente
```

### 2. Importar en Componente

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<!-- your form -->`,
})
export class UserFormComponent {}
```

---

## 📝 FormGroup y FormControl Básico

### Creación Manual

```typescript
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          type="email" 
          formControlName="email"
          [class.invalid]="emailControl.invalid && emailControl.touched"
        />
        @if (emailControl.invalid && emailControl.touched) {
          <span class="error">
            @if (emailControl.hasError('required')) {
              Email is required
            }
            @if (emailControl.hasError('email')) {
              Invalid email format
            }
          </span>
        }
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          type="password" 
          formControlName="password"
        />
        @if (passwordControl.invalid && passwordControl.touched) {
          <span class="error">
            @if (passwordControl.hasError('required')) {
              Password is required
            }
            @if (passwordControl.hasError('minlength')) {
              Password must be at least 6 characters
            }
          </span>
        }
      </div>

      <button 
        type="submit" 
        [disabled]="loginForm.invalid || isSubmitting()"
      >
        @if (isSubmitting()) {
          Logging in...
        } @else {
          Login
        }
      </button>
    </form>
  `,
})
export class LoginComponent {
  isSubmitting = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minlength(6)]),
  });

  // Acceso directo a controles
  get emailControl() {
    return this.loginForm.get('email')!;
  }

  get passwordControl() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      console.log(this.loginForm.value);
      
      // Simular API call
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.loginForm.reset();
      }, 2000);
    }
  }
}
```

### Con FormBuilder (Recomendado)

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({})
export class UserFormComponent {
  private fb = inject(FormBuilder);

  // Typed form
  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    age: [null as number | null, [Validators.required, Validators.min(18)]],
    address: this.fb.group({
      street: [''],
      city: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    }),
  });

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      console.log(formValue);
    }
  }
}
```

---

## ✨ Typed Forms (Angular 14+)

```typescript
import { FormControl, FormGroup } from '@angular/forms';

interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
}

@Component({})
export class TypedFormComponent {
  userForm = new FormGroup<UserForm>({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    age: new FormControl<number | null>(null),
  });

  onSubmit() {
    // value es type-safe
    const value = this.userForm.value;
    console.log(value.name); // string
    console.log(value.age);  // number | null
  }
}
```

---

## 🔢 FormArray (Listas Dinámicas)

```typescript
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

interface PhoneNumber {
  type: string;
  number: string;
}

@Component({
  template: `
    <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
      <div formArrayName="phoneNumbers">
        @for (phone of phoneNumbers.controls; track $index) {
          <div [formGroupName]="$index" class="phone-group">
            <select formControlName="type">
              <option value="mobile">Mobile</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
            </select>
            
            <input 
              type="tel" 
              formControlName="number" 
              placeholder="Phone number"
            />
            
            <button 
              type="button" 
              (click)="removePhone($index)"
              [disabled]="phoneNumbers.length === 1"
            >
              Remove
            </button>
          </div>
        }
      </div>

      <button type="button" (click)="addPhone()">
        Add Phone Number
      </button>

      <button type="submit" [disabled]="contactForm.invalid">
        Submit
      </button>
    </form>
  `,
})
export class ContactFormComponent {
  private fb = inject(FormBuilder);

  contactForm = this.fb.group({
    name: ['', Validators.required],
    phoneNumbers: this.fb.array([
      this.createPhone(),
    ]),
  });

  get phoneNumbers(): FormArray {
    return this.contactForm.get('phoneNumbers') as FormArray;
  }

  createPhone(): FormGroup {
    return this.fb.group({
      type: ['mobile', Validators.required],
      number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  addPhone() {
    this.phoneNumbers.push(this.createPhone());
  }

  removePhone(index: number) {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  onSubmit() {
    console.log(this.contactForm.value);
  }
}
```

---

## ✅ Validadores Custom

### Validator Síncrono

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Password match validator
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  };
}

// Uso en formulario
@Component({})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, {
    validators: [passwordMatchValidator()],
  });

  // En template
  get passwordMismatch() {
    return this.registerForm.hasError('passwordMismatch') && 
           this.registerForm.get('confirmPassword')?.touched;
  }
}
```

### Validador Personalizado con Parámetros

```typescript
export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    return age >= minAge 
      ? null 
      : { minAge: { required: minAge, actual: age } };
  };
}

// Uso
this.fb.group({
  birthDate: ['', [Validators.required, minAgeValidator(18)]],
});
```

### Validador Async (para verificación en servidor)

```typescript
import { AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first } from 'rxjs/operators';

export function uniqueEmailValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      debounceTime(500), // Esperar 500ms después de que el usuario deje de escribir
      switchMap(email => 
        userService.checkEmailExists(email).pipe(
          map(exists => exists ? { emailTaken: true } : null),
          catchError(() => of(null))
        )
      ),
      first()
    );
  };
}

// Uso
@Component({})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  registerForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email],
      [uniqueEmailValidator(this.userService)], // Async validator
    ],
  });

  get emailControl() {
    return this.registerForm.get('email')!;
  }

  get emailPending() {
    return this.emailControl.status === 'PENDING';
  }

  get emailTaken() {
    return this.emailControl.hasError('emailTaken');
  }
}
```

---

## 🎨 Formularios Dinámicos

```typescript
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select';
  required: boolean;
  options?: string[]; // Para selects
}

@Component({
  template: `
    <form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()">
      @for (field of fields; track field.name) {
        <div class="form-group">
          <label [for]="field.name">
            {{ field.label }}
            @if (field.required) {
              <span class="required">*</span>
            }
          </label>

          @switch (field.type) {
            @case ('select') {
              <select [id]="field.name" [formControlName]="field.name">
                @for (option of field.options; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
            }
            @default {
              <input 
                [id]="field.name"
                [type]="field.type"
                [formControlName]="field.name"
              />
            }
          }

          @if (dynamicForm.get(field.name)?.invalid && 
               dynamicForm.get(field.name)?.touched) {
            <span class="error">
              {{ field.label }} is required
            </span>
          }
        </div>
      }

      <button type="submit" [disabled]="dynamicForm.invalid">
        Submit
      </button>
    </form>
  `,
})
export class DynamicFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  fields: FormField[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'age', label: 'Age', type: 'number', required: false },
    { 
      name: 'country', 
      label: 'Country', 
      type: 'select', 
      required: true,
      options: ['USA', 'Canada', 'Mexico', 'Spain'],
    },
  ];

  dynamicForm!: FormGroup;

  ngOnInit() {
    this.dynamicForm = this.createFormFromFields(this.fields);
  }

  createFormFromFields(fields: FormField[]): FormGroup {
    const group: any = {};

    fields.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      group[field.name] = ['', validators];
    });

    return this.fb.group(group);
  }

  onSubmit() {
    console.log(this.dynamicForm.value);
  }
}
```

---

## 🔄 Value Changes y Status Changes

```typescript
@Component({})
export class FormObservablesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  searchForm = this.fb.group({
    query: [''],
    category: ['all'],
  });

  ngOnInit() {
    // Escuchar cambios en un control específico
    this.searchForm.get('query')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(query => {
        console.log('Search query:', query);
        this.performSearch(query);
      });

    // Escuchar cambios en todo el formulario
    this.searchForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        console.log('Form value:', value);
      });

    // Escuchar cambios de estado
    this.searchForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => {
        console.log('Form status:', status); // 'VALID', 'INVALID', 'PENDING'
      });
  }

  performSearch(query: string | null) {
    // Implementar búsqueda
  }
}
```

---

## 🎯 Gestión de Estado con Signals

```typescript
@Component({})
export class FormWithSignalsComponent {
  private fb = inject(FormBuilder);

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  // Estado con signals
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  // Computed para habilitar submit
  canSubmit = computed(() => 
    this.userForm.valid && !this.isSubmitting()
  );

  async onSubmit() {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    try {
      const result = await this.saveUser(this.userForm.value);
      this.submitSuccess.set(true);
      this.userForm.reset();
    } catch (error) {
      this.submitError.set(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async saveUser(data: any): Promise<any> {
    // Implementar guardado
    return Promise.resolve(data);
  }
}
```

---

## 📋 Checklist

- [ ] ReactiveFormsModule importado
- [ ] FormBuilder usado para crear formularios
- [ ] Validadores aplicados correctamente
- [ ] Mensajes de error mostrados por campo
- [ ] FormArray para listas dinámicas
- [ ] Validadores custom cuando sea necesario
- [ ] Async validators para validación en servidor
- [ ] Loading states durante submission
- [ ] Form reset después de submit exitoso
- [ ] Unsubscribe de valueChanges con takeUntilDestroyed

---

## 🚫 Anti-Patrones

### ❌ No usar Template-driven forms para formularios complejos

```typescript
// ❌ INCORRECTO - Template-driven para formularios complejos
<input [(ngModel)]="user.name" name="name" required />

// ✅ CORRECTO - Reactive forms
<input formControlName="name" />
```

### ❌ No acceder a controles sin verificar null

```typescript
// ❌ INCORRECTO
get nameControl() {
  return this.form.get('name'); // Puede ser null
}

// ✅ CORRECTO
get nameControl() {
  return this.form.get('name')!; // Non-null assertion
}
```

### ❌ No olvidar unsubscribe

```typescript
// ❌ INCORRECTO
ngOnInit() {
  this.form.valueChanges.subscribe(/* ... */); // Memory leak
}

// ✅ CORRECTO
ngOnInit() {
  this.form.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(/* ... */);
}
```

---

## 🔗 Skills Relacionadas

- `angular/component-creation` - Componentes con formularios
- `angular/services` - Servicios para guardar datos
- `angular/http-client` - Submit a APIs
- `angular/signal-patterns` - Estado con signals

---

## 📚 Referencias

- [Angular Reactive Forms Guide](https://angular.dev/guide/forms/reactive-forms)
- [Form Validation](https://angular.dev/guide/forms/form-validation)
- [Dynamic Forms](https://angular.dev/guide/forms/dynamic-forms)
