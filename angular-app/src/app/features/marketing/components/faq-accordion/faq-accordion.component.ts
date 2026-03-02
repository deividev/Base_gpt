import { Component, input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { FaqItem } from '../../config/marketing-content';

@Component({
  selector: 'app-faq-accordion',
  imports: [AccordionModule],
  template: `
    <p-accordion [value]="'0'">
      @for (item of items(); track item.question; let index = $index) {
        <p-accordion-panel [value]="index.toString()">
          <p-accordion-header>{{ item.question }}</p-accordion-header>
          <p-accordion-content>{{ item.answer }}</p-accordion-content>
        </p-accordion-panel>
      }
    </p-accordion>
  `,
})
export class FaqAccordionComponent {
  readonly items = input.required<FaqItem[]>();
}
