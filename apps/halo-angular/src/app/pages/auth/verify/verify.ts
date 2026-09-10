import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthShell } from '../../../../lib/layouts/auth-shell/auth-shell';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { TenantConfig } from '../../../tenant';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

const RESEND_COOLDOWN = 30;

/**
 * Email verification (C3) — post email+password sign-up (Flow 1.4). The user
 * gets a LINK (not a code); clicking it continues onboarding. States: initial,
 * resent, resend-cooldown countdown, and link-expired. Social/org-SSO skip this.
 * Demo: an amber-badged "Open the verification link" button stands in for the
 * emailed link (there's no real inbox).
 */
@Component({
  selector: 'halo-verify-page',
  standalone: true,
  imports: [AuthShell, HaloButton, TPipe],
  templateUrl: './verify.html',
  styleUrls: ['../auth.scss', './verify.scss'],
})
export class VerifyPage implements OnDestroy {
  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute);
  private tenant = inject(TenantConfig);
  logoSrc = this.tenant.logoSrc;
  clientName = this.tenant.name;

  protected email = this.route.snapshot.queryParamMap.get('email') || t('auth.yourEmail');
  cooldown = signal(0);
  resent = signal(false);
  expired = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected resendLabel = computed(() => (this.cooldown() > 0 ? t('auth.resendIn', { s: this.cooldown() }) : t('auth.resendEmail')));

  verified(): void { void this.router?.navigate(['/onboarding']); }
  useDifferentEmail(): void { void this.router?.navigate(['/auth/sign-up']); }

  resend(): void {
    this.expired.set(false);
    this.resent.set(true);
    this.cooldown.set(RESEND_COOLDOWN);
    this.timer && clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.cooldown.update((c) => Math.max(0, c - 1));
      if (this.cooldown() === 0 && this.timer) { clearInterval(this.timer); this.timer = null; }
    }, 1000);
  }

  ngOnDestroy(): void { this.timer && clearInterval(this.timer); }
}
