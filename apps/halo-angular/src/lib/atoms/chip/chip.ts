import { Component, input } from '@angular/core';

export type ChipTone = 'neutral' | 'accent' | 'pos' | 'live' | 'media';

/**
 * Small pill label. `tone`:
 *   - neutral — quiet context value ("Div 41%", "Peak 61%") — the default
 *   - accent  — brand-filled state ("2FGM" active metric)
 *   - pos     — success/positive fill
 *   - live    — the canonical LIVE badge (red fill, white ink; add `dot` for the pulse)
 *   - media   — dark scrim chip that sits OVER imagery/video (duration stamps)
 * `size`: sm (default, inline meta) or md (standalone badges).
 * `dot` renders a leading pulsing dot (respects reduced-motion).
 *
 * New pill-shaped mini-labels should use this atom instead of hand-rolling
 * (.gchip/.mchip/.wpill/.dur…) — fold existing hand-rolls in as touched.
 */
@Component({
  selector: 'halo-chip',
  standalone: true,
  template: `
    <span class="gchip" [class]="tone()" [class.md]="size() === 'md'">
      @if (dot()) { <span class="dot" aria-hidden="true"></span> }
      <ng-content />
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .gchip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-family: var(--body);
      font-weight: 700;
      font-size: var(--fs-caption);
      letter-spacing: .02em;
      border-radius: var(--r-pill);
      padding: var(--space-1) var(--space-2);
      white-space: nowrap;
    }
    .gchip.md { font-size: var(--fs-caption); padding: var(--pad-control-y) var(--space-3); }

    .gchip.neutral { color: var(--ink2); background: var(--card2); }
    .gchip.accent  { color: var(--on-accent); background: var(--accent); }
    .gchip.pos     { color: var(--on-pos); background: var(--pos); }
    .gchip.live {
      color: #fff;
      background: var(--live-strong);
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .gchip.media { color: var(--on-media); background: rgba(0, 0, 0, .55); }

    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
      animation: halo-chip-pulse 2.4s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .dot { animation: none; }
    }
    @keyframes halo-chip-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .35; }
    }
  `],
})
export class Chip {
  tone = input<ChipTone>('neutral');
  size = input<'sm' | 'md'>('sm');
  dot = input(false);
}
