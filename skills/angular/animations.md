# Angular Animations

## 📋 Información

- **Skill ID**: `angular/animations`
- **Versión**: 1.0.0
- **Categoría**: Angular
- **Prioridad**: Media
- **Angular Version**: 18+

## 🎯 Objetivo

Dominar el sistema de animaciones de Angular para crear interfaces fluidas y experiencias de usuario mejoradas.

---

## 📊 Conceptos de Animaciones

```
┌──────────────────────────────────────────────────────┐
│  1. STATES                                           │
│     void, *, custom states                           │
├──────────────────────────────────────────────────────┤
│  2. TRANSITIONS                                      │
│     state1 => state2, :enter, :leave                 │
├──────────────────────────────────────────────────────┤
│  3. STYLES                                           │
│     style({ opacity: 0, transform: ... })            │
├──────────────────────────────────────────────────────┤
│  4. TIMING                                           │
│     duration, delay, easing                          │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Setup Inicial

### Importar Módulo de Animaciones

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // Habilita animaciones
  ],
});

// Para deshabilitar animaciones
// provideNoopAnimations()
```

---

## 🎯 Animaciones Básicas

### Fade In/Out

```typescript
import { Component } from '@angular/core';
import { 
  trigger, 
  state, 
  style, 
  transition, 
  animate 
} from '@angular/animations';

@Component({
  selector: 'app-fade',
  template: `
    <button (click)="toggle()">Toggle</button>
    <div [@fadeInOut]="isVisible ? 'visible' : 'hidden'">
      Contenido que aparece/desaparece
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      state('visible', style({
        opacity: 1,
      })),
      state('hidden', style({
        opacity: 0,
      })),
      transition('visible <=> hidden', [
        animate('300ms ease-in-out')
      ]),
    ]),
  ],
})
export class FadeComponent {
  isVisible = true;
  
  toggle() {
    this.isVisible = !this.isVisible;
  }
}
```

### Enter/Leave Animations

```typescript
@Component({
  selector: 'app-list',
  template: `
    <button (click)="addItem()">Add Item</button>
    
    @for (item of items; track item.id) {
      <div @fadeSlideIn class="item">
        {{ item.name }}
        <button (click)="removeItem(item.id)">×</button>
      </div>
    }
  `,
  animations: [
    trigger('fadeSlideIn', [
      // :enter es alias de void => *
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-20px)',
        }),
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateX(0)',
        })),
      ]),
      // :leave es alias de * => void
      transition(':leave', [
        animate('200ms ease-in', style({
          opacity: 0,
          transform: 'translateX(20px)',
        })),
      ]),
    ]),
  ],
})
export class ListComponent {
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];
  nextId = 3;
  
  addItem() {
    this.items.push({ id: this.nextId++, name: `Item ${this.nextId}` });
  }
  
  removeItem(id: number) {
    this.items = this.items.filter(item => item.id !== id);
  }
}
```

### Slide Toggle

```typescript
@Component({
  selector: 'app-accordion',
  template: `
    <div class="accordion">
      <button (click)="toggle()">
        {{ isOpen ? '−' : '+' }} {{ title }}
      </button>
      
      <div [@slideToggle]="isOpen ? 'open' : 'closed'" class="content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  animations: [
    trigger('slideToggle', [
      state('closed', style({
        height: '0',
        overflow: 'hidden',
        opacity: 0,
      })),
      state('open', style({
        height: '*',
        overflow: 'visible',
        opacity: 1,
      })),
      transition('closed <=> open', [
        animate('300ms ease-in-out')
      ]),
    ]),
  ],
})
export class AccordionComponent {
  @Input() title = 'Accordion';
  isOpen = false;
  
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
```

---

## 🔄 Animaciones de Transición

### Multiple States

```typescript
@Component({
  selector: 'app-traffic-light',
  template: `
    <div [@trafficLight]="state" class="light">
      {{ state }}
    </div>
    <button (click)="next()">Next</button>
  `,
  styles: [`
    .light {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
  animations: [
    trigger('trafficLight', [
      state('red', style({
        backgroundColor: '#f44336',
        color: 'white',
      })),
      state('yellow', style({
        backgroundColor: '#ffeb3b',
        color: 'black',
      })),
      state('green', style({
        backgroundColor: '#4caf50',
        color: 'white',
      })),
      transition('red => yellow', animate('500ms')),
      transition('yellow => green', animate('500ms')),
      transition('green => red', animate('500ms')),
    ]),
  ],
})
export class TrafficLightComponent {
  states = ['red', 'yellow', 'green'];
  currentIndex = 0;
  
  get state() {
    return this.states[this.currentIndex];
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.states.length;
  }
}
```

### Wildcard Transitions

```typescript
@Component({
  animations: [
    trigger('boxState', [
      state('small', style({
        width: '100px',
        height: '100px',
        backgroundColor: 'blue',
      })),
      state('medium', style({
        width: '200px',
        height: '200px',
        backgroundColor: 'green',
      })),
      state('large', style({
        width: '300px',
        height: '300px',
        backgroundColor: 'red',
      })),
      // Transición desde cualquier estado a cualquier estado
      transition('* => *', [
        animate('500ms ease-in-out')
      ]),
    ]),
  ],
})
export class BoxComponent {
  state = 'small';
  
  changeState(newState: string) {
    this.state = newState;
  }
}
```

---

## ⏱️ Timing y Easing

### Diferentes Timings

```typescript
@Component({
  animations: [
    trigger('timingExamples', [
      // Solo duración
      transition('* => fast', [
        animate('100ms', style({ opacity: 1 }))
      ]),
      
      // Duración + delay
      transition('* => delayed', [
        animate('300ms 100ms', style({ opacity: 1 }))
      ]),
      
      // Duración + delay + easing
      transition('* => smooth', [
        animate('500ms 200ms ease-in-out', style({ opacity: 1 }))
      ]),
      
      // Estados específicos de easing
      transition('* => easeIn', [
        animate('400ms ease-in', style({ transform: 'translateX(100px)' }))
      ]),
      transition('* => easeOut', [
        animate('400ms ease-out', style({ transform: 'translateX(100px)' }))
      ]),
      transition('* => cubic', [
        animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'scale(1.5)' })
        )
      ]),
    ]),
  ],
})
export class TimingComponent {}
```

### Animaciones Secuenciales

```typescript
import { sequence, animate, style } from '@angular/animations';

