# Guía de Cambio de Tema - Para Agentes

## 🎯 Objetivo

Esta guía explica cómo cambiar el tema visual del proyecto de manera rápida y sencilla.
Los temas están basados en las paletas de colores profesionales de **Tailwind CSS v3**.

## 📍 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `src/styles/design-config.ts` | Tema por defecto (DEFAULT_THEME) |
| `src/styles/themes.config.ts` | Definición de los 28 temas |
| `src/app/core/services/theme.ts` | ThemeService para cambio dinámico |

---

## ✏️ Métodos para Cambiar el Tema

### Método 1: Cambiar Tema por Defecto

En `src/styles/design-config.ts`, modificar:

```typescript
export const DEFAULT_THEME: ThemeName = 'blue';  // Cambiar a otro tema
```

⚠️ **Requiere recargar la página** (F5)

### Método 2: Cambiar en Runtime (Dinámico)

```typescript
import { ThemeService } from '@core/services';

// Cambiar tema
this.themeService.setTheme('emerald');

// Alternar dark mode
this.themeService.toggleDarkMode();

// Obtener tema actual
const current = this.themeService.currentTheme();

// Listar temas disponibles
const themes = this.themeService.availableThemes;
```

---

## 🎨 28 Temas Disponibles

### Colores Cálidos 🔥

| Tema | Primary | Descripción | Uso Recomendado |
|------|---------|-------------|-----------------|
| `red` | #ef4444 | Rojo vibrante | Alertas, urgencia, energía |
| `orange` | #f97316 | Naranja cálido | Creatividad, e-commerce |
| `amber` | #f59e0b | Ámbar dorado | Finanzas, premium |
| `yellow` | #eab308 | Amarillo brillante | Optimismo, promociones |

### Verdes 🌿

| Tema | Primary | Descripción | Uso Recomendado |
|------|---------|-------------|-----------------|
| `lime` | #84cc16 | Lima fresco | Apps juveniles, tecnología |
| `green` | #22c55e | Verde clásico | Éxito, dinero, naturaleza |
| `emerald` | #10b981 | Esmeralda | Salud, bienestar, sostenibilidad |
| `teal` | #14b8a6 | Teal elegante | Spas, bienestar, profesional |

### Azules 💙

| Tema | Primary | Descripción | Uso Recomendado |
|------|---------|-------------|-----------------|
| `cyan` | #06b6d4 | Cian brillante | Tech, modernidad |
| `sky` | #0ea5e9 | Cielo claro | Apps ligeras, comunicación |
| `blue` ⭐ | #3b82f6 | Azul estándar **(DEFAULT)** | SaaS, dashboards, corporativo |
| `indigo` | #6366f1 | Índigo profundo | Fintech, apps premium |

### Púrpuras 💜

| Tema | Primary | Descripción | Uso Recomendado |
|------|---------|-------------|-----------------|
| `violet` | #8b5cf6 | Violeta suave | Gaming, entretenimiento |
| `purple` | #a855f7 | Púrpura vibrante | Creatividad, innovación |
| `fuchsia` | #d946ef | Fucsia llamativo | Moda, arte, diseño |

### Rosas 💗

| Tema | Primary | Descripción | Uso Recomendado |
|------|---------|-------------|-----------------|
| `pink` | #ec4899 | Rosa intenso | Lifestyle, social |
| `rose` | #f43f5e | Rosa rojizo | E-commerce, fashion |

### Neutrales 🔘

| Tema | Primary | Descripción | Uso Recomendado |
|------|---------|-------------|-----------------|
| `slate` | #475569 | Gris azulado | Corporativo serio, B2B |
| `gray` | #6b7280 | Gris neutro | Productividad, herramientas |
| `zinc` | #71717a | Gris neutro | UI minimalista |
| `neutral` | #737373 | Gris puro | Documentación, neutral |
| `stone` | #78716c | Gris cálido | Apps orgánicas, artesanal |

### Modos Oscuros 🌙

