import { Component, signal, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  // State
  protected readonly currentYear = signal(new Date().getFullYear());

  // Outputs
  readonly sectionClick = output<string>();

  // Methods
  protected navigateToSection(sectionId: string): void {
    this.sectionClick.emit(sectionId);
  }
}
