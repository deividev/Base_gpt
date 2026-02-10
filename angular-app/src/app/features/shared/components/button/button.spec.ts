import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button, ButtonVariant, ButtonSize } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default variant as primary', () => {
      expect(component.variant()).toBe('primary');
    });

    it('should have default size as medium', () => {
      expect(component.size()).toBe('medium');
    });

    it('should have default disabled as false', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should have default type as button', () => {
      expect(component.type()).toBe('button');
    });

    it('should accept variant input', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();
      expect(component.variant()).toBe('secondary');
    });

    it('should accept size input', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();
      expect(component.size()).toBe('large');
    });
  });

  describe('Outputs', () => {
    it('should emit clicked event when clicked and not disabled', () => {
      const clickSpy = vi.fn();
      component.clicked.subscribe(clickSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should not emit clicked event when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const clickSpy = vi.fn();
      component.clicked.subscribe(clickSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should set aria-disabled when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const host = fixture.nativeElement;
      expect(host.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not have aria-disabled when enabled', () => {
      const host = fixture.nativeElement;
      expect(host.getAttribute('aria-disabled')).toBeNull();
    });
  });
});
