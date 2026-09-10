import { Component, input } from '@angular/core';

/**
 * Ring spinner — inherits `currentColor`, so it tints with the surrounding
 * text automatically (same visual as the button's loading ring; the button
 * embeds this atom). Spin is essential feedback, so it is NOT disabled under
 * reduced-motion — it slows instead.
 */
@Component({
  selector: 'halo-spinner',
  standalone: true,
  template: `<span class="spin" role="status" [attr.aria-label]="ariaLabel()"
                   [style.width.px]="size()" [style.height.px]="size()"></span>`,
  styles: [`
    :host { display: inline-flex; }
    .spin {
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, currentColor 35%, transparent);
      border-top-color: currentColor;
      animation: halo-spin .7s linear infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .spin { animation-duration: 1.6s; }
    }
    @keyframes halo-spin { to { transform: rotate(360deg); } }
  `],
})
export class Spinner {
  size = input(15);
  ariaLabel = input('Loading');
}
