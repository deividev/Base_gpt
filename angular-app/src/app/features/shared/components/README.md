# Shared Components

Esta carpeta contiene componentes reutilizables que pueden ser usados en toda la aplicación. Todos los componentes siguen las mejores prácticas de Angular 21 y están 100% integrados con nuestro Design System.

## 📦 Componentes Disponibles

### 1. Button Component (`app-button`)

Botón reutilizable con múltiples variantes y tamaños.

**Ubicación:** `src/app/shared/components/button/`

**Uso:**
```html
<app-button 
  variant="primary" 
  size="large"
  (clicked)="handleClick($event)"
>
  Click Me
</app-button>
```

**Inputs:**
- `variant`: `'primary' | 'secondary' | 'outline'` - Estilo del botón (default: `'primary'`)
- `size`: `'small' | 'medium' | 'large'` - Tamaño del botón (default: `'medium'`)
- `disabled`: `boolean` - Deshabilita el botón (default: `false`)
- `type`: `'button' | 'submit' | 'reset'` - Tipo HTML del botón (default: `'button'`)
- `ariaLabel`: `string` - Label para accesibilidad

**Outputs:**
- `clicked`: `EventEmitter<MouseEvent>` - Evento disparado al hacer click

**Características:**
- ✅ Integrado con Design System (colores, sombras, transiciones)
- ✅ Accesible (ARIA, focus visible, disabled state)
- ✅ Responsive
- ✅ Hover y active states
- ✅ Soporte para contenido proyectado (ng-content)

---

### 2. Feature Card Component (`app-feature-card`)

Tarjeta para mostrar features o características con icono, título y descripción.

**Ubicación:** `src/app/shared/components/feature-card/`

**Uso:**
```html
<app-feature-card
  icon="⚡"
  title="Lightning Fast"
  description="Built with Angular 21 and optimized for performance"
/>
```

**Inputs (todos requeridos):**
- `icon`: `string` - Emoji o ícono a mostrar
- `title`: `string` - Título de la feature
- `description`: `string` - Descripción detallada

**Características:**
- ✅ Hover effect con elevación
- ✅ Sombras del Design System
- ✅ Responsive
- ✅ Transiciones suaves

---

### 3. Section Header Component (`app-section-header`)

Header de sección con título y subtítulo opcional, alineación configurable.

**Ubicación:** `src/app/shared/components/section-header/`

**Uso:**
```html
<app-section-header
  title="Why Choose Us?"
  subtitle="Everything you need to build modern web applications"
  align="center"
/>
```

**Inputs:**
- `title`: `string` (requerido) - Título principal de la sección
- `subtitle`: `string` (opcional) - Subtítulo descriptivo
- `align`: `'left' | 'center' | 'right'` - Alineación del texto (default: `'center'`)

**Características:**
- ✅ Tipografía del Design System
- ✅ Espaciado consistente
- ✅ Responsive (ajusta tamaños en mobile)
- ✅ Subtítulo opcional

---

### 4. Input Component (`app-input`)

Input de formulario con label, validación y estados de error.

**Ubicación:** `src/app/shared/components/input/`

**Uso:**
```html
<app-input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  [value]="emailValue"
  [required]="true"
  [error]="emailError"
  (valueChange)="onEmailChange($event)"
  (inputFocus)="onFocus()"
  (inputBlur)="onBlur()"
/>
```

**Inputs:**
- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url'` - Tipo de input (default: `'text'`)
- `placeholder`: `string` - Texto placeholder
- `value`: `string` - Valor del input
- `disabled`: `boolean` - Deshabilita el input (default: `false`)
- `required`: `boolean` - Campo requerido (default: `false`)
- `label`: `string` - Label descriptivo (opcional)
- `error`: `string` - Mensaje de error a mostrar (opcional)

**Outputs:**
- `valueChange`: `EventEmitter<string>` - Se emite cuando cambia el valor
- `inputFocus`: `EventEmitter<void>` - Se emite cuando el input recibe focus
- `inputBlur`: `EventEmitter<void>` - Se emite cuando el input pierde focus

**Características:**
- ✅ Estados: normal, focus, hover, disabled, error
- ✅ Validación visual con mensajes de error
- ✅ Accesible (labels, ARIA)
- ✅ Integrado con Design System
- ✅ Focus ring con colores del tema
- ✅ Transiciones suaves

---

### 5. Stat Component (`app-stat`)

Componente para mostrar estadísticas o métricas (valor + etiqueta).

**Ubicación:** `src/app/shared/components/stat/`

**Uso:**
```html
<div class="stats-container">
  <app-stat value="100%" label="Standalone" />
  <app-stat value="⚡" label="ESBuild" />
  <app-stat value="5+" label="Years" />
</div>
```

**Inputs (todos requeridos):**
- `value`: `string` - Valor a mostrar (número, emoji, texto)
- `label`: `string` - Etiqueta descriptiva

