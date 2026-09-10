import { Component } from '@angular/core';

/** The non-visual token families rendered as reference tables: stacking
 *  ladder, motion, breakpoints. Values are read live from the tokens so the
 *  doc can't drift. */
@Component({
  selector: 'halo-system-tokens',
  standalone: true,
  template: `
    <div class="wrap">
      <section>
        <h3>Stacking ladder <code>--z-*</code></h3>
        <p class="note">Overlay surfaces only; component-internal layering (z 1–15) stays local. Scrim = band value, panel = band + 1 (+10 in the modal band).</p>
        @for (z of zs; track z.t) {
          <div class="row"><code>{{ z.t }}</code><span class="v">{{ val(z.t) }}</span><span class="d">{{ z.d }}</span></div>
        }
      </section>
      <section>
        <h3>Motion <code>--dur-* / --ease-*</code></h3>
        <p class="note">Interactive feedback = fast · state changes = med · entrances = slow. Ambient loops stay bespoke.</p>
        @for (m of motion; track m.t) {
          <div class="row"><code>{{ m.t }}</code><span class="v">{{ val(m.t) }}</span><span class="d">{{ m.d }}</span></div>
        }
        <div class="demo">
          <button class="pill" (click)="bump = !bump" type="button">Play</button>
          <span class="ball" [class.go]="bump"></span>
        </div>
      </section>
      <section>
        <h3>Breakpoints <code>--bp-*</code></h3>
        <p class="note">CSS vars can't be read inside &#64;media. Hardcode these canonical values in min-width queries.</p>
        @for (b of bps; track b.t) {
          <div class="row"><code>{{ b.t }}</code><span class="v">{{ val(b.t) }}</span><span class="d">{{ b.d }}</span></div>
        }
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: var(--space-6); padding: var(--space-6); }
    h3 { margin: 0 0 2px; font-family: var(--disp); font-weight: 800; font-size: var(--fs-title); color: var(--ink); }
    h3 code, .row code { font-family: ui-monospace, Menlo, monospace; font-size: var(--fs-caption); color: var(--accent); }
    .note { margin: 0 0 var(--space-3); font-family: var(--body); font-size: var(--fs-caption); color: var(--ink2); line-height: var(--lh-body); }
    .row { display: grid; grid-template-columns: 120px 150px 1fr; gap: var(--gap-snug); align-items: baseline; padding: var(--space-2) 0; border-bottom: 1px solid var(--hair2, var(--hair)); }
    .v { font-family: var(--body); font-weight: 700; font-size: var(--fs-caption); color: var(--ink); }
    .d { font-family: var(--body); font-size: var(--fs-caption); color: var(--ink3); }
    .demo { display: flex; align-items: center; gap: var(--gap-loose); padding-top: var(--space-3); }
    .pill { border: 1px solid var(--hair); background: var(--card2); color: var(--ink); font-family: var(--body); font-weight: 700; font-size: var(--fs-caption); border-radius: var(--r-pill); padding: var(--pad-control-y) var(--pad-control-x); cursor: pointer; }
    .ball { width: 18px; height: 18px; border-radius: 50%; background: var(--accent); transition: transform var(--dur-slow) var(--ease-spring); }
    .ball.go { transform: translateX(120px); }
  `],
})
export class SystemTokens {
  bump = false;
  zs = [
    { t: '--z-header', d: 'sticky back-bar / top chrome' },
    { t: '--z-pop', d: 'page popovers + their scrims' },
    { t: '--z-drawer', d: 'side drawer (menu)' },
    { t: '--z-sheet', d: 'bottom sheets / takeovers' },
    { t: '--z-sheet-hi', d: 'sheets above sheets (share)' },
    { t: '--z-modal', d: 'blocking modals + confirms' },
  ];
  motion = [
    { t: '--dur-fast', d: 'press feedback, micro state' },
    { t: '--dur-med', d: 'hover / standard transitions' },
    { t: '--dur-slow', d: 'sheet + drawer entrances' },
    { t: '--ease-spring', d: 'playful snap' },
    { t: '--ease-out-soft', d: 'long decelerating settle' },
  ];
  bps = [
    { t: '--bp-tablet', d: 'tablet layouts begin' },
    { t: '--bp-desktop', d: 'desktop layouts begin' },
  ];

  val(token: string): string {
    const el = document.querySelector('.halo') ?? document.documentElement;
    return getComputedStyle(el as HTMLElement).getPropertyValue(token).trim() || '—';
  }
}
