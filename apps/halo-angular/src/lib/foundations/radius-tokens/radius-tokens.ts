import { Component } from '@angular/core';

interface Row { name: string; var: string; }

/** Foundations · Radius — the corner scale every surface rounds to. */
@Component({
  selector: 'halo-radius-tokens',
  standalone: true,
  template: `
    <div class="st-wrap">
      <section class="st-group">
        <h3 class="st-h">Radii</h3>
        <p class="st-note">Corner radii for fields, cards, pills and the phone frame. Reference these. Never hardcode a corner.</p>
        @for (r of rows; track r.var) {
          <div class="st-row">
            <div class="st-label"><b>{{ r.name }}</b><code>{{ r.var }}</code></div>
            <div class="st-radius" [style.borderRadius]="'var(' + r.var + ')'"></div>
            <span class="st-val">{{ resolve(r.var) }}</span>
          </div>
        }
      </section>
    </div>
  `,
  styleUrl: '../space-tokens/space-tokens.scss',
})
export class RadiusTokens {
  rows: Row[] = [
    { name: 'Field', var: '--r-field' },
    { name: 'Card (small)', var: '--r-card-sm' },
    { name: 'Card', var: '--r-card' },
    { name: 'Pill', var: '--r-pill' },
    { name: 'Phone frame', var: '--r-phone' },
  ];

  resolve(v: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '';
  }
}
