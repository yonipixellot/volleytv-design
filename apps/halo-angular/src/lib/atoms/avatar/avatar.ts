import { Component, computed, input } from '@angular/core';

/**
 * Person avatar — circular photo with a monogram fallback.
 * Distinct from `halo-crest` (club logo on a rounded plate) and
 * `halo-player-disc` (jersey number): this is for PEOPLE (profile, menu
 * identity, settings account, follow rows without photos).
 *
 * `color` optionally tints the monogram tile (e.g. a team color); the ink is
 * computed per-color against WCAG 4.5:1 so arbitrary tints stay readable.
 * Replaces the hand-rolled avatars in settings-panel and settings/account —
 * fold those in as touched.
 */
@Component({
  selector: 'halo-avatar',
  standalone: true,
  template: `
    <span class="av" [style.width.px]="size()" [style.height.px]="size()">
      @if (src() && !imgFailed) {
        <img [src]="src()" [alt]="alt()" (error)="imgFailed = true" />
      } @else {
        <span
          class="mono"
          [style.background]="color() || 'var(--brand-ring)'"
          [style.color]="ink()"
          [style.fontSize.px]="size() * 0.38"
        >{{ monogram() }}</span>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .av {
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      display: grid;
      place-items: center;
      background: var(--card2);
      box-shadow: inset 0 0 0 1px var(--hair);
    }
    .av img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .mono {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      font-family: var(--disp);
      font-weight: 800;
      letter-spacing: .02em;
      line-height: 1;
    }
  `],
})
export class Avatar {
  imgFailed = false;
  src = input<string>('');
  monogram = input('YL');
  alt = input('');
  size = input(46);
  /** Optional tile tint (hex) — ink auto-derives to stay AA on it. */
  color = input<string>('');

  protected ink = computed(() => {
    const c = this.color();
    if (!c) return 'var(--on-primary)'; // default tile is --brand-ring (= --primary)
    const m = /^#?([0-9a-f]{6})$/i.exec(c.trim());
    if (!m) return 'var(--on-media)';
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
    const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const L = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    return (1.05 / (L + 0.05)) >= 4.5 ? '#fff' : '#08120c';
  });
}
