import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { CalendarioComponent } from './calendario.component';

@NgModule({
  declarations: [CalendarioComponent],
  imports: [
    CommonModule,
    CalendarModule
  ],
  exports: [CalendarioComponent]
})
export class CalendarioModule {}
