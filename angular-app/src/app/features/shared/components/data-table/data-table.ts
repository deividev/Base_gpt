import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  template?: 'text' | 'badge' | 'progress' | 'custom';
}

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, TableModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  // Inputs
  readonly data = input.required<any[]>();
  readonly columns = input.required<TableColumn[]>();
  readonly paginator = input<boolean>(true);
  readonly rows = input<number>(5);
  readonly currentPageReportTemplate = input<string>(
    'Showing {first} to {last} of {totalRecords} entries',
  );
  readonly tableStyle = input<any>({ 'min-width': '50rem' });
}
