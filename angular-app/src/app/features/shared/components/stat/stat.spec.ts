import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stat } from './stat';

describe('Stat', () => {
  let component: Stat;
  let fixture: ComponentFixture<Stat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stat]
    }).compileComponents();

    fixture = TestBed.createComponent(Stat);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Required Inputs', () => {
    it('should display value', () => {
      expect(component.value()).toBe('100');
    });

    it('should display label', () => {
      expect(component.label()).toBe('Test Label');
    });

    it('should update value when input changes', () => {
      fixture.componentRef.setInput('value', '200');
      fixture.detectChanges();
      expect(component.value()).toBe('200');
    });

    it('should update label when input changes', () => {
      fixture.componentRef.setInput('label', 'New Label');
      fixture.detectChanges();
      expect(component.label()).toBe('New Label');
    });
  });

  describe('Rendering', () => {
    it('should render value in template', () => {
      const element = fixture.nativeElement;
      expect(element.textContent).toContain('100');
    });

    it('should render label in template', () => {
      const element = fixture.nativeElement;
      expect(element.textContent).toContain('Test Label');
    });
  });
});
