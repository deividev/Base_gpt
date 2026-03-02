import { Component, input } from '@angular/core';

@Component({
  selector: 'app-process-steps',
  template: `
    <ol class="steps">
      @for (step of steps(); track step; let index = $index) {
        <li><strong>{{ index + 1 }}.</strong> {{ step }}</li>
      }
    </ol>
  `,
  styles: `
    .steps { display: grid; gap: var(--space-3); padding-left: 0; list-style: none; }
    .steps li { padding: var(--space-3); border: 1px solid var(--border-color, #e5e7eb); border-radius: var(--radius-lg); }
  `,
})
export class ProcessStepsComponent {
  readonly steps = input.required<string[]>();
}
