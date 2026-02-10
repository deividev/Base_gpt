# Design System & UI Guidelines

## Descripción
Sistema de diseño modular y escalable que define colores, tipografía, espaciado y componentes visuales reutilizables. Permite mantener consistencia visual en toda la aplicación y facilita la personalización por proyecto.

## Nivel de Habilidad
- **Categoría**: Design/UI
- **Prerequisitos**: CSS básico, Variables CSS, SCSS
- **Tiempo estimado**: 4-6 horas

---

## 🎨 Implementación en el Proyecto

> **IMPORTANTE**: Este proyecto tiene un sistema de temas completo implementado.
> 
> ### Archivos de Configuración
> - **Configuración de tema**: `src/styles/design-config.ts`
> - **Definición de temas**: `src/styles/themes.config.ts`
> - **ThemeService**: `src/app/core/services/theme.ts`
> - **Guía de cambio**: `THEME_GUIDE.md`
>
> ### 28 Temas Disponibles (Tailwind CSS v3)
> 
> | Categoría | Temas |
> |-----------|-------|
> | **Cálidos** | red, orange, amber, yellow |
> | **Verdes** | lime, green, emerald, teal |
> | **Azules** | cyan, sky, blue, indigo |
> | **Púrpuras** | violet, purple, fuchsia |
> | **Rosas** | pink, rose |
> | **Neutrales** | slate, gray, zinc, neutral, stone |
> | **Oscuros** | dark, dark-blue, dark-purple, dark-emerald, dark-rose, dark-orange, dark-cyan |
>
> ### Cambiar Tema
> ```typescript
> // Opción 1: En design-config.ts (cambio por defecto)
> export const DEFAULT_THEME: ThemeName = 'emerald';
> 
> // Opción 2: En runtime con ThemeService
> import { ThemeService } from '@core/services';
> this.themeService.setTheme('purple');
> this.themeService.toggleDarkMode();
> ```

---

## 1. Sistema de Colores

### 1.1 Paleta Principal
Define los colores base que representan la identidad de marca del proyecto.

```scss
// _colors.scss
// Paleta Principal - Personalizable por proyecto
$colors: (
  // Colores de Marca
  primary: (
    50: #f0f4ff,
    100: #e0e9ff,
    200: #c7d7fe,
    300: #a5bbfd,
    400: #8098fa,
    500: #6366f1,    // Color principal
    600: #4f46e5,
    700: #4338ca,
    800: #3730a3,
    900: #312e81,
  ),
  
  secondary: (
    50: #fdf2f8,
    100: #fce7f3,
    200: #fbcfe8,
    300: #f9a8d4,
    400: #f472b6,
    500: #ec4899,    // Color secundario
    600: #db2777,
    700: #be185d,
    800: #9f1239,
    900: #831843,
  ),
  
  accent: (
    50: #faf5ff,
    100: #f3e8ff,
    200: #e9d5ff,
    300: #d8b4fe,
    400: #c084fc,
    500: #8b5cf6,    // Color de acento
    600: #7c3aed,
    700: #6d28d9,
    800: #5b21b6,
    900: #4c1d95,
  ),
  
  // Colores Neutros
  neutral: (
    50: #f8fafc,
    100: #f1f5f9,
    200: #e2e8f0,
    300: #cbd5e1,
    400: #94a3b8,
    500: #64748b,
    600: #475569,
    700: #334155,
    800: #1e293b,
    900: #0f172a,
  ),
);

// Colores Semánticos
$semantic-colors: (
  success: (
    light: #d1fae5,
    base: #10b981,
    dark: #059669,
  ),
  warning: (
    light: #fef3c7,
    base: #f59e0b,
    dark: #d97706,
  ),
  error: (
    light: #fee2e2,
    base: #ef4444,
    dark: #dc2626,
  ),
  info: (
    light: #dbeafe,
    base: #3b82f6,
    dark: #2563eb,
  ),
);
```

### 1.2 Variables CSS Globales
Implementación con CSS Custom Properties para facilitar temas dinámicos.

