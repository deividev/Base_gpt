import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { WhatsappCtaComponent } from '../../components/whatsapp-cta/whatsapp-cta.component';
import { CONTACT_CONFIG } from '../../config/marketing-content';

@Component({
  selector: 'app-contact-page',
  imports: [ContactFormComponent, WhatsappCtaComponent],
  template: `
    <section class="container section-grid">
      <h1>Contacto</h1>
      @if (selectedPlan) {
        <p>Plan seleccionado: <strong>{{ selectedPlan }}</strong></p>
      }
      <app-contact-form [successText]="contactConfig.responseTimeText" (submitted)="onSubmit($event)" />
      <app-whatsapp-cta [number]="contactConfig.whatsappNumber" [message]="contactConfig.whatsappMessage" />
    </section>
  `,
})
export class ContactPage {
  readonly contactConfig = CONTACT_CONFIG;
  readonly selectedPlan: string | null;

  constructor(private readonly route: ActivatedRoute) {
    this.selectedPlan = this.route.snapshot.queryParamMap.get('plan');
  }

  onSubmit(payload: Record<string, string>): void {
    console.log('Lead recibido', payload);
  }
}
