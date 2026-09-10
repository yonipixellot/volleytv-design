import { Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '../../../lib/molecules/status-bar/status-bar';
import { FormField } from '../../../lib/molecules/form-field/form-field';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { HaloButton } from '../../../lib/atoms/button/button';
import { ViewContext } from '../../view-context';
import { PREMIUM_PLANS } from '../../upgrade-state';
import { t } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

/**
 * Upgrade — checkout step of the Premium funnel (from the Premium sheet's
 * "Unlock" CTA with ?pkg=<id>). A refined, grouped payment screen: lead block,
 * a single card-details panel (brands + fields), an order summary with tax, then
 * the Purchase CTA and a success step that flips the tier via ViewContext.
 * Prototype only — no payment is processed or collected. Back via the round ‹.
 */
@Component({
  selector: 'halo-upgrade-page',
  standalone: true,
  imports: [StatusBar, FormField, HaloIcon, HaloButton, TPipe],
  template: `
    <div class="halo-page up">
      <halo-status-bar time="9:30" />

      <header class="top">
        <button class="back" type="button" [attr.aria-label]="'common.back' | t" (click)="back()">
          <halo-icon name="chevron-left" [size]="17" />
        </button>
      </header>

      @if (!done()) {
        <div class="body">
          <div class="lead">
            <span class="eb">{{ 'up.secureCheckout' | t }}</span>
            <h1>{{ 'up.premiumTerm' | t: { term: plan().term } }}</h1>
            <p class="sub">{{ plan().blurb }} · {{ 'up.billedMonthly' | t }}</p>
          </div>

          <section class="paycard">
            <div class="pc-h">
              <span class="pc-t">{{ 'up.cardDetails' | t }}</span>
              <span class="brands" aria-hidden="true"><span>VISA</span><span>MC</span><span>AMEX</span></span>
            </div>
            <halo-form-field [label]="'up.nameOnCard' | t" placeholder="Tal Weiss" autocomplete="cc-name" />
            <halo-form-field [label]="'sub.cardNumber' | t" placeholder="1234 5678 9012 3456" inputmode="numeric" autocomplete="cc-number" />
            <div class="two">
              <halo-form-field [label]="'sub.expiry' | t" placeholder="MM/YY" inputmode="numeric" autocomplete="cc-exp" />
              <halo-form-field [label]="'up.cvc' | t" placeholder="123" inputmode="numeric" autocomplete="cc-csc" />
            </div>
          </section>

          <section class="summary">
            <div class="r"><span>{{ 'up.planAmount' | t }}</span><span class="num">{{ plan().price }}</span></div>
            <div class="r"><span>{{ 'up.taxes' | t }}</span><span class="num">$1.00</span></div>
            <div class="r total"><span>{{ 'up.totalBilled' | t }}</span><span class="num">{{ total() }}</span></div>
          </section>

          <p class="demo"><halo-icon name="lock" [size]="13" /> {{ 'up.wireframe' | t }}</p>
          <halo-button variant="premium" [block]="true" (press)="pay()">{{ 'up.purchase' | t: { total: total() } }}</halo-button>
          <p class="fine">{{ 'up.fine' | t: { term: plan().term } }}</p>
        </div>
      } @else {
        <div class="success">
          <span class="ok"><halo-icon name="check" [size]="30" /></span>
          <h2>{{ 'up.youre' | t }}</h2>
          <p>{{ 'up.youreSub' | t }}</p>
          <halo-button variant="premium" [block]="true" (press)="start()">{{ 'up.start' | t }}</halo-button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .up { overflow-x: hidden; }
    /* No wide layout on purpose. This is a single-column checkout: one card
       form, one totals block, one button. Widening it would put the label at
       one end of the screen and the field at the other, which is the exact
       failure the 720px cap exists to prevent. Verified at 1440 — the whole
       flow fits without scrolling (Maryna 2026-08-29). */
    .top { display: flex; align-items: center; padding: var(--space-1) var(--pad-x) var(--space-2); }
    .top .back { flex: none; width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid var(--hair); border-radius: 50%; background: var(--card2); color: var(--ink); cursor: pointer; }
    @media (hover: hover) {
      .top .back:hover { border-color: var(--ink4); }
    }

    .body { padding: 0 var(--pad-x); display: flex; flex-direction: column; gap: var(--gap-loose); }

    .lead { padding: var(--space-2) 0 2px; }
    .lead .eb { font-family: var(--body); font-weight: 800; font-size: var(--fs-caption); letter-spacing: .16em; text-transform: uppercase; color: var(--premium-text); }
    .lead h1 { margin: var(--space-1) 0 3px; font-family: var(--disp); font-weight: 800; font-size: var(--fs-d-sm); letter-spacing: -.01em; }
    .lead .sub { margin: 0; font-size: var(--fs-body); color: var(--ink2); }

    .paycard { background: var(--card); border: 1px solid var(--hair); border-radius: var(--r-card); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--gap-snug); }
    .pc-h { display: flex; align-items: center; justify-content: space-between; gap: var(--gap-snug); }
    .pc-t { font-family: var(--body); font-weight: 800; font-size: var(--fs-caption); letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); }
    .brands { display: flex; gap: var(--gap-tight); }
    .brands span { font-family: var(--body); font-weight: 800; font-size: var(--fs-caption); letter-spacing: .06em; color: var(--ink2); border: 1px solid var(--hair); border-radius: 6px; padding: var(--space-1) var(--space-2); background: var(--card2); }

    .paycard halo-form-field { display: block; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-snug); }
    .two > halo-form-field { display: block; min-width: 0; }

    .summary { border: 1px solid var(--hair); border-radius: var(--r-card-sm); background: var(--card2); padding: 2px var(--space-4); }
    .summary .r { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) 0; font-family: var(--body); font-size: var(--fs-body); color: var(--ink2); border-bottom: 1px solid var(--hair2); }
    .summary .r:last-child { border-bottom: 0; }
    .summary .r .num { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }
    .summary .r.total { color: var(--ink); font-weight: 800; }
    .summary .r.total .num { font-family: var(--disp); font-size: var(--fs-heading); }

    .demo { display: flex; align-items: center; gap: var(--gap-tight); margin: -2px 0 0; font-size: var(--fs-caption); color: var(--ink2); }
    .demo halo-icon { color: var(--premium-text); }
    .body halo-button, .success halo-button { display: block; }
    .fine { margin: 2px 0 0; text-align: center; font-size: var(--fs-caption); color: var(--ink3); }

    .success { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--gap-snug); padding: var(--space-10) var(--pad-x) 0; }
    .success .ok { width: 72px; height: 72px; display: grid; place-items: center; border-radius: 50%; color: var(--premium-ink); background: var(--premium); }
    .success h2 { margin: var(--space-2) 0 0; font-family: var(--disp); font-weight: 800; font-size: var(--fs-d-sm); }
    .success p { margin: 0 0 var(--space-2); font-size: var(--fs-body); color: var(--ink2); max-width: 300px; line-height: 1.5; }
  `],
})
export class UpgradePage {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);
  private vc = inject(ViewContext);

  protected done = signal(false);
  private pkg = (this.route.snapshot.queryParams['pkg'] as string) ?? '6mo';
  protected plan = computed(() => PREMIUM_PLANS.find((p) => p.id === this.pkg) ?? PREMIUM_PLANS[1]);
  protected total = computed(() => '$' + (parseFloat(this.plan().priceNum || '0') + 1).toFixed(2));

  protected pay(): void {
    this.done.set(true);
  }
  protected start(): void {
    this.vc.setTier('premium');
    this.router.navigate(['/you']);
  }
  protected back(): void {
    this.location.back();
  }
}
