# Agents - Agentes Especializados

## 🤖 ¿Qué son los Agents?

Los agents son perfiles especializados que Claude puede adoptar según la tarea. Cada agente tiene:

- **Rol específico**: Frontend, Backend, Testing, Architecture, etc.
- **Responsabilidades**: Qué debe hacer y qué no
- **Skills asociadas**: Qué habilidades puede utilizar
- **Contexto**: Información relevante para sus decisiones

## 📋 Agents Disponibles

### 1. Angular Developer Agent

- **Archivo**: `angular-developer.json`
- **Rol**: Desarrollo de componentes, servicios y features de Angular
- **Skills**: Angular, TypeScript, RxJS, State Management

### 2. Architecture Agent

- **Archivo**: `architecture-agent.json`
- **Rol**: Diseño de estructura, patrones y decisiones arquitectónicas
- **Skills**: Design Patterns, SOLID, Clean Architecture

### 3. Testing Agent

- **Archivo**: `testing-agent.json`
- **Rol**: Creación y mantenimiento de tests
- **Skills**: Jest, Jasmine, Testing Library, E2E

### 4. Code Review Agent

- **Archivo**: `code-review-agent.json`
- **Rol**: Revisar código y sugerir mejoras
- **Skills**: Best Practices, Performance, Security

## 🔄 Cómo Funcionan

1. Usuario solicita una tarea
2. Se selecciona el agent apropiado
3. El agent carga sus skills asociadas
4. Ejecuta la tarea según su configuración
5. Aplica buenas prácticas automáticamente

## ✨ Ejemplo de Uso

```
"Necesito crear un componente de dashboard"
→ Se activa: Angular Developer Agent
→ Usa skills: angular/component-creation, angular/routing, angular/services
→ Aplica: Mejores prácticas de Angular 21
```
