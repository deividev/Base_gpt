/**
 * ============================================================================
 * TAILWIND CSS THEMES - Paleta Completa
 * ============================================================================
 *
 * 22 temas basados en los colores de Tailwind CSS v3.
 * Incluye variantes light y dark de cada color.
 *
 * 🎨 USO:
 * import { THEMES, ThemeName } from './themes.config';
 *
 * 🔄 CAMBIAR TEMA:
 * En design-config.ts, cambiar DEFAULT_THEME = 'blue' por el tema deseado
 * O usar ThemeService.setTheme('emerald') en runtime
 */

// ============================================================================
// TIPOS
// ============================================================================

export type ThemeName =
  // Colores principales de Tailwind
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  // Neutrales
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  // Modos oscuros
  | 'dark'
  | 'dark-blue'
  | 'dark-purple'
  | 'dark-emerald'
  | 'dark-rose'
  | 'dark-orange'
  | 'dark-cyan';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
}

export interface ThemeSurfaces {
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
}

export interface ThemeNeutrals {
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
}

export interface ThemeSemantic {
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
}

export interface ThemeConfig {
  name: string;
  description: string;
  mode: ThemeMode;
  colors: ThemeColors;
  surfaces: ThemeSurfaces;
  neutrals: ThemeNeutrals;
  semantic: ThemeSemantic;
  typography: {
    fontFamily: string;
    baseSize: string;
  };
  spacing: { base: number };
  borderRadius: { base: string };
  shadows: { enabled: boolean };
}

// ============================================================================
// PALETAS DE COLORES DE TAILWIND CSS
// ============================================================================

const TAILWIND_COLORS = {
  // Red
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Orange
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Amber
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Yellow
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  // Lime
  lime: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
  },
  // Green
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Emerald
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Teal
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  // Cyan
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  // Sky
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Blue
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Indigo
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  // Violet
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  // Purple
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  // Fuchsia
  fuchsia: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  // Pink
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  // Rose
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
  // Slate (blue-gray)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Gray (true gray)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Zinc (cool gray)
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  // Neutral
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  // Stone (warm gray)
  stone: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
};

// ============================================================================
// SURFACES PREDEFINIDOS
// ============================================================================

const LIGHT_SURFACES: ThemeSurfaces = {
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceAlt: '#f3f4f6',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
};

const DARK_SURFACES: ThemeSurfaces = {
  background: '#18181b',
  surface: '#27272a',
  surfaceAlt: '#3f3f46',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
};

// ============================================================================
// HELPER: Convertir colores Tailwind a ThemeNeutrals
// ============================================================================

function toNeutrals(colors: typeof TAILWIND_COLORS.gray): ThemeNeutrals {
  return {
    gray50: colors[50],
    gray100: colors[100],
    gray200: colors[200],
    gray300: colors[300],
    gray400: colors[400],
    gray500: colors[500],
    gray600: colors[600],
    gray700: colors[700],
    gray800: colors[800],
    gray900: colors[900],
  };
}

// ============================================================================
// NEUTRALS PREDEFINIDOS
// ============================================================================

const GRAY_NEUTRALS: ThemeNeutrals = toNeutrals(TAILWIND_COLORS.gray);
const SLATE_NEUTRALS: ThemeNeutrals = toNeutrals(TAILWIND_COLORS.slate);
const ZINC_NEUTRALS: ThemeNeutrals = toNeutrals(TAILWIND_COLORS.zinc);

// ============================================================================
// SEMANTIC COLORS (Light Mode)
// ============================================================================

const LIGHT_SEMANTIC: ThemeSemantic = {
  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#059669',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',
  error: '#ef4444',
  errorLight: '#fee2e2',
  errorDark: '#dc2626',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#2563eb',
};

const DARK_SEMANTIC: ThemeSemantic = {
  success: '#34d399',
  successLight: '#6ee7b7',
  successDark: '#10b981',
  warning: '#fbbf24',
  warningLight: '#fcd34d',
  warningDark: '#f59e0b',
  error: '#f87171',
  errorLight: '#fca5a5',
  errorDark: '#ef4444',
  info: '#60a5fa',
  infoLight: '#93c5fd',
  infoDark: '#3b82f6',
};

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_TYPOGRAPHY = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  baseSize: '16px',
};

const DEFAULT_SPACING = { base: 4 };
const DEFAULT_BORDER_RADIUS = { base: '0.5rem' };
const DEFAULT_SHADOWS = { enabled: true };

