/**
 * ============================================================================
 * DESIGN CONFIG - Configuración del tema activo
 * ============================================================================
 *
 * 🎨 CAMBIAR TEMA:
 * Simplemente modifica DEFAULT_THEME con cualquiera de los 22 temas disponibles:
 *
 * COLORES CÁLIDOS:     'red' | 'orange' | 'amber' | 'yellow'
 * VERDES:              'lime' | 'green' | 'emerald' | 'teal'
 * AZULES:              'cyan' | 'sky' | 'blue' | 'indigo'
 * PÚRPURAS:            'violet' | 'purple' | 'fuchsia'
 * ROSAS:               'pink' | 'rose'
 * NEUTRALES:           'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
 * OSCURO:              'dark'
 */

import { THEMES, THEME_INFO, THEME_CATEGORIES, ALL_THEMES } from './themes.config';
import type {
  ThemeName,
  ThemeConfig,
  ThemeColors,
  ThemeSurfaces,
  ThemeNeutrals,
  ThemeSemantic,
  ThemeMode,
  ThemeInfo,
} from './themes.config';

// ============================================================================
// ⭐ TEMA POR DEFECTO - CAMBIAR AQUÍ
// ============================================================================

/**
 * 🎯 TEMA POR DEFECTO DEL PROYECTO
 * Cambia este valor para aplicar un tema diferente al iniciar la app
 */
export const DEFAULT_THEME: ThemeName = 'blue';

// ============================================================================
// RE-EXPORTACIONES
// ============================================================================

export { THEMES, THEME_INFO, THEME_CATEGORIES, ALL_THEMES };
export type {
  ThemeName,
  ThemeConfig,
  ThemeColors,
  ThemeSurfaces,
  ThemeNeutrals,
  ThemeSemantic,
  ThemeMode,
  ThemeInfo,
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene la configuración de un tema específico
 */
export function getTheme(name: ThemeName): ThemeConfig {
  return THEMES[name];
}

/**
 * Obtiene la configuración del tema por defecto
 */
export function getDefaultTheme(): ThemeConfig {
  return THEMES[DEFAULT_THEME];
}

/**
 * Verifica si un nombre de tema es válido
 */
export function isValidTheme(name: string): name is ThemeName {
  return ALL_THEMES.includes(name as ThemeName);
}

// ============================================================================
// COMPATIBILIDAD CON CÓDIGO EXISTENTE
// ============================================================================

// Alias para compatibilidad con imports existentes
export const PROJECT_DESIGN_CONFIG: ThemeConfig = getDefaultTheme();
export const ACTIVE_THEME: ThemeName = DEFAULT_THEME;
export const AVAILABLE_THEMES: ThemeName[] = ALL_THEMES;

// Compatibilidad con type anterior
export type DesignConfig = ThemeConfig;
