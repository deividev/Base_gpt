# 🔧 Compatibility Matrix - Angular 21

Esta guía detalla las versiones exactas de todas las tecnologías y bibliotecas compatibles con Angular 21.

## 📋 Requisitos del Sistema

### Node.js

- **Versión Mínima**: 18.19.0 o 20.11.0+
- **Recomendado**: 20.17.0+ (LTS)
- **Verificar versión**: `node --version`

### npm

- **Versión Mínima**: 9.x+
- **Recomendado**: 10.x+
- **Verificar versión**: `npm --version`

---

## 🎯 Core Framework

### Angular 21

```json
{
  "@angular/core": "^21.0.0",
  "@angular/common": "^21.0.0",
  "@angular/compiler": "^21.0.0",
  "@angular/platform-browser": "^21.0.0",
  "@angular/platform-browser-dynamic": "^21.0.0"
}
```

### TypeScript

- **Versión Requerida**: 5.8+
- **Compatibilidad**: Angular 21 requiere TypeScript 5.8.0 o superior

```json
{
  "typescript": "~5.8.0"
}
```

### RxJS

- **Versión Mínima**: 7.8.0+
- **Compatible con**: RxJS 8.x

```json
{
  "rxjs": "^7.8.0"
}
```

### Zone.js

```json
{
  "zone.js": "~0.15.0"
}
```

---

## 🧪 Testing

### Jest

- **Versión**: 29.7.0+
- **Preset Angular**: jest-preset-angular 14.x+
- **Builder**: @angular-builders/jest 18.x+

```json
{
  "jest": "^29.7.0",
  "@types/jest": "^29.5.0",
  "@angular-builders/jest": "^18.0.0",
  "jest-preset-angular": "^14.0.0",
  "@testing-library/angular": "^17.0.0",
  "@testing-library/jest-dom": "^6.1.0"
}
```

**Notas**:

- ✅ Jest es el framework recomendado para Angular 21
- ⚠️ Jasmine/Karma están deprecated desde Angular 18

### Cypress

- **Versión**: 13.16.0+

```json
{
  "cypress": "^13.16.0",
  "@types/cypress": "^1.1.0"
}
```

### Playwright

- **Versión**: 1.48.0+

```json
{
  "@playwright/test": "^1.48.0"
}
```

---

## 🏗️ UI & Components

### Angular CDK

```json
{
  "@angular/cdk": "^21.0.0"
}
```

### Angular Material (opcional)

```json
{
  "@angular/material": "^21.0.0"
}
```

---

## 📊 State Management

### NgRx

- **Versión**: 18.x+ (compatible con Angular 21)

```json
{
  "@ngrx/store": "^18.0.0",
  "@ngrx/effects": "^18.0.0",
  "@ngrx/entity": "^18.0.0",
  "@ngrx/store-devtools": "^18.0.0",
  "@ngrx/router-store": "^18.0.0"
}
```

**Alternativas**:

- Signals (built-in en Angular 21) - ✅ Recomendado para apps nuevas
- Akita
- NGXS

---

## 🌍 Internacionalización

### Transloco

```json
{
  "@jsverse/transloco": "^7.0.0"
}
```

**Alternativa**:

- `@angular/localize` (built-in) para compile-time i18n

---

## 🔐 Security & Authentication

### DOMPurify

```json
{
  "dompurify": "^3.1.0",
  "@types/dompurify": "^3.0.0"
}
```

### OAuth 2.0 / OIDC

```json
{
  "angular-oauth2-oidc": "^18.0.0"
}
```

---

## 📱 PWA

### Angular Service Worker

```json
{
  "@angular/service-worker": "^21.0.0"
}
```

---

## 🛠️ Development Tools

### Angular CLI

```json
{
  "@angular/cli": "^21.0.0"
}
```

### ESLint (recomendado sobre TSLint)

```json
{
  "@angular-eslint/builder": "^18.0.0",
  "@angular-eslint/eslint-plugin": "^18.0.0",
  "@angular-eslint/eslint-plugin-template": "^18.0.0",
  "@angular-eslint/schematics": "^18.0.0",
  "@angular-eslint/template-parser": "^18.0.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "eslint": "^9.0.0"
}
```

