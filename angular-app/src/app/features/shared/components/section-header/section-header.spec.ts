import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionHeader } from './section-header';

describe('SectionHeader', () => {
  let component: SectionHeader;
  let fixture: ComponentFixture<SectionHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeader);
    component = fixture.componentInstance;

    // Set required input
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Required Inputs', () => {
    it('should display title', () => {
      expect(component.title()).toBe('Test Title');
    });
  });

  describe('Optional Inputs', () => {
    it('should have undefined subtitle by default', () => {
      expect(component.subtitle()).toBeUndefined();
    });

    it('should have default align as center', () => {
      expect(component.align()).toBe('center');
    });

    it('should accept subtitle input', () => {
      fixture.componentRef.setInput('subtitle', 'Test Subtitle');
      fixture.detectChanges();
      expect(component.subtitle()).toBe('Test Subtitle');
    });

    it('should accept align input', () => {
      fixture.componentRef.setInput('align', 'left');
      fixture.detectChanges();
      expect(component.align()).toBe('left');
    });
  });

  describe('Rendering', () => {
    it('should render title in template', () => {
      const element = fixture.nativeElement;
      expect(element.textContent).toContain('Test Title');
    });

    it('should render subtitle when provided', () => {
      fixture.componentRef.setInput('subtitle', 'Test Subtitle');
      fixture.detectChanges();
      const element = fixture.nativeElement;
      expect(element.textContent).toContain('Test Subtitle');
    });
  });
});
