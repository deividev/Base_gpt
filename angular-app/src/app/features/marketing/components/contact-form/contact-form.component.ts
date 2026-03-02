import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-contact-form',
  providers: [MessageService],
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, TextareaModule, ButtonModule, ToastModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly successText = input.required<string>();
  readonly submitted = output<Record<string, string>>();
  readonly loading = signal(false);

  readonly businessTypes = [
    { label: 'Servicios profesionales', value: 'servicios' },
    { label: 'Ecommerce', value: 'ecommerce' },
    { label: 'Agencia', value: 'agencia' },
    { label: 'Otro', value: 'otro' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    businessType: ['', Validators.required],
    objective: ['', Validators.required],
    message: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Revisa el formulario' });
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.submitted.emit(this.form.getRawValue());
      this.messageService.add({ severity: 'success', summary: 'Enviado', detail: this.successText() });
      this.form.reset();
    }, 300);
  }
}
