import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFormComponent],
    }).compileComponents();
  });

  it('should mark form as invalid when required fields are missing', () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.componentRef.setInput('successText', 'ok');
    fixture.detectChanges();

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('should emit submitted payload on valid submit', async () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    fixture.componentRef.setInput('successText', 'ok');
    const emitSpy = vi.spyOn(fixture.componentInstance.submitted, 'emit');

    fixture.componentInstance.form.setValue({
      name: 'David',
      email: 'david@test.com',
      businessType: 'servicios',
      objective: 'Orden operativo',
      message: '',
    });

    fixture.componentInstance.submit();
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(emitSpy).toHaveBeenCalled();
  });
});
