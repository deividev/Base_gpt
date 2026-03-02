import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProcessStepsComponent } from '../../components/process-steps/process-steps.component';
import { FaqAccordionComponent } from '../../components/faq-accordion/faq-accordion.component';
import { WhatsappCtaComponent } from '../../components/whatsapp-cta/whatsapp-cta.component';
import { CONTACT_CONFIG, SERVICE_D_FAQ, SERVICES } from '../../config/marketing-content';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, CardModule, ButtonModule, HeroComponent, ProcessStepsComponent, FaqAccordionComponent, WhatsappCtaComponent],
  templateUrl: './home.page.html',
})
export class HomePage {
  readonly services = SERVICES;
  readonly faq = SERVICE_D_FAQ.slice(0, 3);
  readonly process = ['Diagnóstico', 'Implementación', 'Operación', 'Optimización'];
  readonly contactConfig = CONTACT_CONFIG;
}
