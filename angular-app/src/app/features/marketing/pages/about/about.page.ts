import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';

@Component({
  selector: 'app-about-page',
  imports: [HeroComponent],
  template: `
    <app-hero
      title="Nous Labs: enfoque práctico, orientado a resultados"
      subtitle="Combinamos claridad, ejecución y escalabilidad para transformar operaciones reales."
      primaryLabel="Hablar con Nous Labs"
      primaryRoute="/contacto"
    />
    <section class="container section-grid">
      <h2>Cómo trabajamos</h2>
      <p>Diagnóstico claro, implementación con hitos y operación medible desde la primera semana.</p>
      <h2>Qué clientes ayudamos</h2>
      <p>Pymes, agencias y equipos que necesitan orden operativo y automatización útil.</p>
    </section>
  `,
})
export class AboutPage {}