// ============================================================================
// HELPER: Crear tema desde color de Tailwind
// ============================================================================

function createTheme(
  name: string,
  description: string,
  primaryColor: keyof typeof TAILWIND_COLORS,
  secondaryColor: keyof typeof TAILWIND_COLORS,
  accentColor: keyof typeof TAILWIND_COLORS,
  mode: ThemeMode = 'light',
  neutralScale: keyof typeof TAILWIND_COLORS = 'gray',
): ThemeConfig {
  const primary = TAILWIND_COLORS[primaryColor];
  const secondary = TAILWIND_COLORS[secondaryColor];
  const accent = TAILWIND_COLORS[accentColor];
  const neutrals = TAILWIND_COLORS[neutralScale];

  const isLight = mode === 'light';

  return {
    name,
    description,
    mode,
    colors: {
      primary: isLight ? primary[500] : primary[400],
      primaryLight: isLight ? primary[400] : primary[300],
      primaryDark: isLight ? primary[600] : primary[500],
      secondary: isLight ? secondary[500] : secondary[400],
      secondaryLight: isLight ? secondary[400] : secondary[300],
      secondaryDark: isLight ? secondary[600] : secondary[500],
      accent: isLight ? accent[500] : accent[400],
      accentLight: isLight ? accent[400] : accent[300],
      accentDark: isLight ? accent[600] : accent[500],
    },
    surfaces: isLight ? LIGHT_SURFACES : DARK_SURFACES,
    neutrals: toNeutrals(neutrals),
    semantic: isLight ? LIGHT_SEMANTIC : DARK_SEMANTIC,
    typography: DEFAULT_TYPOGRAPHY,
    spacing: DEFAULT_SPACING,
    borderRadius: DEFAULT_BORDER_RADIUS,
    shadows: DEFAULT_SHADOWS,
  };
}

// ============================================================================
// TODOS LOS TEMAS
// ============================================================================

