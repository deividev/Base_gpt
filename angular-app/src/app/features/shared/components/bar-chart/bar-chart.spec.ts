import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChart } from './bar-chart';

describe('BarChart', () => {
  let component: BarChart;
  let fixture: ComponentFixture<BarChart>;

  const mockData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Sales',
        data: [10, 20, 30]
      }
    ]
  };

  const mockOptions = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChart]
    }).compileComponents();

    fixture = TestBed.createComponent(BarChart);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Required Inputs', () => {
    it('should accept data input', () => {
      expect(component.data()).toEqual(mockData);
    });

    it('should accept options input', () => {
      expect(component.options()).toEqual(mockOptions);
    });
  });

  describe('Optional Inputs', () => {
    it('should have default title as empty string', () => {
      expect(component.title()).toBe('');
    });

    it('should have default height as 400px', () => {
      expect(component.height()).toBe('400px');
    });

    it('should have default type as bar', () => {
      expect(component.type()).toBe('bar');
    });

    it('should accept title input', () => {
      fixture.componentRef.setInput('title', 'Sales Chart');
      fixture.detectChanges();
      expect(component.title()).toBe('Sales Chart');
    });

    it('should accept height input', () => {
      fixture.componentRef.setInput('height', '500px');
      fixture.detectChanges();
      expect(component.height()).toBe('500px');
    });

    it('should accept type input', () => {
      fixture.componentRef.setInput('type', 'line');
      fixture.detectChanges();
      expect(component.type()).toBe('line');
    });
  });

  describe('Outputs', () => {
    it('should emit chartClick when selectDataPoint is called', () => {
      const chartClickSpy = vi.fn();
      component.chartClick.subscribe(chartClickSpy);

      const mockEvent = { datasetIndex: 0, index: 1 };
      component.selectDataPoint(mockEvent);

      expect(chartClickSpy).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Data Updates', () => {
    it('should update data when input changes', () => {
      const newData = {
        labels: ['A', 'B'],
        datasets: [{ label: 'New', data: [1, 2] }]
      };
      fixture.componentRef.setInput('data', newData);
      fixture.detectChanges();
      expect(component.data()).toEqual(newData);
    });
  });
});
