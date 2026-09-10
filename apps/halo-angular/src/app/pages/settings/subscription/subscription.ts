import { Component, computed, inject, signal } from '@angular/core';
import { ToastState } from '../../../toast-state';
import { SettingsPage } from '../../../settings-page';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { ViewContext, Tier } from '../../../view-context';
import { t, fmtDate } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

interface PlanTier { id: Tier; name: string; price: string; cadence: string; perks: string[]; featured?: boolean; }
interface BillingRow { id: string; date: string; desc: string; amount: string; }

const RENEWAL = fmtDate(new Date(2026, 5, 16), { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Subscription & billing (C24). Current-plan hero (driven by the live DEV Tier
 * control), plan comparison, payment method, billing history, and a cancel flow
 * (confirm sheet → cancelled terminal state). Distinct from the /upgrade
 * checkout. Replaces the /subscription placeholder.
 */
@Component({
  selector: 'halo-subscription-page',
  standalone: true,
  imports: [SettingsPage, HaloIcon, FormField, TPipe],
  templateUrl: './subscription.html',
  styleUrls: ['../settings-common.scss', './subscription.scss'],
})
export class SubscriptionPage {
  private vc = inject(ViewContext);
  private toast = inject(ToastState);

  // ---- Payment method (edit sheet, prototype-local state) ----
  card = signal({ last4: '4242', exp: '09 / 27' });
  payOpen = signal(false);
  cardNum = signal('');
  cardExp = signal('');
  cardErr = signal<string | null>(null);
  expErr = signal<string | null>(null);
  openPay(): void { this.cardNum.set(''); this.cardExp.set(''); this.cardErr.set(null); this.expErr.set(null); this.payOpen.set(true); }
  savePay(): void {
    const digits = this.cardNum().replace(/\D/g, '');
    const exp = this.cardExp().trim();
    this.cardErr.set(digits.length >= 12 ? null : t('sub.fullCard'));
    this.expErr.set(/^\d{2}\s*\/?\s*\d{2}$/.test(exp) ? null : t('sub.useMMYY'));
    if (this.cardErr() || this.expErr()) return;
    this.card.set({ last4: digits.slice(-4), exp: exp.replace(/^(\d{2})\s*\/?\s*(\d{2})$/, '$1 / $2') });
    this.payOpen.set(false);
    this.toast.show(t('sub.paymentUpdated'), 'pos');
  }

  // ---- Billing history (invoice sheet) ----
  invoice = signal<BillingRow | null>(null);
  invoiceNo(r: BillingRow): string { return 'INV-2026-0' + r.id.slice(1); }

  protected renewal = RENEWAL;
  cancelOpen = signal(false);
  cancelled = signal(false);

  tiers: PlanTier[] = [
    { id: 'free', name: t('sub.free'), price: '$0', cadence: t('sub.mo'), perks: [t('sub.pFreeLive'), t('sub.pFreeFollow'), t('sub.pFreeScores')] },
    { id: 'basic', name: t('sub.basic'), price: '$6.99', cadence: t('sub.mo'), perks: [t('sub.pBasicEverything'), t('sub.pBasicHl'), t('sub.pBasicShare')] },
    { id: 'premium', name: t('sub.allAccess'), price: '$12.99', cadence: t('sub.mo'), featured: true, perks: [t('sub.pPremEverything'), t('sub.pPremAllHl'), t('sub.pPremInsights'), t('sub.pPremAdFree')] },
  ];

  billing: BillingRow[] = [
    { id: 'b1', date: fmtDate(new Date(2026, 4, 16), { day: 'numeric', month: 'short', year: 'numeric' }), desc: t('sub.allAccessMonthly'), amount: '$12.99' },
    { id: 'b2', date: fmtDate(new Date(2026, 3, 16), { day: 'numeric', month: 'short', year: 'numeric' }), desc: t('sub.allAccessMonthly'), amount: '$12.99' },
    { id: 'b3', date: fmtDate(new Date(2026, 2, 16), { day: 'numeric', month: 'short', year: 'numeric' }), desc: t('sub.allAccessMonthly'), amount: '$12.99' },
  ];

  protected currentId = computed<Tier>(() => this.vc.tier());
  protected current = computed(() => this.tiers.find((t) => t.id === this.currentId()) ?? this.tiers[2]);

  confirmCancel(): void { this.cancelOpen.set(false); this.cancelled.set(true); }
}
