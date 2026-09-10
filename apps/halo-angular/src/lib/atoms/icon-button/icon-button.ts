import { Component, computed, input } from '@angular/core';
import { HaloIcon, IconName } from '../icon/icon';

/**
 * Circular icon button — the single source of truth for every round icon-only
 * control (menu ☰, notification bell, close ✕, share …). One surface style
 * (card2 + hairline + ink glyph) so every circle button reads the same, on app
 * chrome or over media. One axis:
 *
 *  • size — 'sm' (34px) · 'md' (38px, the app-bar default) · 'lg' (44px, to
 *    sit level with a primary CTA / field-height control beside it)
 *
 * Icon-only, so `ariaLabel` is required. Optional `dot` shows the unread pip
 * (bell). The inner native <button> lets a consumer's `(click)` bind on the
 * host via normal DOM bubbling — no extra output needed.
 */
@Component({
  selector: 'halo-icon-button',
  standalone: true,
  imports: [HaloIcon],
  template: `
    <button
      class="ib"
      type="button"
      [class.sm]="size() === 'sm'"
      [class.lg]="size() === 'lg'"
      [class.has-dot]="dot() && count() === 0"
      [class.active]="active()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-haspopup]="haspopup() || null"
      [attr.aria-expanded]="active() || null"
    >
      <halo-icon [name]="icon()" [size]="iconSize()" />
      @if (count() > 0) { <span class="cnt" aria-hidden="true">{{ count() > 9 ? '9+' : count() }}</span> }
    </button>
  `,
  styleUrl: './icon-button.scss',
})
export class IconButton {
  icon = input.required<IconName>();
  ariaLabel = input.required<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
  dot = input(false);
  /** Numeric unread badge — when > 0 it replaces the dot (CM-1417 bell). */
  count = input(0);
  disabled = input(false);
  /** Tints the button while whatever it opens (a dropdown/sheet) is showing.
   *  Also drives aria-expanded, so a control that opens something only has to
   *  say so once. */
  active = input(false);
  /** What this button opens, when it opens something: 'menu' | 'dialog' | …
   *  Paired with `active`, that is the whole disclosure contract. */
  haspopup = input<'menu' | 'dialog' | 'listbox' | ''>('');
  /** Override the glyph size; defaults track the button size (sm→16, md→18, lg→19). */
  glyph = input<number | null>(null);

  protected iconSize = computed(() => {
    if (this.glyph() !== null) return this.glyph()!;
    return this.size() === 'sm' ? 16 : this.size() === 'lg' ? 19 : 18;
  });
}