export const THEMES: Record<ThemeName, ThemeConfig> = {
  // === COLORES CÁLIDOS ===
  red: createTheme('Red', 'Rojo intenso - Energía y pasión', 'red', 'orange', 'pink'),
  orange: createTheme(
    'Orange',
    'Naranja vibrante - Creatividad y entusiasmo',
    'orange',
    'amber',
    'red',
  ),
  amber: createTheme('Amber', 'Ámbar dorado - Calidez y optimismo', 'amber', 'yellow', 'orange'),
  yellow: createTheme(
    'Yellow',
    'Amarillo brillante - Alegría y claridad',
    'yellow',
    'amber',
    'lime',
  ),

  // === COLORES VERDES ===
  lime: createTheme('Lime', 'Lima fresco - Energía natural', 'lime', 'green', 'emerald'),
  green: createTheme(
    'Green',
    'Verde clásico - Naturaleza y crecimiento',
    'green',
    'emerald',
    'teal',
  ),
  emerald: createTheme('Emerald', 'Esmeralda - Elegancia natural', 'emerald', 'teal', 'cyan'),
  teal: createTheme('Teal', 'Teal sofisticado - Balance y calma', 'teal', 'cyan', 'emerald'),

  // === COLORES AZULES ===
  cyan: createTheme('Cyan', 'Cian moderno - Frescura tecnológica', 'cyan', 'sky', 'teal'),
  sky: createTheme('Sky', 'Cielo abierto - Libertad y claridad', 'sky', 'blue', 'cyan'),
  blue: createTheme('Blue', 'Azul profesional - Confianza y estabilidad', 'blue', 'indigo', 'sky'),
  indigo: createTheme(
    'Indigo',
    'Índigo profundo - Sabiduría y creatividad',
    'indigo',
    'violet',
    'blue',
  ),

  // === COLORES PÚRPURA ===
  violet: createTheme(
    'Violet',
    'Violeta místico - Imaginación e intuición',
    'violet',
    'purple',
    'indigo',
  ),
  purple: createTheme('Purple', 'Púrpura real - Lujo y creatividad', 'purple', 'fuchsia', 'violet'),
  fuchsia: createTheme(
    'Fuchsia',
    'Fucsia vibrante - Audacia y diversión',
    'fuchsia',
    'pink',
    'purple',
  ),

  // === COLORES ROSA ===
  pink: createTheme('Pink', 'Rosa suave - Dulzura y romance', 'pink', 'rose', 'fuchsia'),
  rose: createTheme('Rose', 'Rosa intenso - Pasión moderna', 'rose', 'pink', 'red'),

  // === NEUTRALES ===
  slate: createTheme(
    'Slate',
    'Gris azulado - Profesional y sofisticado',
    'slate',
    'blue',
    'cyan',
    'light',
    'slate',
  ),
  gray: createTheme(
    'Gray',
    'Gris neutro - Minimalista y versátil',
    'gray',
    'blue',
    'indigo',
    'light',
    'gray',
  ),
  zinc: createTheme(
    'Zinc',
    'Gris frío - Moderno y técnico',
    'zinc',
    'sky',
    'violet',
    'light',
    'zinc',
  ),
  neutral: createTheme(
    'Neutral',
    'Neutro puro - Limpio y equilibrado',
    'neutral',
    'blue',
    'emerald',
    'light',
    'neutral',
  ),
  stone: createTheme(
    'Stone',
    'Gris cálido - Acogedor y natural',
    'stone',
    'amber',
    'emerald',
    'light',
    'stone',
  ),

  // === MODOS OSCUROS ===
  dark: createTheme(
    'Dark',
    'Modo oscuro - Elegante y moderno',
    'sky',
    'violet',
    'fuchsia',
    'dark',
    'zinc',
  ),
  'dark-blue': createTheme(
    'Dark Blue',
    'Azul oscuro - Profundo y profesional',
    'blue',
    'indigo',
    'cyan',
    'dark',
    'slate',
  ),
  'dark-purple': createTheme(
    'Dark Purple',
    'Púrpura oscuro - Misterioso y creativo',
    'violet',
    'purple',
    'fuchsia',
    'dark',
    'zinc',
  ),
  'dark-emerald': createTheme(
    'Dark Emerald',
    'Esmeralda oscuro - Natural y elegante',
    'emerald',
    'teal',
    'cyan',
    'dark',
    'neutral',
  ),
  'dark-rose': createTheme(
    'Dark Rose',
    'Rosa oscuro - Romántico y moderno',
    'rose',
    'pink',
    'fuchsia',
    'dark',
    'zinc',
  ),
  'dark-orange': createTheme(
    'Dark Orange',
    'Naranja oscuro - Cálido y energético',
    'orange',
    'amber',
    'yellow',
    'dark',
    'neutral',
  ),
  'dark-cyan': createTheme(
    'Dark Cyan',
    'Cian oscuro - Futurista y fresco',
    'cyan',
    'teal',
    'sky',
    'dark',
    'slate',
  ),
};

// ============================================================================
// INFORMACIÓN DE TEMAS PARA UI
// ============================================================================

export interface ThemeInfo {
  name: ThemeName;
  label: string;
  description: string;
  preview: string;
  category: 'warm' | 'green' | 'blue' | 'purple' | 'pink' | 'neutral' | 'dark';
}

