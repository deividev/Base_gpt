import { Injectable, signal, computed } from '@angular/core';
import { THEMES, ALL_THEMES, THEME_INFO, THEME_CATEGORIES } from '../../../styles/themes.config';
import type { ThemeName, ThemeConfig } from '../../../styles/themes.config';
import { DEFAULT_THEME, isValidTheme } from '../../../styles/design-config';

const STORAGE_KEY = 'app-theme';

/**
 * ============================================================================
 * THEME SERVICE - Servicio para gestionar temas en runtime
 * ============================================================================
 *
 * 🎨 USO:
 *
 * // Inyectar el servicio
 * private readonly themeService = inject(ThemeService);
 *
 * // Cambiar tema
 * this.themeService.setTheme('emerald');
 *
 * // Obtener tema actual
 * const current = this.themeService.currentTheme();
 *
 * // Listar todos los temas
 * const themes = this.themeService.availableThemes;
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // Estado reactivo del tema actual
  private readonly _currentTheme = signal<ThemeName>(this.getInitialTheme());

  // Señales públicas de solo lectura
  readonly currentTheme = this._currentTheme.asReadonly();
  readonly currentConfig = computed(() => THEMES[this._currentTheme()]);

  // Información estática de temas
  readonly availableThemes = ALL_THEMES;
  readonly themeInfo = THEME_INFO;
  readonly themeCategories = THEME_CATEGORIES;

  constructor() {
    // Aplicar tema inicial al cargar
    this.applyTheme(this._currentTheme());
  }

  /**
   * Cambia el tema activo
   */
  setTheme(themeName: ThemeName): void {
    if (!isValidTheme(themeName)) {
      console.warn(`Tema "${themeName}" no válido. Usando "${DEFAULT_THEME}"`);
      themeName = DEFAULT_THEME;
    }

    this._currentTheme.set(themeName);
    this.applyTheme(themeName);
    this.saveThemePreference(themeName);

    console.log(`🎨 Tema cambiado a: ${THEMES[themeName].name}`);
  }

  /**
   * Alterna entre modo claro y oscuro
   */
  toggleDarkMode(): void {
    const current = this._currentTheme();
    const newTheme: ThemeName = current === 'dark' ? DEFAULT_THEME : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Reinicia al tema por defecto
   */
  resetToDefault(): void {
    this.setTheme(DEFAULT_THEME);
  }

  /**
   * Obtiene el tema inicial (de localStorage o default)
   */
  private getInitialTheme(): ThemeName {
    if (typeof window === 'undefined') return DEFAULT_THEME;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidTheme(saved)) {
      return saved as ThemeName;
    }
    return DEFAULT_THEME;
  }

  /**
   * Guarda la preferencia del usuario en localStorage
   */
  private saveThemePreference(themeName: ThemeName): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, themeName);
    }
  }

  /**
   * Aplica las variables CSS del tema al documento
   */
  private applyTheme(themeName: ThemeName): void {
    const config = THEMES[themeName];
    const root = document.documentElement;

    // === COLORES PRINCIPALES ===
    root.style.setProperty('--primary', config.colors.primary);
    root.style.setProperty('--primary-light', config.colors.primaryLight);
    root.style.setProperty('--primary-dark', config.colors.primaryDark);

    root.style.setProperty('--secondary', config.colors.secondary);
    root.style.setProperty('--secondary-light', config.colors.secondaryLight);
    root.style.setProperty('--secondary-dark', config.colors.secondaryDark);

    root.style.setProperty('--accent', config.colors.accent);
    root.style.setProperty('--accent-light', config.colors.accentLight);
    root.style.setProperty('--accent-dark', config.colors.accentDark);

    // === SUPERFICIES ===
    root.style.setProperty('--background', config.surfaces.background);
    root.style.setProperty('--surface', config.surfaces.surface);
    root.style.setProperty('--surface-alt', config.surfaces.surfaceAlt);
    root.style.setProperty('--text-primary', config.surfaces.textPrimary);
    root.style.setProperty('--text-secondary', config.surfaces.textSecondary);
    root.style.setProperty('--text-tertiary', config.surfaces.textTertiary);

    // === NEUTRALES ===
    root.style.setProperty('--gray-50', config.neutrals.gray50);
    root.style.setProperty('--gray-100', config.neutrals.gray100);
    root.style.setProperty('--gray-200', config.neutrals.gray200);
    root.style.setProperty('--gray-300', config.neutrals.gray300);
    root.style.setProperty('--gray-400', config.neutrals.gray400);
    root.style.setProperty('--gray-500', config.neutrals.gray500);
    root.style.setProperty('--gray-600', config.neutrals.gray600);
    root.style.setProperty('--gray-700', config.neutrals.gray700);
    root.style.setProperty('--gray-800', config.neutrals.gray800);
    root.style.setProperty('--gray-900', config.neutrals.gray900);

    // Alias de grises
    root.style.setProperty('--dark', config.neutrals.gray800);
    root.style.setProperty('--gray', config.neutrals.gray500);
    root.style.setProperty('--light', config.neutrals.gray100);

    // === SEMÁNTICOS ===
    root.style.setProperty('--success', config.semantic.success);
    root.style.setProperty('--success-light', config.semantic.successLight);
    root.style.setProperty('--success-dark', config.semantic.successDark);

    root.style.setProperty('--warning', config.semantic.warning);
    root.style.setProperty('--warning-light', config.semantic.warningLight);
    root.style.setProperty('--warning-dark', config.semantic.warningDark);

    root.style.setProperty('--error', config.semantic.error);
    root.style.setProperty('--error-light', config.semantic.errorLight);
    root.style.setProperty('--error-dark', config.semantic.errorDark);

    root.style.setProperty('--info', config.semantic.info);
    root.style.setProperty('--info-light', config.semantic.infoLight);
    root.style.setProperty('--info-dark', config.semantic.infoDark);

    // === TIPOGRAFÍA ===
    root.style.setProperty('--font-primary', config.typography.fontFamily);
    root.style.setProperty('--text-base', config.typography.baseSize);

    // === ESPACIADO Y BORDES ===
    root.style.setProperty('--space-base', `${config.spacing.base}px`);
    root.style.setProperty('--radius-base', config.borderRadius.base);
    root.style.setProperty('--radius', config.borderRadius.base);

    // === GRADIENTES ===
    root.style.setProperty(
      '--gradient',
      `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%)`,
    );
    root.style.setProperty(
      '--gradient-primary',
      `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%)`,
    );
    root.style.setProperty(
      '--gradient-secondary',
      `linear-gradient(135deg, ${config.colors.secondary} 0%, ${config.colors.accent} 100%)`,
    );
    root.style.setProperty(
      '--gradient-text',
      `linear-gradient(to right, ${config.colors.secondary}, ${config.colors.accent})`,
    );

    // === ATRIBUTO DATA PARA CSS QUERIES ===
    root.setAttribute('data-theme', themeName);
    root.setAttribute('data-theme-mode', config.mode);
  }
}
