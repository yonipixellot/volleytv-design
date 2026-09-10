import { Component } from '@angular/core';

/** Foundations · Typography — the display (League Spartan) + body (Inter)
 *  scale. Every specimen is set with the `--fs-*` tokens from _tokens.scss, so
 *  this story is the single rendered source of truth for the scale. Grouped by
 *  ROLE, because a flat list of sizes tells you what exists and not what to
 *  reach for. See "Tokens/Typography · Rules" for how to choose. */
@Component({
  selector: 'halo-type-tokens',
  standalone: true,
  template: `
    <div class="tt-wrap">
      <section>
        <h3 class="tt-h">Body: Inter &nbsp;·&nbsp; <code>var(--body)</code></h3>
        <div class="row"><span class="tok">--fs-heading · 20</span><p class="body fs-heading">Compact heading</p></div>
        <div class="row"><span class="tok">--fs-title · 18</span><p class="body fs-title">Card &amp; row title</p></div>
        <div class="row"><span class="tok">--fs-body-lg · 16</span><p class="body fs-body-lg">Control label · row title · subtitle</p></div>
        <div class="row"><span class="tok">--fs-body · 14</span><p class="body fs-body">Body and list text: the quick brown fox jumps over the lazy dog.</p></div>
        <div class="row"><span class="tok">--fs-caption · 12</span><p class="body fs-caption">Meta · tag · badge · caption</p></div>
      </section>

      <section>
        <h3 class="tt-h">Display: League Spartan &nbsp;·&nbsp; <code>var(--disp)</code></h3>
        <div class="row"><span class="tok">--fs-d-2xl · 54</span><p class="disp fs-d-2xl num">102</p></div>
        <div class="row"><span class="tok">--fs-d-lg · 40</span><p class="disp fs-d-lg">Volleyball Australia</p></div>
        <div class="row"><span class="tok">--fs-d-md · 32</span><p class="disp fs-d-md">Tal Weiss</p></div>
        <div class="row"><span class="tok">--fs-d-sm · 24</span><p class="disp fs-d-sm num">86 – 79</p></div>
        <div class="row"><span class="tok">--fs-d-xs · 20</span><p class="disp fs-d-xs">SECTION HEADER</p></div>
      </section>
    </div>
  `,
  styleUrl: './type-tokens.scss',
})
export class TypeTokens {}
