import { Routes } from '@angular/router';
import { MarketingLayoutComponent } from './features/marketing/layout/marketing-layout.component';
import { HomePage } from './features/marketing/pages/home/home.page';
import { ServicesPage } from './features/marketing/pages/services/services.page';
import { ServiceDetailPage } from './features/marketing/pages/service-detail/service-detail.page';
import { AboutPage } from './features/marketing/pages/about/about.page';
import { ContactPage } from './features/marketing/pages/contact/contact.page';

export const routes: Routes = [
  {
    path: '',
    component: MarketingLayoutComponent,
    children: [
      { path: '', component: HomePage, title: 'Nous Labs | Inicio' },
      { path: 'servicios', component: ServicesPage, title: 'Nous Labs | Servicios' },
      {
        path: 'servicios/asistente-ia-operativo',
        component: ServiceDetailPage,
        title: 'Nous Labs | Asistente IA Operativo',
      },
      { path: 'nosotros', component: AboutPage, title: 'Nous Labs | Nosotros' },
      { path: 'contacto', component: ContactPage, title: 'Nous Labs | Contacto' },
    ],
  },
  { path: '**', redirectTo: '' },
];
