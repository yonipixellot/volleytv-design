import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * Client brand logo — fully replaceable per client (set from the admin app).
 * Renders, in priority order:
 *   1. `svg`  — a raw inline SVG string. If it uses `.ic` / `.tx` classes they
 *              recolour with the theme (emblem → --accent, wordmark → --ink).
 *   2. `src`  — an uploaded image (PNG/SVG URL), shown as-is.
 *   3. `name` — a plain Antonio wordmark fallback.
 */
@Component({
  selector: 'halo-client-logo',
  standalone: true,
  imports: [TPipe],
  template: `
    @if (svg()) {
      <span class="logo svg" [style.height.px]="height()" [innerHTML]="safeSvg()"></span>
    } @else if (src()) {
      <img class="logo img" [src]="src()" [alt]="name() || ('common.logo' | t)" [style.height.px]="height()" />
    } @else {
      <span class="logo word" [style.fontSize.px]="height() * 0.62">{{ name() }}</span>
    }
  `,
  styleUrl: './client-logo.scss',
})
export class ClientLogo {
  /** Raw inline SVG markup (themeable via .ic/.tx). */
  svg = input<string>('');
  /** Uploaded image URL. */
  src = input<string>('');
  /** Wordmark fallback text. */
  name = input<string>('Halo');
  height = input(40);

  private san = inject(DomSanitizer);
  safeSvg = computed<SafeHtml>(() => this.san.bypassSecurityTrustHtml(this.svg()));
}
