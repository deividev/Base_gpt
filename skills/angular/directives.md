# Angular Directives

## 📋 Información

- **Skill ID**: `angular/directives`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Alta
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar la creación y uso de directivas personalizadas en Angular para reutilizar lógica de manipulación del DOM y comportamiento de elementos.

---

## 📊 Tipos de Directivas

```
┌──────────────────────────────────────────────────────┐
│  1. ATTRIBUTE DIRECTIVES                             │
│     Modifican apariencia o comportamiento            │
│     Ej: ngClass, ngStyle, highlight                  │
├──────────────────────────────────────────────────────┤
│  2. STRUCTURAL DIRECTIVES                            │
│     Modifican estructura del DOM                     │
│     Ej: *ngIf, *ngFor, *ngSwitch                     │
├──────────────────────────────────────────────────────┤
│  3. COMPONENT DIRECTIVES                             │
│     Directivas con template                          │
│     Ej: Cualquier @Component                         │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Attribute Directives

### Directiva Simple

```typescript
// directives/highlight.directive.ts
import { Directive, ElementRef, inject } from "@angular/core";

@Directive({
  selector: "[appHighlight]",
  standalone: true,
})
export class HighlightDirective {
  private el = inject(ElementRef);

  constructor() {
    this.el.nativeElement.style.backgroundColor = "yellow";
  }
}

// Uso
@Component({
  selector: "app-demo",
  imports: [HighlightDirective],
  template: ` <p appHighlight>Este texto está resaltado</p> `,
})
export class DemoComponent {}
```

### Con Input para Configuración

```typescript
import { Directive, ElementRef, Input, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  private el = inject(ElementRef);

  @Input() appHighlight: string = 'yellow';
  @Input() defaultColor: string = 'transparent';

  constructor() {
    this.el.nativeElement.style.backgroundColor = this.defaultColor;
  }

  ngOnInit() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }
}

// Uso
<p appHighlight="lightblue">Texto azul claro</p>
<p [appHighlight]="color" defaultColor="white">Texto con color dinámico</p>
```

### Con HostBinding y HostListener

```typescript
import {
  Directive,
  HostBinding,
  HostListener,
  Input
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  @Input() appHighlight: string = 'yellow';
  @Input() defaultColor: string = 'transparent';

  // Bind a la propiedad style.backgroundColor del host
  @HostBinding('style.backgroundColor')
  backgroundColor: string = this.defaultColor;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.backgroundColor = this.appHighlight;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.backgroundColor = this.defaultColor;
  }
}

// Uso
<p
  appHighlight="lightblue"
  defaultColor="white"
>
  Hover para cambiar color
</p>
```

### Directiva con Renderer2 (Recomendado)

```typescript
import {
  Directive,
  ElementRef,
  Renderer2,
  HostListener,
  Input,
  inject,
} from "@angular/core";

@Directive({
  selector: "[appHighlight]",
  standalone: true,
})
export class HighlightDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() appHighlight: string = "yellow";
  @Input() defaultColor: string = "transparent";

  constructor() {
    this.setBackgroundColor(this.defaultColor);
  }

  @HostListener("mouseenter")
  onMouseEnter() {
    this.setBackgroundColor(this.appHighlight);
  }

  @HostListener("mouseleave")
  onMouseLeave() {
    this.setBackgroundColor(this.defaultColor);
  }

  private setBackgroundColor(color: string) {
    this.renderer.setStyle(this.el.nativeElement, "background-color", color);
  }
}
```

### Directiva de Validación

```typescript
import { Directive, Input } from '@angular/core';
import {
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

@Directive({
  selector: '[appForbiddenName]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ForbiddenNameDirective,
      multi: true,
    },
  ],
})
export class ForbiddenNameDirective implements Validator {
  @Input() appForbiddenName: string = '';

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.appForbiddenName) {
      return null;
    }

    const forbidden = new RegExp(this.appForbiddenName, 'i');
    const isForbidden = forbidden.test(control.value);

    return isForbidden
      ? { forbiddenName: { value: control.value } }
      : null;
  }
}