export const THEME_INFO: Record<ThemeName, ThemeInfo> = {
  red: {
    name: 'red',
    label: 'Red',
    description: 'Rojo intenso',
    preview: '#ef4444',
    category: 'warm',
  },
  orange: {
    name: 'orange',
    label: 'Orange',
    description: 'Naranja vibrante',
    preview: '#f97316',
    category: 'warm',
  },
  amber: {
    name: 'amber',
    label: 'Amber',
    description: 'Ámbar dorado',
    preview: '#f59e0b',
    category: 'warm',
  },
  yellow: {
    name: 'yellow',
    label: 'Yellow',
    description: 'Amarillo brillante',
    preview: '#eab308',
    category: 'warm',
  },
  lime: {
    name: 'lime',
    label: 'Lime',
    description: 'Lima fresco',
    preview: '#84cc16',
    category: 'green',
  },
  green: {
    name: 'green',
    label: 'Green',
    description: 'Verde clásico',
    preview: '#22c55e',
    category: 'green',
  },
  emerald: {
    name: 'emerald',
    label: 'Emerald',
    description: 'Esmeralda',
    preview: '#10b981',
    category: 'green',
  },
  teal: {
    name: 'teal',
    label: 'Teal',
    description: 'Teal sofisticado',
    preview: '#14b8a6',
    category: 'green',
  },
  cyan: {
    name: 'cyan',
    label: 'Cyan',
    description: 'Cian moderno',
    preview: '#06b6d4',
    category: 'blue',
  },
  sky: {
    name: 'sky',
    label: 'Sky',
    description: 'Cielo abierto',
    preview: '#0ea5e9',
    category: 'blue',
  },
  blue: {
    name: 'blue',
    label: 'Blue',
    description: 'Azul profesional',
    preview: '#3b82f6',
    category: 'blue',
  },
  indigo: {
    name: 'indigo',
    label: 'Indigo',
    description: 'Índigo profundo',
    preview: '#6366f1',
    category: 'blue',
  },
  violet: {
    name: 'violet',
    label: 'Violet',
    description: 'Violeta místico',
    preview: '#8b5cf6',
    category: 'purple',
  },
  purple: {
    name: 'purple',
    label: 'Purple',
    description: 'Púrpura real',
    preview: '#a855f7',
    category: 'purple',
  },
  fuchsia: {
    name: 'fuchsia',
    label: 'Fuchsia',
    description: 'Fucsia vibrante',
    preview: '#d946ef',
    category: 'purple',
  },
  pink: {
    name: 'pink',
    label: 'Pink',
    description: 'Rosa suave',
    preview: '#ec4899',
    category: 'pink',
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    description: 'Rosa intenso',
    preview: '#f43f5e',
    category: 'pink',
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    description: 'Gris azulado',
    preview: '#475569',
    category: 'neutral',
  },
  gray: {
    name: 'gray',
    label: 'Gray',
    description: 'Gris neutro',
    preview: '#6b7280',
    category: 'neutral',
  },
  zinc: {
    name: 'zinc',
    label: 'Zinc',
    description: 'Gris frío',
    preview: '#71717a',
    category: 'neutral',
  },
  neutral: {
    name: 'neutral',
    label: 'Neutral',
    description: 'Neutro puro',
    preview: '#737373',
    category: 'neutral',
  },
  stone: {
    name: 'stone',
    label: 'Stone',
    description: 'Gris cálido',
    preview: '#78716c',
    category: 'neutral',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    description: 'Modo oscuro',
    preview: '#18181b',
    category: 'dark',
  },
  'dark-blue': {
    name: 'dark-blue',
    label: 'Dark Blue',
    description: 'Azul oscuro',
    preview: '#1e3a8a',
    category: 'dark',
  },
  'dark-purple': {
    name: 'dark-purple',
    label: 'Dark Purple',
    description: 'Púrpura oscuro',
    preview: '#4c1d95',
    category: 'dark',
  },
  'dark-emerald': {
    name: 'dark-emerald',
    label: 'Dark Emerald',
    description: 'Esmeralda oscuro',
    preview: '#064e3b',
    category: 'dark',
  },
  'dark-rose': {
    name: 'dark-rose',
    label: 'Dark Rose',
    description: 'Rosa oscuro',
    preview: '#881337',
    category: 'dark',
  },
  'dark-orange': {
    name: 'dark-orange',
    label: 'Dark Orange',
    description: 'Naranja oscuro',
    preview: '#7c2d12',
    category: 'dark',
  },
  'dark-cyan': {
    name: 'dark-cyan',
    label: 'Dark Cyan',
    description: 'Cian oscuro',
    preview: '#164e63',
    category: 'dark',
  },
};

// ============================================================================
// CATEGORÍAS DE TEMAS
// ============================================================================

export interface ThemeCategory {
  label: string;
  themes: ThemeName[];
}

export const THEME_CATEGORIES: Record<string, ThemeCategory> = {
  warm: { label: '🔥 Cálidos', themes: ['red', 'orange', 'amber', 'yellow'] },
  green: { label: '🌿 Verdes', themes: ['lime', 'green', 'emerald', 'teal'] },
  blue: { label: '💧 Azules', themes: ['cyan', 'sky', 'blue', 'indigo'] },
  purple: { label: '💜 Púrpuras', themes: ['violet', 'purple', 'fuchsia'] },
  pink: { label: '🌸 Rosas', themes: ['pink', 'rose'] },
  neutral: { label: '⚪ Neutrales', themes: ['slate', 'gray', 'zinc', 'neutral', 'stone'] },
  dark: {
    label: '🌙 Oscuros',
    themes: [
      'dark',
      'dark-blue',
      'dark-purple',
      'dark-emerald',
      'dark-rose',
      'dark-orange',
      'dark-cyan',
    ],
  },
};

// ============================================================================
// LISTA DE TODOS LOS TEMAS
// ============================================================================

export const ALL_THEMES: ThemeName[] = Object.keys(THEMES) as ThemeName[];