| Tema | Primary (sobre fondo oscuro) | Descripción |
|------|------------------------------|-------------|
| `dark` | #38bdf8 (sky-400) | Oscuro con acentos sky |
| `dark-blue` | #60a5fa (blue-400) | Oscuro con acentos azules |
| `dark-purple` | #c084fc (purple-400) | Oscuro con acentos púrpura |
| `dark-emerald` | #34d399 (emerald-400) | Oscuro con acentos verdes |
| `dark-rose` | #fb7185 (rose-400) | Oscuro con acentos rosa |
| `dark-orange` | #fb923c (orange-400) | Oscuro con acentos naranja |
| `dark-cyan` | #22d3ee (cyan-400) | Oscuro con acentos cyan |

---

## 🤖 Instrucciones para el Agente

Cuando el usuario solicite cambiar el tema:

### Opción A: Cambio Persistente (Recomendado)

1. Editar `src/styles/design-config.ts`
2. Cambiar `DEFAULT_THEME`:

```typescript
// Buscar
export const DEFAULT_THEME: ThemeName = 'blue';

// Reemplazar por el tema solicitado
export const DEFAULT_THEME: ThemeName = 'emerald';
```

3. Informar al usuario que debe recargar (F5)

### Opción B: Sugerir Uso de ThemeService

Para cambio dinámico sin recargar:

```typescript
// En cualquier componente
this.themeService.setTheme('purple');
```

---

## 📝 Ejemplos de Solicitudes del Usuario

| Solicitud | Tema Sugerido |
|-----------|---------------|
| "Tema profesional/corporativo" | `slate`, `blue` |
| "Quiero algo más colorido" | `purple`, `fuchsia`, `rose` |
| "App de salud/bienestar" | `emerald`, `teal` |
| "Modo oscuro" | `dark`, `dark-blue`, `dark-purple` |
| "E-commerce de moda" | `rose`, `pink` |
| "App financiera" | `indigo`, `amber` |
| "Tech/Moderno" | `cyan`, `blue`, `indigo` |
| "Natural/Eco" | `emerald`, `green`, `lime` |
| "Urgente/Alertas" | `red`, `orange` |
| "Minimalista" | `gray`, `zinc`, `neutral` |

---

## 📊 Comparación de Temas Light vs Dark

### Temas Light (Fondo Claro)
- Background: `#ffffff` o `gray-50`
- Text: `gray-900` (oscuro)
- Primary: Color-500 (saturación media)
- 17 temas: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

### Temas Neutrales (Fondo Claro)
- Primary: Grises con acentos de color
- 5 temas: slate, gray, zinc, neutral, stone

### Temas Dark (Fondo Oscuro)
- Background: `zinc-900` (#18181b)
- Surface: `zinc-800` (#27272a)
- Text: `gray-50` (claro)
- Primary: Color-400 (más brillante para contraste)
- 7 temas: dark, dark-blue, dark-purple, dark-emerald, dark-rose, dark-orange, dark-cyan

---

## ⚠️ Consideraciones

### Variables CSS Aplicadas

Cada tema configura automáticamente:
- `--color-primary`, `--color-primary-light`, `--color-primary-dark`
- `--color-secondary`, `--color-secondary-light`, `--color-secondary-dark`
- `--color-accent`, `--color-accent-light`, `--color-accent-dark`
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- Colores semánticos: success, warning, error, info

### Persistencia

- El ThemeService guarda la preferencia en `localStorage` (key: `app-theme`)
- Al recargar, se restaura el tema guardado

### Consola de Verificación

Al cambiar tema, la consola muestra:
```
🎨 Tema cambiado a: Emerald
```

---

## 🔄 Restaurar Tema Default

```typescript
// En design-config.ts
export const DEFAULT_THEME: ThemeName = 'blue';

// O con ThemeService
this.themeService.resetToDefault();
```

---

**Última actualización**: 2026-02-09
**Total de temas**: 28 (17 light + 5 neutrales + 7 dark variants)
