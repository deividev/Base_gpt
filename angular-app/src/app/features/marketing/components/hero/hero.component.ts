import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-hero',
  imports: [ButtonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly primaryLabel = input('Ver servicios');
  readonly primaryRoute = input('/servicios');
  readonly secondaryLabel = input('Solicitar diagnóstico');
  readonly secondaryRoute = input('/contacto');
}
