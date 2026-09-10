import { Component } from '@angular/core';

/** The WCAG 2.2 AA baseline this design system ships BY DEFAULT — conformance
 *  is claimed on the default delivered state, never on an opt-in toggle
 *  (per the hoopstv accessibility design decision). Storybook-only doc. */
@Component({
  selector: 'halo-a11y-tokens',
  standalone: true,
  template: `
    <div class="wrap">
      <h3>WCAG 2.2 AA · baseline, on by default</h3>
      <p class="note">Conformance lives in the <b>default state</b>. An accessibility toggle may add above-AA comfort (bigger text, calmer motion) but never carries the baseline.</p>

      @for (r of rows; track r.sc) {
        <div class="row">
          <code>{{ r.sc }}</code>
          <b>{{ r.what }}</b>
          <span class="d">{{ r.how }}</span>
        </div>
      }

      <h3 class="mt">Known blind spots (be honest in any claim)</h3>
      <p class="note">Automated contrast can't resolve text over gradients, imagery, or <code>backdrop-filter</code>. Those need the manual sampling pass. <code>--on-media</code> + scrims own the text-over-media layer; keep scrims when placing text on photos/video.</p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .wrap { padding: var(--space-6); max-width: 640px; }
    h3 { margin: 0 0 var(--space-1); font-family: var(--disp); font-weight: 800; font-size: var(--fs-title); color: var(--ink); }
    h3.mt { margin-top: var(--space-6); }
    .note { margin: 0 0 var(--space-4); font-family: var(--body); font-size: var(--fs-caption); color: var(--ink2); line-height: var(--lh-body); }
    .row { display: grid; grid-template-columns: 78px 200px 1fr; gap: var(--gap-snug); align-items: baseline; padding: var(--space-2) 0; border-bottom: 1px solid var(--hair2, var(--hair)); font-family: var(--body); }
    code { font-family: ui-monospace, Menlo, monospace; font-size: var(--fs-caption); color: var(--accent); }
    b { font-size: var(--fs-caption); color: var(--ink); }
    .d { font-size: var(--fs-caption); color: var(--ink2); line-height: var(--lh-snug); }
  `],
})
export class A11yTokens {
  rows = [
    { sc: '1.4.3', what: 'Text contrast ≥ 4.5:1', how: 'Full matrix measured 2026-08-21: 145 stories × dark/light × base/BA = 0 failures. On-tint inks validated against the darkest common surface (--screen), not white.' },
    { sc: '1.4.11', what: 'Non-text contrast ≥ 3:1', how: 'Focus ring = --accent on a contrast halo; hairlines are decorative-only.' },
    { sc: '2.4.7/13', what: 'Focus visible', how: 'One zero-specificity :where() rule in styles.scss covers every interactive element: keyboard-only, 2px --accent ring + halo.' },
    { sc: '2.5.8', what: 'Target size ≥ 24×24', how: 'Swept across all stories via DOM measurement; offenders fixed or documented (inline-text exception applies).' },
    { sc: '2.3.3', what: 'Reduced motion', how: 'Every entrance/loop honours prefers-reduced-motion; spinner slows instead of stopping (essential feedback).' },
    { sc: '4.1.3', what: 'Status messages', how: 'Toasts announce via aria-live=polite; form errors are text, not color-only.' },
    { sc: '1.4.4', what: 'Text resize', how: 'Type sits on the --fs-* token ramp; layout uses flex/grid, no fixed-height text boxes.' },
    { sc: '3.3.x', what: 'Errors + labels', how: 'form-field/form-select: bound labels, visible error text, hints; native inputmode/autocomplete passthrough.' },
  ];
}
