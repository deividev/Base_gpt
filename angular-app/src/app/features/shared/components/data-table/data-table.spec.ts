import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTable, TableColumn } from './data-table';

describe('DataTable', () => {
  let component: DataTable;
  let fixture: ComponentFixture<DataTable>;

  const mockColumns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'status', header: 'Status', sortable: true }
  ];

  const mockData = [
    { name: 'Item 1', status: 'Active' },
    { name: 'Item 2', status: 'Inactive' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTable]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTable);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Required Inputs', () => {
    it('should accept data input', () => {
      expect(component.data()).toEqual(mockData);
    });

    it('should accept columns input', () => {
      expect(component.columns()).toEqual(mockColumns);
    });
  });

  describe('Optional Inputs', () => {
    it('should have default paginator as true', () => {
      expect(component.paginator()).toBe(true);
    });

    it('should have default rows as 5', () => {
      expect(component.rows()).toBe(5);
    });

    it('should accept paginator input', () => {
      fixture.componentRef.setInput('paginator', false);
      fixture.detectChanges();
      expect(component.paginator()).toBe(false);
    });

    it('should accept rows input', () => {
      fixture.componentRef.setInput('rows', 10);
      fixture.detectChanges();
      expect(component.rows()).toBe(10);
    });
  });

  describe('Data Updates', () => {
    it('should update data when input changes', () => {
      const newData = [{ name: 'New Item', status: 'New' }];
      fixture.componentRef.setInput('data', newData);
      fixture.detectChanges();
      expect(component.data()).toEqual(newData);
    });

    it('should update columns when input changes', () => {
      const newColumns: TableColumn[] = [{ field: 'id', header: 'ID' }];
      fixture.componentRef.setInput('columns', newColumns);
      fixture.detectChanges();
      expect(component.columns()).toEqual(newColumns);
    });
  });
});
