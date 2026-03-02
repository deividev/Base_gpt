import { Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-whatsapp-cta',
  imports: [ButtonModule],
  template: `
    <a [href]="link()" target="_blank" rel="noopener noreferrer" class="whatsapp-link">
      <p-button [label]="label()" icon="pi pi-whatsapp" severity="success" />
    </a>
  `,
  styles: `
    .whatsapp-link {
      display: inline-flex;
      text-decoration: none;
    }
  `,
})
export class WhatsappCtaComponent {
  readonly number = input.required<string>();
  readonly message = input.required<string>();
  readonly label = input('Hablar por WhatsApp');

  readonly link = computed(
    () => `https://wa.me/${this.number()}?text=${encodeURIComponent(this.message())}`,
  );
}
