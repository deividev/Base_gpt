import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat',
  imports: [],
  templateUrl: './stat.html',
  styleUrl: './stat.scss',
})
export class Stat {
  // Inputs
  readonly value = input.required<string>();
  readonly label = input.required<string>();
}
