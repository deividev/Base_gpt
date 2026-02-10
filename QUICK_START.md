# 🚀 Quick Start Guide

## Paso 1: Entender la Estructura

```
Base_Skills/
├── agents/          # Definiciones de agentes especializados
├── skills/          # Conocimientos y patrones reutilizables
├── config/          # Configuraciones de agents y skills
├── docs/            # Documentación del sistema
└── angular-app/     # Tu aplicación Angular (próximo paso)
```

## Paso 2: Revisar Agents Disponibles

Abre `config/agent-config.json` para ver los agents:
- **Angular Developer**: Desarrollo de componentes y features
- **Architecture**: Diseño de estructura y patrones
- **Testing**: Creación de tests
- **Code Reviewer**: Revisión y mejoras de código

## Paso 3: Explorar Skills

Revisa las skills disponibles en:
- `skills/angular/` - Skills de Angular
- `skills/architecture/` - Arquitectura
- `skills/core/` - TypeScript y fundamentales

## Paso 4: Crear el Proyecto Angular

Ejecuta los siguientes comandos:

```bash
# Instalar Angular CLI si no lo tienes
npm install -g @angular/cli

# Crear proyecto Angular 21
ng new angular-app --standalone --routing --style=scss

# Navegar al proyecto
cd angular-app

# Instalar dependencias
npm install
```

## Paso 5: Usar el Sistema

### Ejemplo 1: Crear un Componente
```
"Como Angular Developer Agent, crea un componente 
de dashboard usando la skill de component-creation"
```

### Ejemplo 2: Diseñar Feature
```
"Como Architecture Agent, diseña la estructura 
para un módulo de gestión de usuarios usando 
Clean Architecture"
```

### Ejemplo 3: Crear Tests
```
"Como Testing Agent, crea tests unitarios para 
el componente UserProfile"
```

## Paso 6: Personalizar

### Agregar tus propias Skills de Angular

1. Crea archivo en `skills/angular/mi-skill.md`
2. Usa el template en `skills/_template-skill.md`
3. Actualiza `config/skill-registry.json`

### Configurar Agent Personalizado

1. Edita `config/agent-config.json`
2. Agrega tu agent con skills específicas
3. Define responsabilidades y constraints

## 📖 Documentación Completa

Lee `docs/usage-guide.md` para guía detallada de uso.

## 🎯 Próximos Pasos Recomendados

1. ✅ Estructura base creada
2. 📝 Revisar skills existentes
3. 🚀 Generar proyecto Angular
4. 🎨 Crear primer componente con agents
5. 🔧 Personalizar según tus necesidades
6. 📚 Agregar tus propias skills de buenas prácticas

## 💡 Tips

- Sé específico en tus peticiones
- Menciona el agent o skill que quieres usar
- Pide revisiones con el Code Review Agent
- Documenta tus decisiones arquitectónicas
- Mantén las skills actualizadas

## 🆘 Ayuda

Si tienes dudas:
1. Consulta `docs/usage-guide.md`
2. Revisa ejemplos en las skills
3. Pregunta específicamente: "¿Cómo uso la skill X para Y?"
