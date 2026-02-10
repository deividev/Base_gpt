# Design Skills

## Descripción

Skills relacionadas con diseño visual, sistemas de diseño y componentes de interfaz de usuario.

## Skills Disponibles

### 🎨 design-system.md
**Sistema de Diseño Completo**

Implementación profesional de un design system modular que incluye:

- **Paleta de Colores**: Sistema de colores con escalas (50-900), colores semánticos, dark mode
- **Tipografía**: Escala tipográfica modular, font weights, line heights, letter spacing
- **Espaciado**: Sistema basado en múltiplos de 4px, contenedores responsive
- **Componentes Base**: Botones, cards, formularios con variantes y estados
- **Efectos Visuales**: Sombras, border radius, transiciones con easing functions
- **Responsive Design**: Breakpoints, media queries, mobile-first approach
- **Accesibilidad**: Contraste WCAG, focus states, aria attributes
- **Temas**: Light/dark mode con servicio de tema en Angular
- **Configuración**: Sistema personalizable por proyecto con TypeScript

## 🎯 Cuándo Usar Esta Skill

**SIEMPRE** que estés trabajando en:
- Creación de componentes visuales
- Implementación de estilos SCSS/CSS
- Definición de colores, tipografía, espaciado
- Landing pages, dashboards, interfaces de usuario
- Formularios, botones, cards, modales
- Temas y personalización visual

## 📋 Reglas de Uso

1. **NO usar valores hardcodeados** para colores, espaciado, o tipografía
2. **Usar siempre variables CSS** del design system: `var(--color-primary)`, `var(--space-4)`, etc.
3. **Consultar design-config.ts** para la paleta de colores del proyecto actual
4. **Mantener consistencia** con los componentes base definidos
5. **Respetar la escala de espaciado** (múltiplos de 4px)
6. **Verificar contraste** para accesibilidad (WCAG AA mínimo)
7. **Usar mixins SCSS** para tipografía en lugar de definir manualmente

## 🔧 Integración con Angular

El design system se integra con Angular a través de:

```typescript
// Servicio de tema
ThemeService.toggleTheme()

// Configuración de diseño
PROJECT_DESIGN_CONFIG

// Variables CSS globales
:root { --color-primary: #6366f1; }
```

## 📁 Estructura de Archivos

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
│   │   └── _forms.scss          // Formularios
│   ├── design-config.ts         // Configuración TypeScript
│   └── main.scss                // Import principal
└── app/
    └── services/
        └── theme.service.ts     // Servicio de tema
```

## 💡 Ejemplo de Uso

```scss
// ❌ INCORRECTO - Valores hardcodeados
.button {
  background-color: #6366f1;
  padding: 12px 24px;
  border-radius: 12px;
}

// ✅ CORRECTO - Variables del design system
.button {
  background-color: var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  transition: var(--transition-smooth);
}

// ✅ MEJOR - Usando mixins y clases del design system
.button {
  @extend .btn;
  @extend .btn--primary;
  @extend .btn--lg;
}
```

## 🎨 Personalización por Proyecto

Para cambiar la paleta de colores del proyecto:

1. Editar `src/styles/design-config.ts`
2. Modificar valores de `PROJECT_DESIGN_CONFIG`
3. O usar una configuración predefinida (CORPORATE_BLUE_CONFIG, GREEN_NATURE_CONFIG, etc.)
4. Las variables CSS se actualizarán automáticamente

```typescript
export const PROJECT_DESIGN_CONFIG: DesignConfig = {
  colors: {
    primary: '#3b82f6',     // Cambiar azul
    secondary: '#f59e0b',   // Cambiar naranja
    accent: '#10b981',      // Cambiar verde
  },
  // ... resto de configuración
};
```

## 📚 Referencias

- Skill completa: `skills/design/design-system.md`
- Configuración: `angular-app/src/styles/design-config.ts`
- Variables CSS: `angular-app/src/styles/abstracts/_variables.scss`
- Componentes: `angular-app/src/styles/components/`

---

**Objetivo**: Mantener un diseño visual consistente, profesional y fácilmente personalizable en todos los componentes del proyecto.
