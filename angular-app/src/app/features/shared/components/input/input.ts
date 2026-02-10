import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

@Component({
  selector: 'app-input',
  imports: [FormsModule, NgClass],
  templateUrl: './input.html',
  styleUrl: './input.scss'
})
export class Input {
  // Inputs
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly label = input<string>();
  readonly error = input<string>();
  
  // Outputs
  readonly valueChange = output<string>();
  readonly inputBlur = output<void>();
  readonly inputFocus = output<void>();
  
  // Internal state
  protected readonly isFocused = signal(false);

  // Methods
  protected emitValueChange(value: string): void {
    this.valueChange.emit(value);
  }

  protected focus(): void {
    this.isFocused.set(true);
    this.inputFocus.emit();
  }

  protected blur(): void {
    this.isFocused.set(false);
    this.inputBlur.emit();
  }
}