### Prettier

```json
{
  "prettier": "^3.3.0",
  "eslint-config-prettier": "^9.1.0"
}
```

---

## ⚡ Performance & Build

### Build Tools

- **esbuild**: Built-in en Angular 21 (default)
- **Vite**: Experimental pero soportado

---

## 🌐 HTTP & APIs

### HTTP Client

- `@angular/common/http` (built-in)
- Compatible con fetch API

---

## 📦 Package Managers

### npm (recomendado)

- Versión: 9.x o 10.x+

### Alternativas Compatibles

- **pnpm**: 8.x+ ✅
- **yarn**: 4.x+ ✅
- **bun**: 1.x+ ⚠️ (experimental)

---

## 🔄 Migración desde Versiones Anteriores

### Angular 18/19/20 → 21

```bash
# Actualizar Angular CLI globalmente
npm install -g @angular/cli@21

# En tu proyecto
ng update @angular/core@21 @angular/cli@21

# Actualizar TypeScript
npm install typescript@~5.8.0 --save-dev

# Actualizar dependencias relacionadas
ng update @angular/material@21
ng update @ngrx/store@18
```

### Cambios Breaking (Angular 21)

- TypeScript 5.8+ es obligatorio
- Jasmine/Karma completamente removido
- Algunas APIs deprecated en v18-20 fueron eliminadas
- Standalone components es el default (NgModules legacy)

---

## ✅ Verificación de Compatibilidad

### Script de Verificación

```bash
# Crear script check-versions.sh
#!/bin/bash

echo "🔍 Verificando versiones..."
echo ""
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Angular CLI: $(ng version 2>/dev/null | grep 'Angular CLI')"
echo "TypeScript: $(tsc --version)"
echo ""

# Verificar package.json
if [ -f "package.json" ]; then
  echo "📦 Dependencias del proyecto:"
  node -p "
    const pkg = require('./package.json');
    const deps = {...pkg.dependencies, ...pkg.devDependencies};
    Object.entries(deps)
      .filter(([name]) => name.includes('angular') || name.includes('jest') || name === 'typescript')
      .map(([name, version]) => \`  \${name}: \${version}\`)
      .join('\\n');
  "
fi
```

### Ejecutar Verificación

```bash
chmod +x check-versions.sh
./check-versions.sh
```

---

## 🚨 Problemas Comunes

### Error: "This version of Angular requires TypeScript 5.8+"

**Solución**:

```bash
npm install typescript@~5.8.0 --save-dev
```

### Error: "Cannot find module 'jest-preset-angular'"

**Solución**:

```bash
npm install jest-preset-angular@^14.0.0 --save-dev
```

### Error: "@angular-builders/jest incompatible with Angular 21"

**Solución**:

```bash
npm install @angular-builders/jest@^18.0.0 --save-dev
```

---

## 📚 Referencias Oficiales

- [Angular Update Guide](https://update.angular.io/)
- [Angular Version Compatibility](https://angular.dev/reference/versions)
- [TypeScript Breaking Changes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Changelog](https://docs.cypress.io/guides/references/changelog)
- [Playwright Releases](https://playwright.dev/docs/release-notes)

---

## 🔄 Última Actualización

**Fecha**: Febrero 2026  
**Angular Version**: 21.0.0  
**Estado**: ✅ Todas las versiones verificadas y compatibles

---

## 💡 Recomendaciones

1. ✅ **Usar Node.js LTS**: 20.17.0+ para mejor estabilidad
2. ✅ **TypeScript 5.8+**: Obligatorio para Angular 21
3. ✅ **Jest sobre Jasmine**: Jest es el estándar para Angular 21
4. ✅ **Signals sobre NgRx**: Para apps nuevas, considerar signals primero
5. ✅ **Standalone Components**: Default en Angular 21, no usar NgModules
6. ✅ **ESBuild**: Build tool default (más rápido que Webpack)

---

**🎯 ¿Dudas sobre compatibilidad?** Revisa siempre la [Angular Update Guide](https://update.angular.io/) oficial.
