import { Component, input, output } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-bar-chart',
  imports: [ChartModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss',
})
export class BarChart {
  // Inputs
  readonly data = input.required<any>();
  readonly options = input.required<any>();
  readonly title = input<string>('');
  readonly height = input<string>('400px');
  readonly type = input<
    'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter'
  >('bar');

  // Outputs
  readonly chartClick = output<any>();

  // Methods
  selectDataPoint(event: any): void {
    this.chartClick.emit(event);
  }
}
