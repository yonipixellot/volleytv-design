import { Component, input, linkedSignal } from '@angular/core';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * AdSlot — a labelled advertising placement, consistent across every screen.
 * It's a *slot*: today it renders a supplied demo creative, but the frame is
 * sized to the standard mobile ad formats so a real Google AdSense / GAM unit
 * (or house creative) can drop in later with no layout shift.
 *
 * - `format`: 'banner' (full-width ~320×100 large mobile banner) or
 *   'mrec' (300×250 medium rectangle).
 * - Always carries an "Ad" label (disclosure) and an accessible `aria-label`.
 * - Empty state (no creative) shows a neutral tokenized placeholder so the slot
 *   still reserves its space — no CLS when the ad fills in. A creative that
 *   FAILS to load falls back to that same placeholder: a slot is the one place
 *   a broken-image glyph is guaranteed to appear (third-party creative, ad
 *   blocker, cold cache on a heavy file), and the browser's default is a broken
 *   icon plus the alt text rendered as underlined link text.
 *
 * Tier suppression (e.g. Premium = ad-free) is decided by the caller: simply
 * don't render the slot. Kept out of the component so it stays presentational.
 */
@Component({
  selector: 'halo-ad-slot',
  standalone: true,
  imports: [TPipe],
  template: `
    <aside class="ad" [class.mrec]="format() === 'mrec'" [attr.aria-label]="'ad.a11y' | t">
      <span class="lbl">Ad</span>
      @if (creative() && !failed()) {
        <a
          class="cr"
          [attr.href]="href() || null"
          [attr.target]="href() ? '_blank' : null"
          [attr.rel]="href() ? 'noopener sponsored' : null"
          [attr.aria-label]="sponsor() ? 'Advertisement, ' + sponsor() : 'Advertisement'"
        >
          <img
            [src]="creative()"
            [alt]="sponsor() ? ('ad.sponsorA11y' | t: { sponsor: sponsor() }) : ('ad.a11y' | t)"
            decoding="async"
            (error)="failed.set(true)"
          />
        </a>
      } @else {
        <span class="ph" aria-hidden="true">{{ 'games.sponsored' | t }}</span>
      }
    </aside>
  `,
  styleUrl: './ad-slot.scss',
})
export class AdSlot {
  format = input<'banner' | 'mrec'>('banner');
  creative = input('');
  href = input('');
  sponsor = input('');

  /** Reset per creative: a new src deserves its own attempt. */
  protected failed = linkedSignal<string, boolean>({
    source: this.creative,
    computation: () => false,
  });
}