// Uso en template
<input
  type="text"
  name="username"
  [(ngModel)]="username"
  appForbiddenName="admin"
/>
```

---

## 🔧 Structural Directives

### Directiva Estructural Simple

```typescript
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject
} from '@angular/core';

@Directive({
  selector: '[appUnless]',
  standalone: true,
})
export class UnlessDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;

  @Input() set appUnless(condition: boolean) {
    if (!condition && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (condition && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

// Uso
<div *appUnless="isLoggedIn">
  Por favor, inicie sesión
</div>
```

### Directiva con Contexto

```typescript
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject
} from '@angular/core';

interface RepeatContext {
  $implicit: number;
  index: number;
  count: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
}

@Directive({
  selector: '[appRepeat]',
  standalone: true,
})
export class RepeatDirective {
  private templateRef = inject(TemplateRef<RepeatContext>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set appRepeat(count: number) {
    this.viewContainer.clear();

    for (let i = 0; i < count; i++) {
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: i + 1,
        index: i,
        count: count,
        first: i === 0,
        last: i === count - 1,
        even: i % 2 === 0,
        odd: i % 2 !== 0,
      });
    }
  }
}

// Uso
<div *appRepeat="5; let num; let i = index; let isFirst = first">
  Item {{ num }} (index: {{ i }}) {{ isFirst ? '(first)' : '' }}
</div>
```

### Directiva de Permisos

```typescript
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  @Input() appHasPermission: string | string[] = [];

  ngOnInit() {
    this.authService.permissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(permissions => {
        this.updateView(permissions);
      });
  }

  private updateView(userPermissions: string[]) {
    const hasPermission = this.checkPermissions(userPermissions);

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermissions(userPermissions: string[]): boolean {
    const requiredPermissions = Array.isArray(this.appHasPermission)
      ? this.appHasPermission
      : [this.appHasPermission];

    return requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Uso
<button *appHasPermission="'admin'">
  Admin Only Button
</button>

<div *appHasPermission="['editor', 'admin']">
  Editor or Admin content
</div>
```

---

## 🎯 Ejemplos Prácticos

### Directiva Click Outside

```typescript
import {
  Directive,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);

    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}

// Uso
<div
  class="dropdown"
  appClickOutside
  (clickOutside)="closeDropdown()"
>
  Dropdown content
</div>
```

### Directiva de Tooltip

```typescript
import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  HostListener,
  inject
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input() appTooltip: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private tooltipElement?: HTMLElement;

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.tooltipElement) {
      this.show();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.tooltipElement) {
      this.hide();
    }
  }

  private show() {
    this.tooltipElement = this.renderer.createElement('div');
    this.tooltipElement.textContent = this.appTooltip;

    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipPosition}`);

    this.renderer.appendChild(
      document.body,
      this.tooltipElement
    );

    this.positionTooltip();
  }

  private hide() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = undefined;
    }
  }

  private positionTooltip() {
    if (!this.tooltipElement) return;

    const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostPos.top - tooltipPos.height - 5;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'bottom':
        top = hostPos.bottom + 5;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'left':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.left - tooltipPos.width - 5;
        break;
      case 'right':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.right + 5;
        break;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }
}

// CSS necesario
/*
.tooltip {
  position: fixed;
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
}
*/

// Uso
<button
  appTooltip="Click to save"
  tooltipPosition="top"
>
  Save
</button>
```

### Directiva de Lazy Load Images

```typescript
import {
  Directive,
  Input,
  ElementRef,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = '';

  private elementRef = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit() {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(this.elementRef.nativeElement);
          }
        });
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private loadImage() {
    const img = this.elementRef.nativeElement as HTMLImageElement;
    img.src = this.appLazyLoad;
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Uso
<img
  appLazyLoad="/assets/large-image.jpg"
  alt="Description"
  src="/assets/placeholder.jpg"
/>
```

