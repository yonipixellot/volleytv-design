import { Component } from '@angular/core';

interface Swatch { name: string; var: string; }
interface Group { title: string; note?: string; swatches: Swatch[]; }

/** Foundations · Colour tokens — the live palette from CSS custom properties. */
@Component({
  selector: 'halo-color-tokens',
  standalone: true,
  template: `
    <div class="ct-wrap">
      @for (g of groups; track g.title) {
        <section class="ct-group">
          <h3 class="ct-h">{{ g.title }}</h3>
          @if (g.note) { <p class="ct-note">{{ g.note }}</p> }
          <div class="ct-grid">
            @for (s of g.swatches; track s.var) {
              <figure class="ct-item">
                <div class="ct-chip" [style.background]="'var(' + s.var + ')'"></div>
                <figcaption>
                  <b>{{ s.name }}</b>
                  <code>{{ s.var }}</code>
                </figcaption>
              </figure>
            }
          </div>
        </section>
      }
    </div>
  `,
  styleUrl: './color-tokens.scss',
})
export class ColorTokens {
  groups: Group[] = [
    {
      title: 'Brand knobs',
      note: 'Set by the client from the admin app. Everything below is derived from these two.',
      swatches: [
        { name: 'Primary', var: '--primary' },
        { name: 'On primary', var: '--on-primary' },
        { name: 'Secondary', var: '--secondary' },
        { name: 'On secondary', var: '--on-secondary' },
      ],
    },
    {
      title: 'Accent (derived)',
      swatches: [
        { name: 'Accent', var: '--accent' },
        { name: 'Accent deep', var: '--accent-deep' },
        { name: 'On accent', var: '--on-accent' },
      ],
    },
    {
      title: 'Semantic',
      swatches: [
        { name: 'Positive', var: '--pos' },
        { name: 'Live', var: '--live' },
        { name: 'Offence', var: '--c-off' },
        { name: 'Defence', var: '--c-def' },
      ],
    },
    {
      title: 'Branded ornaments',
      swatches: [
        { name: 'Brand ring', var: '--brand-ring' },
        { name: 'Brand core', var: '--brand-core' },
      ],
    },
    {
      title: 'Surface',
      swatches: [
        { name: 'Screen', var: '--screen' },
        { name: 'Card', var: '--card' },
        { name: 'Card 2', var: '--card2' },
        { name: 'Court', var: '--court' },
      ],
    },
    {
      title: 'Text',
      swatches: [
        { name: 'Ink', var: '--ink' },
        { name: 'Ink 60', var: '--ink2' },
        { name: 'Ink 40', var: '--ink3' },
        { name: 'Ink 22', var: '--ink4' },
      ],
    },
    {
      title: 'Lines',
      swatches: [
        { name: 'Hairline', var: '--hair' },
        { name: 'Hairline 2', var: '--hair2' },
        { name: 'Band', var: '--band' },
        { name: 'Ring', var: '--ring' },
        { name: 'Court line', var: '--courtline' },
      ],
    },
  ];
}
