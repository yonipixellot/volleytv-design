import { Component } from '@angular/core';

interface Row { name: string; var: string; }
interface Group { title: string; note?: string; rows: Row[]; kind: 'bar' | 'radius'; }

/** Foundations · Spacing & radii — the layout rhythm every page composes from. */
@Component({
  selector: 'halo-space-tokens',
  standalone: true,
  template: `
    <div class="st-wrap">
      @for (g of groups; track g.title) {
        <section class="st-group">
          <h3 class="st-h">{{ g.title }}</h3>
          @if (g.note) { <p class="st-note">{{ g.note }}</p> }
          @for (r of g.rows; track r.var) {
            <div class="st-row">
              <div class="st-label"><b>{{ r.name }}</b><code>{{ r.var }}</code></div>
              @if (g.kind === 'bar') {
                <div class="st-bar" [style.width]="'var(' + r.var + ')'"></div>
              } @else {
                <div class="st-radius" [style.borderRadius]="'var(' + r.var + ')'"></div>
              }
              <span class="st-val">{{ resolve(r.var) }}</span>
            </div>
          }
        </section>
      }
    </div>
  `,
  styleUrl: './space-tokens.scss',
})
export class SpaceTokens {
  groups: Group[] = [
    {
      title: 'Layout rhythm',
      note: 'The page skeleton. Compose pages from these plus the .halo-page / .halo-stack / .halo-rail / .halo-nav-dock utilities. One inset governs the screen — there is no separate section inset.',
      kind: 'bar',
      rows: [
        { name: 'Screen inset', var: '--pad-x' },
        { name: 'Card stack gap', var: '--stack' },
        { name: 'Rail gap', var: '--rail-gap' },
        { name: 'Nav clearance', var: '--nav-clear' },
      ],
    },
    {
      title: 'Vertical block rhythm',
      note: 'ONE OWNER PER GAP: the space between two blocks belongs to the block below it, and every block contributes 0 at its bottom edge. Sums are what made one gap render 30px and the next 32px.',
      kind: 'bar',
      rows: [
        { name: 'Between blocks', var: '--block-gap' },
        { name: 'Heading to its content', var: '--section-bottom' },
      ],
    },
    {
      title: 'Component interiors',
      note: 'Reach for these before a primitive step — they name the role, so one change re-spaces every component that plays it.',
      kind: 'bar',
      rows: [
        { name: 'Card padding', var: '--pad-card' },
        { name: 'Card padding (compact)', var: '--pad-card-sm' },
        { name: 'Control padding Y', var: '--pad-control-y' },
        { name: 'Control padding X', var: '--pad-control-x' },
        { name: 'Field padding Y', var: '--pad-field-y' },
        { name: 'Field padding X', var: '--pad-field-x' },
      ],
    },
    {
      title: 'Gaps inside a component',
      kind: 'bar',
      rows: [
        { name: 'Tight (icon → label)', var: '--gap-tight' },
        { name: 'Snug (control rows)', var: '--gap-snug' },
        { name: 'Loose (grouped)', var: '--gap-loose' },
      ],
    },
    {
      title: 'The grid',
      note: 'Primitive steps, where N x 4 = the value — nothing to look up. Use only for one-off rhythm no role above names it. Below 4px and above space-12 are off the ladder by design: those state a reason in the code instead.',
      kind: 'bar',
      rows: [
        { name: 'space-1', var: '--space-1' },
        { name: 'space-2', var: '--space-2' },
        { name: 'space-3', var: '--space-3' },
        { name: 'space-4', var: '--space-4' },
        { name: 'space-5', var: '--space-5' },
        { name: 'space-6', var: '--space-6' },
        { name: 'space-7', var: '--space-7' },
        { name: 'space-8', var: '--space-8' },
        { name: 'space-9', var: '--space-9' },
        { name: 'space-10', var: '--space-10' },
        { name: 'space-11', var: '--space-11' },
        { name: 'space-12', var: '--space-12' },
      ],
    },
  ];

  resolve(v: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '';
  }
}