@Component({
  animations: [
    trigger('sequence', [
      transition('* => *', [
        sequence([
          // Paso 1: Fade out
          animate('200ms', style({ opacity: 0 })),
          // Paso 2: Cambiar tamaño
          animate('300ms', style({ 
            opacity: 1,
            transform: 'scale(1.2)' 
          })),
          // Paso 3: Volver a normal
          animate('200ms', style({ 
            transform: 'scale(1)' 
          })),
        ]),
      ]),
    ]),
  ],
})
export class SequenceComponent {}
```

### Animaciones Paralelas

```typescript
import { group, animate, style } from '@angular/animations';

@Component({
  animations: [
    trigger('parallel', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-100px) scale(0.5)',
        }),
        group([
          // Ambas animaciones ocurren al mismo tiempo
          animate('500ms ease-out', style({ 
            opacity: 1 
          })),
          animate('800ms ease-out', style({ 
            transform: 'translateY(0) scale(1)' 
          })),
        ]),
      ]),
    ]),
  ],
})
export class ParallelComponent {}
```

---

## 🎭 Animaciones Avanzadas

### Keyframes

```typescript
import { keyframes } from '@angular/animations';

@Component({
  template: `
    <button (click)="shake()">Shake!</button>
    <div [@shakeAnimation]="shakeState">
      Shake me!
    </div>
  `,
  animations: [
    trigger('shakeAnimation', [
      transition('* => shake', [
        animate('500ms', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-10px)', offset: 0.1 }),
          style({ transform: 'translateX(10px)', offset: 0.2 }),
          style({ transform: 'translateX(-10px)', offset: 0.3 }),
          style({ transform: 'translateX(10px)', offset: 0.4 }),
          style({ transform: 'translateX(-10px)', offset: 0.5 }),
          style({ transform: 'translateX(10px)', offset: 0.6 }),
          style({ transform: 'translateX(-10px)', offset: 0.7 }),
          style({ transform: 'translateX(10px)', offset: 0.8 }),
          style({ transform: 'translateX(0)', offset: 1 }),
        ])),
      ]),
    ]),
  ],
})
export class ShakeComponent {
  shakeState = 'default';
  