```scss
// variables.scss
:root {
  // Colores Principales
  --color-primary: #6366f1;
  --color-primary-light: #8098fa;
  --color-primary-dark: #4f46e5;
  
  --color-secondary: #ec4899;
  --color-secondary-light: #f472b6;
  --color-secondary-dark: #db2777;
  
  --color-accent: #8b5cf6;
  --color-accent-light: #c084fc;
  --color-accent-dark: #7c3aed;
  
  // Colores Neutros
  --color-white: #ffffff;
  --color-black: #000000;
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e1;
  --color-gray-400: #94a3b8;
  --color-gray-500: #64748b;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1e293b;
  --color-gray-900: #0f172a;
  
  // Colores de Texto
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --text-tertiary: var(--color-gray-500);
  --text-inverse: var(--color-white);
  
  // Colores de Fondo
  --bg-primary: var(--color-white);
  --bg-secondary: var(--color-gray-50);
  --bg-tertiary: var(--color-gray-100);
  --bg-inverse: var(--color-gray-900);
  
  // Colores Semánticos
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-success-dark: #059669;
  
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-warning-dark: #d97706;
  
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-error-dark: #dc2626;
  
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
  --color-info-dark: #2563eb;
  
  // Gradientes
  --gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  --gradient-secondary: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
  --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

// Dark Mode
[data-theme="dark"] {
  --text-primary: var(--color-gray-50);
  --text-secondary: var(--color-gray-400);
  --text-tertiary: var(--color-gray-500);
  --text-inverse: var(--color-gray-900);
  
  --bg-primary: var(--color-gray-900);
  --bg-secondary: var(--color-gray-800);
  --bg-tertiary: var(--color-gray-700);
  --bg-inverse: var(--color-white);
}
```

---

## 2. Tipografía

### 2.1 Escala Tipográfica
Sistema de tamaños de fuente basado en escala modular.

```scss
// _typography.scss
:root {
  // Font Families
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                  'Helvetica Neue', Arial, sans-serif;
  --font-secondary: Georgia, 'Times New Roman', serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
               Consolas, monospace;
  
  // Font Sizes - Escala Modular (1.250 - Major Third)
  --text-xs: 0.75rem;      // 12px
  --text-sm: 0.875rem;     // 14px
  --text-base: 1rem;       // 16px
  --text-lg: 1.125rem;     // 18px
  --text-xl: 1.25rem;      // 20px
  --text-2xl: 1.5rem;      // 24px
  --text-3xl: 1.875rem;    // 30px
  --text-4xl: 2.25rem;     // 36px
  --text-5xl: 3rem;        // 48px
  --text-6xl: 3.75rem;     // 60px
  --text-7xl: 4.5rem;      // 72px
  
  // Font Weights
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
  
  // Line Heights
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  // Letter Spacing
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}

// Utilidades de Tipografía
@mixin heading-1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

@mixin heading-2 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

@mixin heading-3 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

@mixin body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

@mixin body-base {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

@mixin body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}
```

---

## 3. Espaciado y Layout

### 3.1 Sistema de Espaciado
Escala consistente basada en múltiplos de 4px.

```scss
// _spacing.scss
:root {
  // Espaciado base: 4px
  --space-0: 0;
  --space-1: 0.25rem;   // 4px
  --space-2: 0.5rem;    // 8px
  --space-3: 0.75rem;   // 12px
  --space-4: 1rem;      // 16px
  --space-5: 1.25rem;   // 20px
  --space-6: 1.5rem;    // 24px
  --space-8: 2rem;      // 32px
  --space-10: 2.5rem;   // 40px
  --space-12: 3rem;     // 48px
  --space-16: 4rem;     // 64px
  --space-20: 5rem;     // 80px
  --space-24: 6rem;     // 96px
  --space-32: 8rem;     // 128px
  
  // Anchos de Contenedor
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
  
  // Z-Index Scale
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

### 3.2 Breakpoints Responsive

```scss
// _breakpoints.scss
$breakpoints: (
  xs: 0,
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  2xl: 1536px,
);

