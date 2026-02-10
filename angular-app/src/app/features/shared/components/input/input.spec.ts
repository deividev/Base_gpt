import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Input, InputType } from './input';

describe('Input', () => {
  let component: Input;
  let fixture: ComponentFixture<Input>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input]
    }).compileComponents();

    fixture = TestBed.createComponent(Input);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default type as text', () => {
      expect(component.type()).toBe('text');
    });

    it('should have default placeholder as empty string', () => {
      expect(component.placeholder()).toBe('');
    });

    it('should have default value as empty string', () => {
      expect(component.value()).toBe('');
    });

    it('should have default disabled as false', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should have default required as false', () => {
      expect(component.required()).toBe(false);
    });

    it('should accept type input', () => {
      fixture.componentRef.setInput('type', 'email');
      fixture.detectChanges();
      expect(component.type()).toBe('email');
    });

    it('should accept placeholder input', () => {
      fixture.componentRef.setInput('placeholder', 'Enter text');
      fixture.detectChanges();
      expect(component.placeholder()).toBe('Enter text');
    });
  });

  describe('Outputs', () => {
    it('should emit valueChange on input', () => {
      const valueChangeSpy = vi.fn();
      component.valueChange.subscribe(valueChangeSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(valueChangeSpy).toHaveBeenCalledWith('test');
    });

    it('should emit inputFocus on focus', () => {
      const focusSpy = vi.fn();
      component.inputFocus.subscribe(focusSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should emit inputBlur on blur', () => {
      const blurSpy = vi.fn();
      component.inputBlur.subscribe(blurSpy);

      const input = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(blurSpy).toHaveBeenCalled();
    });
  });
});