  shake() {
    this.shakeState = 'shake';
    setTimeout(() => this.shakeState = 'default', 500);
  }
}
```

### Bounce Animation

```typescript
@Component({
  animations: [
    trigger('bounce', [
      transition(':enter', [
        animate('600ms ease-in', keyframes([
          style({ transform: 'translateY(-100%)', offset: 0 }),
          style({ transform: 'translateY(0)', offset: 0.5 }),
          style({ transform: 'translateY(-15%)', offset: 0.65 }),
          style({ transform: 'translateY(0)', offset: 0.8 }),
          style({ transform: 'translateY(-5%)', offset: 0.9 }),
          style({ transform: 'translateY(0)', offset: 1 }),
        ])),
      ]),
    ]),
  ],
})
export class BounceComponent {}
```

### Animación con Parámetros

```typescript
@Component({
  template: `
    <div 
      @customAnimation="{
        value: animState,
        params: {
          duration: '500ms',
          delay: '100ms',
          scale: 1.2
        }
      }"
    >
      Animated content
    </div>
  `,
  animations: [
    trigger('customAnimation', [
      transition('* => *', [
        style({
          transform: 'scale(1)',
          opacity: 0,
        }),
        animate(
          '{{ duration }} {{ delay }}',
          style({
            transform: 'scale({{ scale }})',
            opacity: 1,
          })
        ),
      ], { params: { duration: '300ms', delay: '0ms', scale: 1 } }),
    ]),
  ],
})
export class ParamComponent {
  animState = 'default';
}
```

---

## 🎬 Route Animations

### Route Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent, data: { animation: 'HomePage' } },
  { path: 'about', component: AboutComponent, data: { animation: 'AboutPage' } },
  { path: 'contact', component: ContactComponent, data: { animation: 'ContactPage' } },
];
```

### Route Animation Container

```typescript
// app.component.ts
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations';

@Component({
  selector: 'app-root',
  template: `
    <div [@routeAnimations]="getRouteAnimationData()">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  animations: [slideInAnimation],
})
export class AppComponent {
  getRouteAnimationData() {
    const outlet = this.outlet;
    return outlet?.activatedRouteData?.['animation'];
  }
  
  @ViewChild(RouterOutlet) outlet!: RouterOutlet;
}
```

### Route Animation Definition

```typescript
// animations.ts
import { 
  trigger, 
  transition, 
  style, 
  query, 
  group, 
  animate 
} from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('HomePage => AboutPage', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
      }),
    ]),
    group([
      query(':leave', [
        animate('300ms ease-out', style({
          opacity: 0,
          transform: 'translateX(-100%)',
        })),
      ]),
      query(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(100%)',
        }),
        animate('300ms 100ms ease-out', style({
          opacity: 1,
          transform: 'translateX(0)',
        })),
      ]),
    ]),
  ]),
  
  // Fade transition por defecto
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
      }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0 }),
        animate('300ms 100ms ease-out', style({ opacity: 1 })),
      ], { optional: true }),
    ]),
  ]),
]);
```

---

## 🎨 Animaciones Reutilizables

### Animation Factory

```typescript
// animations/reusable.animations.ts
import { animation, style, animate, keyframes } from '@angular/animations';

// Animación reutilizable
export const fadeIn = animation([
  style({ opacity: 0 }),
  animate('{{ duration }}', style({ opacity: 1 })),
]);

export const fadeOut = animation([
  animate('{{ duration }}', style({ opacity: 0 })),
]);

export const slideIn = animation([
  style({ transform: 'translateX({{ startX }})' }),
  animate('{{ duration }} {{ delay }}', style({ 
    transform: 'translateX(0)' 
  })),
]);

