import { Component } from '@angular/core';
import { HaloIcon, ALL_ICONS, type IconName } from './icon';

/** The complete icon vocabulary, generated from the `ICONS` record itself —
 *  a new icon cannot ship without appearing here. Storybook-only. */
@Component({
  selector: 'halo-icon-gallery',
  standalone: true,
  imports: [HaloIcon],
  template: `
    <div style="padding:var(--space-6) var(--space-6) 0;color:var(--ink);font-family:var(--body)">
      <b style="font-size:var(--fs-body-lg)">{{ icons.length }} icons</b>
      <p style="margin:var(--space-1) 0 0;font-size:var(--fs-caption);color:var(--ink2);line-height:var(--lh-body)">
        Generated from the <code>ICONS</code> record in <code>icon.ts</code>. Always in sync with the app.
        Stroke 1.9, currentColor, 24px grid. Add icons there; this page updates itself.
      </p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:var(--gap-snug);padding:var(--space-6);color:var(--ink)">
      @for (n of icons; track n) {
        <div style="display:flex;flex-direction:column;align-items:center;gap:var(--gap-tight);padding:var(--space-4) var(--space-2);background:var(--card2);border:1px solid var(--hair);border-radius:14px">
          <halo-icon [name]="n" [size]="24" />
          <code style="font-size:var(--fs-caption);color:var(--ink3)">{{ n }}</code>
        </div>
      }
    </div>
  `,
})
export class IconGallery { icons: IconName[] = ALL_ICONS; }
