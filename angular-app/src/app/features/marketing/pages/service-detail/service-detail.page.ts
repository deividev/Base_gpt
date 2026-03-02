import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { PricingTierCardComponent } from '../../components/pricing-tier-card/pricing-tier-card.component';
import { ProcessStepsComponent } from '../../components/process-steps/process-steps.component';
import { FaqAccordionComponent } from '../../components/faq-accordion/faq-accordion.component';
import { WhatsappCtaComponent } from '../../components/whatsapp-cta/whatsapp-cta.component';
import { CONTACT_CONFIG, PRICING_TIERS, SERVICE_D_FAQ } from '../../config/marketing-content';

@Component({
  selector: 'app-service-detail-page',
  imports: [HeroComponent, PricingTierCardComponent, ProcessStepsComponent, FaqAccordionComponent, WhatsappCtaComponent],
  templateUrl: './service-detail.page.html',
})
export class ServiceDetailPage {
  readonly tiers = PRICING_TIERS;
  readonly faq = SERVICE_D_FAQ;
  readonly onboarding = ['Setup de cuentas', 'Implementación', 'Validación', 'Handover'];
  readonly contactConfig = CONTACT_CONFIG;

  constructor(private readonly router: Router) {}

  goToContact(selectedTier: string): void {
    this.router.navigate(['/contacto'], { queryParams: { plan: selectedTier } });
  }
}