export const pulse = animation([
  animate('{{ duration }}', keyframes([
    style({ transform: 'scale(1)', offset: 0 }),
    style({ transform: 'scale({{ scale }})', offset: 0.5 }),
    style({ transform: 'scale(1)', offset: 1 }),
  ])),
]);
```

### Usar Animaciones Reutilizables

```typescript
import { useAnimation } from '@angular/animations';
import { fadeIn, fadeOut, pulse } from './animations/reusable.animations';

@Component({
  animations: [
    trigger('reusable', [
      transition(':enter', [
        useAnimation(fadeIn, {
          params: { duration: '500ms' }
        }),
      ]),
      transition(':leave', [
        useAnimation(fadeOut, {
          params: { duration: '300ms' }
        }),
      ]),
    ]),
    trigger('pulseAnimation', [
      transition('* => pulse', [
        useAnimation(pulse, {
          params: { 
            duration: '600ms',
            scale: 1.3 
          }
        }),
      ]),
    ]),
  ],
})
export class ReusableAnimComponent {}
```

---

## 🎯 Animation Callbacks

### Start y Done Events

```typescript
@Component({
  template: `
    <div 
      @fadeInOut
      (@fadeInOut.start)="onAnimationStart($event)"
      (@fadeInOut.done)="onAnimationDone($event)"
    >
      Animated content
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class CallbackComponent {
  onAnimationStart(event: any) {
    console.log('Animation started!', event);
    // event.toState, event.fromState, event.totalTime, etc.
  }
  
  onAnimationDone(event: any) {
    console.log('Animation completed!', event);
  }
}
```

---

## 📋 Checklist

### Básico
- [ ] Importar `provideAnimations()` en main.ts
- [ ] Usar `trigger()` para definir animación
- [ ] Definir `state()` para estados
- [ ] Usar `transition()` para cambios
- [ ] Aplicar `animate()` con timing

### Avanzado
- [ ] Usar `:enter` y `:leave` para inserción/eliminación
- [ ] Implementar animaciones con `keyframes`
- [ ] Crear animaciones secuenciales con `sequence()`
- [ ] Animaciones paralelas con `group()`
- [ ] Parámetros dinámicos en animaciones

### Route Animations
- [ ] Configurar `data: { animation }` en rutas
- [ ] Crear trigger para route animations
- [ ] Usar `query()` para entrada/salida
- [ ] Manejar transiciones bidireccionales

### Reutilización
- [ ] Extraer animaciones comunes con `animation()`
- [ ] Usar `useAnimation()` para reutilizar
- [ ] Crear librería de animaciones del proyecto
- [ ] Documentar parámetros de animaciones

### Performance
- [ ] Usar `transform` y `opacity` (GPU-accelerated)
- [ ] Evitar animar propiedades costosas (width, height)
- [ ] Deshabilitar animaciones para tests
- [ ] Considerar `will-change` CSS para performance

---

## ⚠️ Anti-Patterns

### ❌ Animar Propiedades Costosas

```typescript
// ❌ MAL: width/height disparan layout
trigger('bad', [
  transition('* => *', [
    animate('300ms', style({ 
      width: '500px',
      height: '300px' 
    }))
  ])
])

// ✅ BIEN: transform usa GPU
trigger('good', [
  transition('* => *', [
    animate('300ms', style({ 
      transform: 'scale(1.5)' 
    }))
  ])
])
```

### ❌ No Manejar Estados Intermedios

```typescript
// ❌ MAL: Estados indefinidos
trigger('incomplete', [
  state('open', style({ height: '200px' })),
  state('closed', style({ height: '0' })),
  // Falta transition!
])

// ✅ BIEN: Transitions definidas
trigger('complete', [
  state('open', style({ height: '200px' })),
  state('closed', style({ height: '0' })),
  transition('open <=> closed', animate('300ms'))
])
```

---

## 🔗 Skills Relacionadas

- `angular/component-creation` - Componentes con animaciones
- `angular/routing` - Route animations
- `angular/directives` - Directivas animadas
- `angular/performance` - Optimización de animaciones

---

## 📚 Referencias

- [Angular Animations](https://angular.dev/guide/animations)
- [Animation Transitions](https://angular.dev/guide/animations/transitions-and-triggers)
- [Route Animations](https://angular.dev/guide/animations/route-animations)
- [Reusable Animations](https://angular.dev/guide/animations/reusable-animations)