### Directiva de Auto-focus

```typescript
import {
  Directive,
  ElementRef,
  Input,
  inject,
  AfterViewInit
} from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  @Input() appAutoFocus: boolean = true;

  private elementRef = inject(ElementRef);

  ngAfterViewInit() {
    if (this.appAutoFocus) {
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      }, 0);
    }
  }
}

// Uso
<input
  type="text"
  appAutoFocus
  placeholder="Auto focused"
/>

<input
  type="text"
  [appAutoFocus]="shouldFocus"
  placeholder="Conditionally focused"
/>
```

---

## ⚠️ Anti-Patterns

### ❌ MAL: Manipulación directa del DOM

```typescript
// NO HACER ESTO
@Directive({ selector: "[appBad]" })
export class BadDirective {
  constructor(private el: ElementRef) {
    // Manipulación directa del DOM
    this.el.nativeElement.style.color = "red";
    this.el.nativeElement.innerHTML = "<span>Changed</span>";
  }
}
```

### ✅ BIEN: Usar Renderer2

```typescript
@Directive({ selector: "[appGood]" })
export class GoodDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    // Usar Renderer2 para SSR y seguridad
    this.renderer.setStyle(this.el.nativeElement, "color", "red");
    const span = this.renderer.createElement("span");
    const text = this.renderer.createText("Changed");
    this.renderer.appendChild(span, text);
    this.renderer.appendChild(this.el.nativeElement, span);
  }
}
```

### ❌ MAL: Memory Leaks con Listeners

```typescript
// NO HACER ESTO
@Directive({ selector: "[appBad]" })
export class BadDirective {
  constructor() {
    document.addEventListener("click", this.onClick);
    // Nunca se limpia
  }

  onClick = () => {
    console.log("clicked");
  };
}
```

### ✅ BIEN: Limpiar listeners

```typescript
@Directive({ selector: "[appGood]" })
export class GoodDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {
    fromEvent(document, "click")
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => console.log("clicked"));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## 📋 Checklist

### Development

- [ ] Usar `standalone: true` para directivas
- [ ] Usar `Renderer2` en lugar de manipulación directa del DOM
- [ ] Implementar `OnDestroy` si hay subscripciones
- [ ] Usar `HostBinding` y `HostListener` cuando sea apropiado
- [ ] Proporcionar valores por defecto para `@Input()`
- [ ] Documentar comportamiento y uso de la directiva

### Structural Directives

- [ ] Inyectar `TemplateRef` y `ViewContainerRef`
- [ ] Limpiar vistas con `viewContainer.clear()`
- [ ] Proporcionar contexto tipado cuando sea necesario
- [ ] Manejar cambios en `@Input()` correctamente

### Performance

- [ ] Evitar operaciones pesadas en constructores
- [ ] Usar `OnPush` en componentes host cuando sea posible
- [ ] Desuscribirse de observables en `ngOnDestroy`
- [ ] Considerar usar `IntersectionObserver` para lazy operations

### Testing

- [ ] Crear tests para cada directiva
- [ ] Probar con diferentes inputs
- [ ] Verificar manipulación del DOM
- [ ] Probar comportamiento de eventos

---

## 🔗 Skills Relacionadas

- `angular/component-creation` - Componentes como directivas
- `angular/services` - Inyección de dependencias en directivas
- `angular/forms` - Directivas de validación
- `angular/rxjs` - Manejo de eventos reactivos

---

## 📚 Referencias

- [Angular Directives](https://angular.dev/guide/directives)
- [Attribute Directives](https://angular.dev/guide/directives/attribute-directives)
- [Structural Directives](https://angular.dev/guide/directives/structural-directives)
- [Renderer2 API](https://angular.dev/api/core/Renderer2)
