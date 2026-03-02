import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container footer-inner">
        <span>© {{ year }} Nous Labs</span>
        <div class="links">
          <a routerLink="/servicios">Servicios</a>
          <a routerLink="/contacto">Contacto</a>
          <a href="#" aria-label="Política de privacidad">Política</a>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .site-footer { border-top: 1px solid var(--border-color, #e5e7eb); margin-top: var(--space-16); }
    .footer-inner { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); color: var(--text-secondary, #4b5563); }
    .links { display: flex; gap: var(--space-4); }
    .links a { color: inherit; text-decoration: none; }
  `,
})
export class SiteFooterComponent {
  readonly year = new Date().getFullYear();
}
