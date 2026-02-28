# PrimeNG Components (Angular 21+)

## Objetivo
Usar PrimeNG con Angular moderno (standalone, signals, control flow `@if/@for`) evitando patrones legacy y errores frecuentes.

## Reglas base
- Usar siempre control flow nuevo: `@if`, `@for`, `@switch` (evitar `*ngIf/*ngFor/*ngSwitch`).
- Preferir componentes standalone y `ChangeDetectionStrategy.OnPush`.
- Importar solo módulos/componentes PrimeNG necesarios por feature.
- Evitar lógica compleja en template; moverla a `computed`/métodos puros.
- Definir tipos estrictos para modelos usados por tablas, forms y eventos.

## Setup recomendado
1. Instalar y alinear versiones:
   - `primeng`, `primeicons`, `@angular/*` en ramas compatibles.
2. Estilos globales:
   - Tema PrimeNG + `primeicons` en `styles.scss` o configuración equivalente.
3. Animaciones:
   - Habilitar provider/config de animaciones de Angular cuando el componente lo requiera.

## Patrones por componente

### p-table
- Definir `trackBy` para filas dinámicas.
- Usar paginación/lazy loading para datasets medianos-grandes.
- Evitar filtros client-side costosos en cada keypress (debounce).

### p-dropdown / p-select / p-autocomplete
- Normalizar `optionLabel`/`optionValue`.
- No mezclar objeto completo y primitive value sin necesidad.
- En formularios reactivos, tipar `FormControl<T | null>`.

### p-calendar / datepicker
- Centralizar parsing/format con utilidades.
- Evitar conversiones implícitas de zona horaria.
- Mostrar formato UI y formato de API de forma explícita.

### p-dialog
- Controlar visibilidad desde estado único (signal/store) para evitar estados duplicados.
- Limpiar formularios al cerrar si aplica.

## Formularios
- Priorizar Reactive Forms tipados.
- Validaciones compartidas en utilidades reutilizables.
- Mensajes de error consistentes y accesibles (aria-describedby).

## Accesibilidad y UX
- Mantener labels, placeholders y `aria-*` correctos.
- Verificar navegación por teclado en dropdowns, dialogs y tablas.
- No depender solo de color para feedback de estado.

## Rendimiento
- Usar `OnPush` + signals/computed para minimizar renders.
- Virtual scroll/lazy loading en listas extensas.
- Evitar pipes costosos dentro de celdas en tablas grandes.

## Checklist antes de merge
- [ ] Sin `*ngIf/*ngFor/*ngSwitch` en templates nuevos o modificados.
- [ ] Componente PrimeNG correctamente tipado y accesible.
- [ ] Build OK (`npm run build`).
- [ ] Sin warnings críticos en consola de Angular.