// Mixins para Media Queries
@mixin media-up($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

@mixin media-down($breakpoint) {
  @media (max-width: map-get($breakpoints, $breakpoint) - 1px) {
    @content;
  }
}

@mixin media-between($lower, $upper) {
  @media (min-width: map-get($breakpoints, $lower)) and 
         (max-width: map-get($breakpoints, $upper) - 1px) {
    @content;
  }
}

// Uso:
// @include media-up(md) { ... }
// @include media-down(lg) { ... }
// @include media-between(sm, lg) { ... }
```

---

## 4. Efectos Visuales

### 4.1 Sombras

```scss
// _shadows.scss
:root {
  // Sombras
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
               0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
               0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
               0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-2xl: 0 50px 100px -20px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  
  // Sombras de Color
  --shadow-primary: 0 10px 15px -3px rgba(99, 102, 241, 0.2);
  --shadow-secondary: 0 10px 15px -3px rgba(236, 72, 153, 0.2);
  --shadow-success: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
  --shadow-error: 0 10px 15px -3px rgba(239, 68, 68, 0.2);
}
```

### 4.2 Border Radius

```scss
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   // 2px
  --radius-base: 0.25rem;  // 4px
  --radius-md: 0.375rem;   // 6px
  --radius-lg: 0.5rem;     // 8px
  --radius-xl: 0.75rem;    // 12px
  --radius-2xl: 1rem;      // 16px
  --radius-3xl: 1.5rem;    // 24px
  --radius-full: 9999px;   // Círculo completo
}
```

### 4.3 Transiciones

```scss
:root {
  // Duraciones
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
  
  // Easing Functions
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  // Transiciones Comunes
  --transition-base: all var(--duration-150) var(--ease-out);
  --transition-smooth: all var(--duration-300) var(--ease-in-out);
  --transition-colors: background-color var(--duration-150) var(--ease-out),
                       border-color var(--duration-150) var(--ease-out),
                       color var(--duration-150) var(--ease-out);
}

// Mixins de transición
@mixin transition($property: all, $duration: 300ms, $easing: ease-in-out) {
  transition: $property $duration $easing;
}

@mixin transition-multiple($transitions...) {
  transition: $transitions;
}
```

---

## 5. Componentes Base

### 5.1 Botones

```scss
// _buttons.scss
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  text-align: center;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-smooth);
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  // Variantes de Tamaño
  &--sm {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
  }
  
  &--lg {
    padding: var(--space-4) var(--space-8);
    font-size: var(--text-lg);
  }
  
  &--xl {
    padding: var(--space-5) var(--space-10);
    font-size: var(--text-xl);
  }
  
  // Variantes de Color
  &--primary {
    background: var(--gradient-primary);
    color: var(--text-inverse);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-primary);
    }
  }
  
  &--secondary {
    background-color: var(--color-secondary);
    color: var(--text-inverse);
    
    &:hover:not(:disabled) {
      background-color: var(--color-secondary-dark);
      box-shadow: var(--shadow-secondary);
    }
  }
  
  &--outline {
    background-color: transparent;
    border-color: var(--color-primary);
    color: var(--color-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary);
      color: var(--text-inverse);
    }
  }
  
  &--ghost {
    background-color: transparent;
    color: var(--color-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-gray-100);
    }
  }
}
```

### 5.2 Cards

```scss
// _cards.scss
.card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-base);
  padding: var(--space-6);
  transition: var(--transition-smooth);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  &__header {
    margin-bottom: var(--space-4);
  }
  
  &__title {
    @include heading-3;
    margin-bottom: var(--space-2);
  }
  
  &__subtitle {
    @include body-base;
    color: var(--text-secondary);
  }
  
  &__body {
    @include body-base;
    color: var(--text-primary);
  }
  
  &__footer {
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-gray-200);
  }
  
  // Variantes
  &--outlined {
    box-shadow: none;
    border: 2px solid var(--color-gray-200);
  }
  
  &--elevated {
    box-shadow: var(--shadow-lg);
  }
  
  &--interactive {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-xl);
    }
  }
}
```

### 5.3 Forms

```scss
// _forms.scss
.form {
  &__group {
    margin-bottom: var(--space-5);
  }
  
  &__label {
    display: block;
    margin-bottom: var(--space-2);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
  }
  
  &__input,
  &__textarea,
  &__select {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    color: var(--text-primary);
    background-color: var(--bg-primary);
    border: 2px solid var(--color-gray-300);
    border-radius: var(--radius-lg);
    transition: var(--transition-colors);
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    
    &::placeholder {
      color: var(--text-tertiary);
    }
    
    &:disabled {
      background-color: var(--color-gray-100);
      cursor: not-allowed;
    }
    
    &--error {
      border-color: var(--color-error);
      
      &:focus {
        box-shadow: 0 0 0 3px var(--color-error-light);
      }
    }
    
    &--success {
      border-color: var(--color-success);
      
      &:focus {
        box-shadow: 0 0 0 3px var(--color-success-light);
      }
    }
  }
  
  &__hint {
    display: block;
    margin-top: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
  
  &__error {
    display: block;
    margin-top: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-error);
  }
}
```

---

## 6. Implementación en Angular

### 6.1 Estructura de Estilos

```
src/
├── styles/
│   ├── abstracts/
│   │   ├── _variables.scss      // Variables CSS
│   │   ├── _colors.scss         // Sistema de colores
│   │   ├── _typography.scss     // Tipografía
│   │   ├── _spacing.scss        // Espaciado
│   │   ├── _breakpoints.scss    // Media queries
│   │   └── _mixins.scss         // Mixins útiles
│   ├── base/
│   │   ├── _reset.scss          // CSS reset
│   │   └── _global.scss         // Estilos globales
│   ├── components/
│   │   ├── _buttons.scss        // Botones
│   │   ├── _cards.scss          // Cards
│   │   ├── _forms.scss          // Formularios
│   │   └── _modals.scss         // Modales
│   ├── layout/
│   │   ├── _header.scss         // Header
│   │   ├── _footer.scss         // Footer
│   │   └── _grid.scss           // Sistema de grid
│   └── main.scss                // Import principal
```

### 6.2 Configuración Angular

```scss
// styles.scss (global)
@import 'styles/abstracts/variables';
@import 'styles/abstracts/colors';
@import 'styles/abstracts/typography';
@import 'styles/abstracts/spacing';
@import 'styles/abstracts/breakpoints';
@import 'styles/abstracts/mixins';

