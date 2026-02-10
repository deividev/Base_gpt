import { Component, signal, output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Button } from '../button/button';
import { ThemeService } from '../../../../core/services';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-navbar',
  imports: [Button, NgClass, ThemeSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  // Services
  private readonly themeService = inject(ThemeService);
  
  // State
  protected readonly isMenuOpen = signal(false);
  protected readonly isThemePanelOpen = signal(false);
  
  // Outputs
  readonly sectionClick = output<string>();
  
  // Methods
  protected toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
    this.isThemePanelOpen.set(false);
  }
  
  protected toggleThemePanel(): void {
    this.isThemePanelOpen.update(value => !value);
    this.isMenuOpen.set(false);
  }
  
  protected navigateToSection(sectionId: string): void {
    this.sectionClick.emit(sectionId);
    this.isMenuOpen.set(false);
    this.isThemePanelOpen.set(false);
  }
}