**Características:**
- ✅ Diseño vertical (columna)
- ✅ Colores del Design System (primary para valor)
- ✅ Responsive
- ✅ Label en mayúsculas con spacing

---

## 🎨 Integración con Design System

Todos los componentes están 100% integrados con nuestro Design System:

- **Colores**: Usan variables CSS del tema activo
  - `var(--primary)`, `var(--secondary)`, `var(--accent)`
  - `var(--surface)`, `var(--background)`, `var(--surface-alt)`
  - `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
  - Colores semánticos: `var(--success)`, `var(--error)`, `var(--warning)`, `var(--info)`

- **Espaciado**: Variables de spacing
  - `var(--space-1)` hasta `var(--space-32)`

- **Tipografía**: Variables de texto
  - `var(--font-primary)`, `var(--text-base)`, `var(--text-lg)`, etc.

- **Sombras**: Variables de sombra
  - `var(--shadow)`, `var(--shadow-lg)`

- **Transiciones**: Variables de transición
  - `var(--transition)`, `var(--transition-colors)`

- **Border Radius**: Variable de radio
  - `var(--radius)`

## 🚀 Características Generales

### Angular 21 Features
- ✅ **Standalone Components**: No requieren módulos
- ✅ **Signals**: Reactive state management
- ✅ **New Input API**: `input()` y `input.required()`
- ✅ **New Output API**: `output()` en lugar de `@Output()`
- ✅ **Control Flow**: `@if`, `@for` (nueva sintaxis de templates)

### Best Practices
- ✅ **TypeScript estricto**: Tipado completo
- ✅ **Accesibilidad**: ARIA labels, keyboard navigation, focus management
- ✅ **Performance**: OnPush change detection (donde aplique)
- ✅ **Responsive**: Breakpoints mobile-first
- ✅ **Mantenibilidad**: Código limpio, bien documentado
- ✅ **Testeable**: Fácil de hacer unit tests

## 📁 Estructura de Archivos

Cada componente sigue esta estructura:

```
component-name/
  ├── component-name.ts        # Lógica del componente
  ├── component-name.html      # Template
  └── component-name.scss      # Estilos
```

## 📦 Barrel Export

Todos los componentes se exportan desde `index.ts` para facilitar imports:

```typescript
// ✅ Import múltiple (recomendado)
import { Button, FeatureCard, SectionHeader, Input, Stat } from '@app/shared/components';

// ❌ Evitar imports individuales
import { Button } from '@app/shared/components/button/button';
```

## 🔄 Cómo Usar en Landing Page

El landing page ya usa estos componentes. Ver ejemplo en:
- **Archivo**: `src/app/pages/landing/landing.html`
- **Imports**: `src/app/pages/landing/landing.ts`

Ejemplo:

```typescript
// landing.ts
import { Button, FeatureCard, SectionHeader } from '../../shared/components';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, Button, FeatureCard, SectionHeader],
  // ...
})
```

```html
<!-- landing.html -->
<app-section-header title="Features" subtitle="Amazing features" />

<app-feature-card
  icon="⚡"
  title="Fast"
  description="Lightning fast performance"
/>

<app-button variant="primary" size="large" (clicked)="handleClick()">
  Get Started
</app-button>
```

## ➕ Agregar Nuevos Componentes

Para agregar un nuevo componente reutilizable:

1. **Crear carpeta**: `src/app/shared/components/nuevo-componente/`

2. **Crear archivos**:
   - `nuevo-componente.ts` (lógica)
   - `nuevo-componente.html` (template)
   - `nuevo-componente.scss` (estilos)

3. **Usar standalone + signals**:
```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-nuevo-componente',
  imports: [],
  templateUrl: './nuevo-componente.html',
  styleUrl: './nuevo-componente.scss'
})
export class NuevoComponente {
  // Inputs usando signals
  title = input.required<string>();
  size = input<'small' | 'large'>('small');
  
  // Outputs
  clicked = output<void>();
}
```

4. **Exportar en index.ts**:
```typescript
export * from './nuevo-componente/nuevo-componente';
```

5. **Usar Design System**: Siempre usar variables CSS del tema

## 🎯 Beneficios

- **Reutilización**: Escribe una vez, usa en toda la app
- **Consistencia**: Mismo look & feel en toda la aplicación
- **Mantenibilidad**: Cambios centralizados
- **Performance**: Componentes optimizados
- **Escalabilidad**: Fácil agregar nuevos componentes
- **Type Safety**: TypeScript completo
- **Accesibilidad**: ARIA y keyboard support built-in

## 📚 Recursos

- [Angular 21 Docs](https://angular.dev)
- [Signals Guide](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components)
- [Design System README](../../styles/DESIGN_SYSTEM.md)
- [Theme Guide](../../styles/THEME_GUIDE.md)