@import 'styles/base/reset';
@import 'styles/base/global';

@import 'styles/components/buttons';
@import 'styles/components/cards';
@import 'styles/components/forms';

@import 'styles/layout/header';
@import 'styles/layout/footer';
@import 'styles/layout/grid';
```

### 6.3 Servicio de Tema (Theme Service)

```typescript
// theme.service.ts
import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  currentTheme = signal<Theme>(this.getStoredTheme());
  
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    return stored || this.getSystemTheme();
  }
  
  private getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
}
```

---

## 7. Personalización por Proyecto

### 7.1 Archivo de Configuración

```typescript
// design-config.ts
export interface DesignConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    baseSize: string;
  };
  spacing: {
    base: number; // en px
  };
  borderRadius: {
    base: string;
  };
}

export const DEFAULT_DESIGN_CONFIG: DesignConfig = {
  colors: {
    primary: '#6366f1',
    secondary: '#ec4899',
    accent: '#8b5cf6',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    baseSize: '16px',
  },
  spacing: {
    base: 4, // 4px base unit
  },
  borderRadius: {
    base: '12px',
  },
};

// Configuración personalizada para proyecto específico
export const PROJECT_DESIGN_CONFIG: DesignConfig = {
  ...DEFAULT_DESIGN_CONFIG,
  colors: {
    primary: '#3b82f6',  // Cambiar a azul
    secondary: '#f59e0b', // Cambiar a naranja
    accent: '#10b981',    // Cambiar a verde
  },
};
```

### 7.2 Generador de Variables CSS

```typescript
// design-generator.service.ts
import { Injectable } from '@angular/core';
import { DesignConfig } from './design-config';

