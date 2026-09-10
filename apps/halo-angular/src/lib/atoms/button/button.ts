import { Component, input, output } from '@angular/core';
import { Spinner } from '../spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'ghost' | 'premium' | 'link';

/**
 * THE action button (ds-button-system 2026-08-23: every filled/outlined/text
 * action renders through this atom — no bespoke button CSS on pages). `variant`:
 *   - primary   — accent fill (the main CTA)
 *   - premium   — fixed platform-gold gradient (skin-independent)
 *   - secondary — solid brand fill (a strong action that isn't the hero CTA)
 *   - glass     — quiet card surface + hairline (secondary / social)
 *   - ghost     — transparent, text only (on-media / toolbar)
 *   - link      — inline text link-button; accent + underline on hover/focus
 *                 (matches team-name links). Absorbs the page-local .link/
 *                 .linkbtn/.later/.cf-clear flavours.
 * `size`: sm 32 (dense, SECONDARY/redundant actions only — sub-WCAG target) ·
 *         md 44 (default) · lg 52 (hero CTAs).
 * `block` makes it full-width. `loading` keeps the variant look, swaps in a
 * spinner and disables. Disabled is a NEUTRAL recipe (card2 surface + muted
 * ink) — never a dimmed accent/gold.
 * Icon convention: project a `<halo-icon size="18">` BEFORE the label text via
 * ng-content — the flex gap handles spacing; no wrapper needed.
 */
@Component({
  selector: 'halo-button',
  standalone: true,
  imports: [Spinner],
  template: `
    <button
      class="btn"
      [class]="variant()"
      [class.block]="block()"
      [class.sm]="size() === 'sm'"
      [class.lg]="size() === 'lg'"
      [class.loading]="loading()"
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      (click)="press.emit()"
    >
      @if (loading()) { <halo-spinner [size]="size() === 'sm' ? 12 : 15" aria-hidden="true" /> }
      <ng-content />
    </button>
  `,
  styleUrl: './button.scss',
})
export class HaloButton {
  variant = input<ButtonVariant>('primary');
  size = input<'md' | 'sm' | 'lg'>('md');
  block = input(false);
  disabled = input(false);
  loading = input(false);
  type = input<'button' | 'submit'>('button');
  press = output<void>();
}
