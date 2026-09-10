import { Injectable, signal } from '@angular/core';
import { t } from './i18n/i18n';

export interface PremiumPlan {
  id: string;
  term: string;
  price: string;
  priceNum: string;
  blurb: string;
  badge?: string;
}

/** The three Premium packages (from the wireframe PT's Premium sheet). */
export const PREMIUM_PLANS: PremiumPlan[] = [
  { id: '14d', term: t('up.14days'), price: '$4.99', priceNum: '4.99', blurb: t('up.tryPremium') },
  { id: '6mo', term: t('up.6months'), price: '$34.99', priceNum: '34.99', blurb: t('up.seasonPass'), badge: t('up.mostPopular') },
  { id: '12mo', term: t('up.12months'), price: '$54.99', priceNum: '54.99', blurb: t('up.allYear') },
];

/**
 * App-wide state for the Premium upgrade funnel. A BlurLock tap or a locked nav
 * item calls `open()`; the PremiumSheet (package picker) reads `isOpen`. Picking
 * a plan routes to /upgrade (payment → success), which flips the tier via
 * ViewContext. Kept separate from routing so any surface can raise the upsell.
 */
@Injectable({ providedIn: 'root' })
export class UpgradeState {
  private _open = signal(false);
  readonly isOpen = this._open.asReadonly();
  /** Preselected plan in the sheet (defaults to the popular one). */
  readonly plan = signal<string>('6mo');

  open(plan?: string): void {
    if (plan) this.plan.set(plan);
    this._open.set(true);
  }
  close(): void {
    this._open.set(false);
  }
}
