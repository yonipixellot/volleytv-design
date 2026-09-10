import { Component, input } from '@angular/core';

/**
 * Loading placeholder block. Size it with `w`/`h` (any CSS length) and shape
 * it with `round` (circle) — defaults to a card-radius bar. Shimmer respects
 * reduced-motion (falls back to a static tint).
 *
 * Compose per surface: a rail card ≈ skeleton media block + two text bars.
 */
@Component({
  selector: 'halo-skeleton',
  standalone: true,
  template: `<span class="sk" [class.round]="round()" [style.width]="w()" [style.height]="h()" aria-hidden="true"></span>`,
  styles: [`
    :host { display: block; }
    .sk {
      display: block;
      border-radius: var(--r-card-sm);
      background:
        linear-gradient(100deg, transparent 32%, color-mix(in srgb, var(--ink) 7%, transparent) 50%, transparent 68%)
        var(--card2);
      background-size: 220% 100%;
      animation: halo-sk-shimmer 1.4s ease-in-out infinite;
    }
    .sk.round { border-radius: 50%; }
    @media (prefers-reduced-motion: reduce) {
      .sk { animation: none; background: var(--card2); }
    }
    @keyframes halo-sk-shimmer {
      from { background-position: 120% 0; }
      to { background-position: -100% 0; }
    }
  `],
})
export class Skeleton {
  w = input('100%');
  h = input('14px');
  round = input(false);
}
