import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServiceCardComponent } from '../../components/service-card/service-card.component';
import { SERVICES } from '../../config/marketing-content';

@Component({
  selector: 'app-services-page',
  imports: [HeroComponent, ServiceCardComponent],
  template: `
    <app-hero
      title="Servicios Nous Labs"
      subtitle="Soluciones escalables de software e IA para operación y crecimiento"
      primaryLabel="Solicitar diagnóstico"
      primaryRoute="/contacto"
      secondaryLabel="Ver Servicio D"
      secondaryRoute="/servicios/asistente-ia-operativo"
    />
    <section class="container cards-grid">
      @for (service of services; track service.title) {
        <app-service-card [title]="service.title" [description]="service.description" [route]="service.route" />
      }
    </section>
  `,
})
export class ServicesPage {
  readonly services = SERVICES;
}
