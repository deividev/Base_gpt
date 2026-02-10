import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureCard } from './feature-card';

describe('FeatureCard', () => {
  let component: FeatureCard;
  let fixture: ComponentFixture<FeatureCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureCard);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('icon', '🚀');
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('description', 'Test Description');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Required Inputs', () => {
    it('should display icon', () => {
      expect(component.icon()).toBe('🚀');
    });

    it('should display title', () => {
      expect(component.title()).toBe('Test Title');
    });

    it('should display description', () => {
      expect(component.description()).toBe('Test Description');
    });
  });

  describe('Input Changes', () => {
    it('should update icon when input changes', () => {
      fixture.componentRef.setInput('icon', '⭐');
      fixture.detectChanges();
      expect(component.icon()).toBe('⭐');
    });

    it('should update title when input changes', () => {
      fixture.componentRef.setInput('title', 'New Title');
      fixture.detectChanges();
      expect(component.title()).toBe('New Title');
    });

    it('should update description when input changes', () => {
      fixture.componentRef.setInput('description', 'New Description');
      fixture.detectChanges();
      expect(component.description()).toBe('New Description');
    });
  });

  describe('Rendering', () => {
    it('should render icon in template', () => {
      const element = fixture.nativeElement;
      expect(element.textContent).toContain('🚀');
    });

    it('should render title in template', () => {
      const element = fixture.nativeElement;
      expect(element.textContent).toContain('Test Title');
    });

    it('should render description in template', () => {
      const element = fixture.nativeElement;
      expect(element.textContent).toContain('Test Description');
    });
  });
});
