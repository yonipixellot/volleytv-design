import { Component, afterNextRender, input, model, signal } from '@angular/core';

/** Switch toggle — a pill track with a sliding knob. Two-way bound via `on`. */
@Component({
  selector: 'halo-toggle',
  standalone: true,
  template: `
    <button
      class="tog"
      [class.settled]="settled()"
      type="button"
      role="switch"
      [class.on]="on()"
      [attr.aria-checked]="on()"
      [attr.aria-label]="ariaLabel() || null"
      [disabled]="disabled()"
      (click)="on.set(!on())"
    >
      <span class="knob"></span>
    </button>
  `,
  styleUrl: './toggle.scss',
})
export class HaloToggle {
  on = model(false);
  disabled = input(false);
  ariaLabel = input('');

  /** Suppresses the slide/color transition on the toggle's first paint —
   *  without this, a toggle that mounts already "on" (e.g. loading a
   *  settings page) visibly animates in as if the user had just flipped it. */
  protected settled = signal(false);
  constructor() {
    afterNextRender(() => this.settled.set(true));
  }
}
