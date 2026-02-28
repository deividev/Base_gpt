import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { CalendarioComponent } from './features/calendario/calendario.component';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
    title: 'Home - AgentGames',
  },
  {
    path: 'calendario',
    component: CalendarioComponent,
    title: 'Calendario PrimeNG',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
