import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-service-card',
  imports: [CardModule, ButtonModule, RouterLink],
  template: `
    <p-card [header]="title()">
      <p>{{ description() }}</p>
      @if (route()) {
        <a [routerLink]="route()"><p-button label="Ver servicio" /></a>
      } @else {
        <p-button label="Próximamente" severity="secondary" [disabled]="true" />
      }
    </p-card>
  `,
})
export class ServiceCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly route = input<string>();
}
