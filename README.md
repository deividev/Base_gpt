# Agent Games Web - Base Skills

Sistema de Agents y Skills para desarrollo autónomo con Claude AI

## 📁 Estructura del Proyecto

```
Base_Skills/
├── agents/                 # Definiciones de agentes especializados
│   ├── README.md
│   └── definitions/       # Configuraciones de cada agente
├── skills/                # Habilidades y capacidades reutilizables
│   ├── README.md
│   ├── angular/          # Skills específicas de Angular
│   ├── architecture/     # Patrones y arquitectura
│   ├── testing/          # Testing y QA
│   └── core/            # Skills fundamentales
├── config/               # Configuraciones globales
│   ├── agent-config.json
│   └── skill-registry.json
├── docs/                 # Documentación del proyecto
│   └── guides/
└── angular-app/          # Aplicación Angular (se generará)
```

## 🎯 Objetivo

Crear un sistema donde Claude pueda:
- Asumir diferentes roles (agents) según la tarea
- Utilizar skills específicas y bien definidas
- Mantener consistencia en el código
- Aplicar mejores prácticas automáticamente

## 🚀 Próximos Pasos

1. ✅ Estructura base creada
2. ⏳ Configurar agents especializados
3. ⏳ Definir skills de Angular
4. ⏳ Generar aplicación Angular
5. ⏳ Integrar sistema de skills en el workflow

## 📝 Uso

Los archivos de agents y skills guían a Claude en cómo debe:
- Estructurar componentes
- Implementar patrones
- Realizar testing
- Mantener código limpio y escalable

## 🔧 Requisitos y Compatibilidad

**Angular 21** con tecnologías actualizadas:
- 📌 **Node.js**: 18.19+ o 20.11+ (recomendado: 20.17.0 LTS)
- 📌 **TypeScript**: 5.8+ (requerido por Angular 21)
- 📌 **Jest**: 29.7+ (reemplaza Jasmine/Karma deprecated)
- 📌 **Cypress**: 13.16+ | **Playwright**: 1.48+
- 📌 **RxJS**: 7.8+ | **NgRx**: 18.0+

📖 **Ver [COMPATIBILITY.md](COMPATIBILITY.md)** para la matriz completa de compatibilidad con versiones específicas de todas las bibliotecas.

### 🎉 Nuevo: Skills de Boise State Importadas

Se han importado skills profesionales de **Angular 21 Best Practices** desde el proyecto open-source de Boise State University. Ver [INSTALLATION_REPORT.md](INSTALLATION_REPORT.md) para detalles completos.

**Skills añadidas**:
- ✅ `angular-best-practices.md` - Guía completa de Angular 21
- ✅ `signal-patterns.md` - Patrones avanzados con signals

**Capacidades nuevas**: Signals avanzados, nueva sintaxis de templates, OnPush detection, inject(), resources, accesibilidad WCAG AA, y más.
