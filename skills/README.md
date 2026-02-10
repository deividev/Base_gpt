# Skills - Habilidades Reutilizables

## 💡 ¿Qué son las Skills?

Las skills son conjuntos de conocimientos, patrones y buenas prácticas específicas que los agents pueden utilizar. Son modulares y reutilizables.

## 📚 Categorías de Skills

### Angular Skills (`angular/`)
- Creación de componentes
- Servicios y dependency injection
- Routing y navegación
- State management (NgRx, Signals)
- Forms (Reactive & Template-driven)
- HTTP y APIs
- Directivas y Pipes personalizadas
- Optimización y performance

### Architecture Skills (`architecture/`)
- Clean Architecture
- Design Patterns (Singleton, Factory, Observer, etc.)
- SOLID Principles
- DDD (Domain-Driven Design)
- Micro-frontends
- Modular architecture

### Testing Skills (`testing/`)
- Unit Testing
- Integration Testing
- E2E Testing
- Test-Driven Development (TDD)
- Mocking y Stubbing
- Code Coverage

### Core Skills (`core/`)
- TypeScript avanzado
- Git workflows
- Code documentation
- Error handling
- Logging y debugging
- Performance optimization

### Design Skills (`design/`)
- Design System & UI Guidelines
- Paletas de colores configurables
- Tipografía y escalas
- Sistema de espaciado
- Componentes visuales base
- Temas (light/dark mode)
- Responsive design patterns
- Accesibilidad visual (WCAG)

## 📝 Formato de Skills

Cada skill incluye:
```json
{
  "name": "skill-name",
  "description": "Qué hace esta skill",
  "category": "angular|architecture|testing|core",
  "version": "1.0.0",
  "rules": [
    "Lista de reglas a seguir"
  ],
  "patterns": {
    "ejemplos de código y patrones"
  },
  "checklist": [
    "Items a verificar al usar esta skill"
  ]
}
```

## 🎯 Objetivo

Cada skill debe ser:
- **Específica**: Enfocada en una tarea concreta
- **Clara**: Fácil de entender y aplicar
- **Completa**: Con ejemplos y explicaciones
- **Actualizada**: Según las últimas versiones y mejores prácticas
