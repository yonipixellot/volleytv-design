import { Component } from '@angular/core';

/** Renders the per-theme elevation ladder from the live tokens — flip the
 *  theme toolbar to see both tunings. --edge is the hairline top-light. */
@Component({
  selector: 'halo-elevation-tokens',
  standalone: true,
  template: `
    <div class="wrap">
      <div class="card" style="box-shadow: var(--shadow-1)"><b>--shadow-1</b><span>knobs · chips · small raised bits</span></div>
      <div class="card" style="box-shadow: var(--shadow-2)"><b>--shadow-2</b><span>cards · tiles · rail items</span></div>
      <div class="card" style="box-shadow: var(--shadow-3)"><b>--shadow-3</b><span>floating nav · popovers · hero cards</span></div>
      <div class="card" style="box-shadow: var(--shadow-up)"><b>--shadow-up</b><span>bottom sheets (upward throw)</span></div>
      <div class="card" style="box-shadow: var(--shadow-3), var(--edge)"><b>--shadow-3 + --edge</b><span>float with hairline top-light (bottom-nav)</span></div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: var(--space-6); padding: var(--space-8) var(--space-6) var(--space-11); }
    .card {
      display: flex; flex-direction: column; gap: 3px;
      background: var(--card); border: 1px solid var(--hair);
      border-radius: var(--r-card-sm); padding: var(--pad-card) var(--space-5);
    }
    b { font-family: var(--body); font-weight: 800; font-size: var(--fs-caption); color: var(--ink); }
    span { font-family: var(--body); font-weight: 500; font-size: var(--fs-caption); color: var(--ink2); }
  `],
})
export class ElevationTokens {}