@Injectable({
  providedIn: 'root'
})
export class DesignGeneratorService {
  applyDesignConfig(config: DesignConfig): void {
    const root = document.documentElement;
    
    // Aplicar colores
    root.style.setProperty('--color-primary', config.colors.primary);
    root.style.setProperty('--color-secondary', config.colors.secondary);
    root.style.setProperty('--color-accent', config.colors.accent);
    
    // Aplicar tipografía
    root.style.setProperty('--font-primary', config.typography.fontFamily);
    root.style.setProperty('--text-base', config.typography.baseSize);
    
    // Aplicar espaciado
    root.style.setProperty('--space-base', `${config.spacing.base}px`);
    
    // Aplicar border radius
    root.style.setProperty('--radius-base', config.borderRadius.base);
  }
  
  generateColorScale(baseColor: string): Record<number, string> {
    // Lógica para generar escala de colores automáticamente
    // Usando HSL manipulation
    return {
      50: this.lighten(baseColor, 0.95),
      100: this.lighten(baseColor, 0.90),
      200: this.lighten(baseColor, 0.80),
      // ... más tonos
      900: this.darken(baseColor, 0.80),
    };
  }
  
  private lighten(color: string, amount: number): string {
    // Implementación para aclarar color
    return color;
  }
  
  private darken(color: string, amount: number): string {
    // Implementación para oscurecer color
    return color;
  }
}
```

---

## 8. Mejores Prácticas

### 8.1 Consistencia Visual

1. **Usar siempre variables CSS** en lugar de valores hardcodeados
2. **Mantener la escala de espaciado** (múltiplos de 4px)
3. **Respetar la jerarquía tipográfica** establecida
4. **Usar colores semánticos** para estados y feedback
5. **Aplicar sombras coherentes** según elevación

### 8.2 Accesibilidad

```scss
// Contraste de colores mínimo WCAG AA
:root {
  // Texto sobre fondos claros
  --text-on-light-min-contrast: 4.5;
  
  // Texto grande sobre fondos claros
  --text-large-on-light-min-contrast: 3;
  
  // Asegurar contraste en botones
  .btn {
    &--primary {
      // El texto blanco sobre primary debe tener ratio >= 4.5
      color: var(--text-inverse);
    }
  }
}

// Focus visible para teclado
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 8.3 Performance

1. **Minimizar uso de box-shadow** en animaciones (usar transform)
2. **Preferir transform y opacity** para transiciones
3. **Usar will-change** solo cuando sea necesario
4. **Lazy load** de estilos no críticos

---

## 9. Testing del Design System

### 9.1 Visual Regression Testing

```typescript
// design-system.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent Visual Tests', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });
  
  it('should render primary button correctly', () => {
    component.variant = 'primary';
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('button');
    const styles = getComputedStyle(button);
    
    expect(styles.backgroundColor).toContain('rgb'); // Verificar color
    expect(styles.padding).toBe('12px 24px');
    expect(styles.borderRadius).toBe('12px');
  });
  
  it('should have correct hover state', () => {
    component.variant = 'primary';
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    
    // Verificar estilos de hover
    const styles = getComputedStyle(button);
    expect(styles.transform).toBe('translateY(-2px)');
  });
});
```

---

## 10. Documentación y Storybook

### 10.1 Configuración de Storybook

```typescript
// button.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Primary Button',
  },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem;">
        <app-button variant="primary">Primary</app-button>
        <app-button variant="secondary">Secondary</app-button>
        <app-button variant="outline">Outline</app-button>
        <app-button variant="ghost">Ghost</app-button>
      </div>
    `,
  }),
};
```

---

## Recursos Adicionales

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Material Design Color System](https://material.io/design/color)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens](https://spectrum.adobe.com/page/design-tokens/)
- [Radix Colors](https://www.radix-ui.com/colors)

---

## Checklist de Implementación

- [ ] Crear estructura de carpetas para estilos
- [ ] Definir paleta de colores del proyecto
- [ ] Configurar variables CSS globales
- [ ] Establecer escala tipográfica
- [ ] Definir sistema de espaciado
- [ ] Crear componentes base (botones, cards, forms)
- [ ] Implementar dark mode
- [ ] Configurar breakpoints responsive
- [ ] Definir sombras y efectos
- [ ] Crear servicio de tema (ThemeService)
- [ ] Documentar en Storybook
- [ ] Testing visual de componentes
- [ ] Verificar accesibilidad (contraste, focus)
- [ ] Optimizar performance
