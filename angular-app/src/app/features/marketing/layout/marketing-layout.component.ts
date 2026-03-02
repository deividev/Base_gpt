import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from '../components/site-header/site-header.component';
import { SiteFooterComponent } from '../components/site-footer/site-footer.component';

@Component({
  selector: 'app-marketing-layout',
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main><router-outlet /></main>
    <app-site-footer />
  `,
})
export class MarketingLayoutComponent {}
