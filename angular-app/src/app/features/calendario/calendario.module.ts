import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { CalendarioComponent } from './calendario.component';

@NgModule({
  imports: [CommonModule, DatePickerModule, CalendarioComponent],
  exports: [CalendarioComponent]
})
export class CalendarioModule {}
