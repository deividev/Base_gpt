import { Component, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PricingTier } from '../../config/marketing-content';

@Component({
  selector: 'app-pricing-tier-card',
  imports: [CardModule, ButtonModule],
  template: `
    <p-card [header]="tier().name" [subheader]="tier().description">
      <p class="price">{{ tier().price }}</p>
      <ul>
        @for (feature of tier().features; track feature) {
          <li>{{ feature }}</li>
        }
      </ul>
      <p-button [label]="tier().ctaLabel" (click)="selected.emit(tier().name)" />
    </p-card>
  `,
  styles: `.price { font-size: var(--text-2xl); font-weight: var(--font-bold); }`,
})
export class PricingTierCardComponent {
  readonly tier = input.required<PricingTier>();
  readonly selected = output<string>();
}
