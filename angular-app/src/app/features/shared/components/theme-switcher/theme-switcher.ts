import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../core/services';
import { THEME_CATEGORIES } from '../../../../../styles/themes.config';
import type { ThemeName } from '../../../../../styles/themes.config';

/**
 * Componente selector de temas
 *
 * Uso:
 * <app-theme-switcher />
 */
@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  template: `
    <div class="theme-switcher">
      <div class="theme-switcher-header">
        <span class="theme-label">🎨 Tema: {{ themeService.currentConfig().name }}</span>
        <button class="dark-toggle" (click)="themeService.toggleDarkMode()">
          {{ themeService.currentConfig().mode === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>

      <div class="theme-categories">
        @for (cat of categories; track cat.key) {
          <div class="theme-category">
            <span class="category-label">{{ cat.label }}</span>
            <div class="theme-buttons">
              @for (theme of cat.themes; track theme) {
                <button
                  class="theme-btn"
                  [class.active]="themeService.currentTheme() === theme"
                  [style.background]="getThemePreview(theme)"
                  [title]="themeService.themeInfo[theme].description"
                  (click)="themeService.setTheme(theme)"
                >
                  @if (themeService.currentTheme() === theme) {
                    <span class="check">✓</span>
                  }
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .theme-switcher {
        padding: 1rem;
        background: var(--surface);
        border-radius: 0.75rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .theme-switcher-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--gray-200);
      }

      .theme-label {
        font-weight: 600;
        color: var(--text-primary);
      }

      .dark-toggle {
        background: var(--surface-alt);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1.25rem;
        transition: all 0.2s ease;

        &:hover {
          background: var(--gray-300);
        }
      }

      .theme-categories {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .theme-category {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .category-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        min-width: 5rem;
      }

      .theme-buttons {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
      }

      .theme-btn {
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          transform: scale(1.15);
          border-color: var(--text-primary);
        }

        &.active {
          border-color: var(--text-primary);
          transform: scale(1.1);
          box-shadow:
            0 0 0 2px var(--surface),
            0 0 0 4px var(--primary);
        }

        .check {
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
      }
    `,
  ],
})
export class ThemeSwitcher {
  protected readonly themeService = inject(ThemeService);

  protected readonly categories = Object.entries(THEME_CATEGORIES).map(([key, value]) => ({
    key,
    ...value,
  }));

  protected getThemePreview(theme: ThemeName): string {
    return this.themeService.themeInfo[theme].preview;
  }
}
