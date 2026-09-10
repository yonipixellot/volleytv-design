import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthShell } from '../../../../lib/layouts/auth-shell/auth-shell';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { SegmentedToggle, SegOption } from '../../../../lib/molecules/segmented-toggle/segmented-toggle';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { TenantConfig } from '../../../tenant';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

/**
 * Complete profile (C4) — the social-SSO gap screen (Flow 1.2). Apple/Google
 * return name+email but not birth date / gender / country; when the tenant marks
 * those mandatory the account isn't complete until they're filled. Collects only
 * the missing fields, then finishes. Reached from the sign-up social buttons.
 */
@Component({
  selector: 'halo-complete-profile-page',
  standalone: true,
  imports: [AuthShell, FormField, SegmentedToggle, HaloButton, TPipe],
  templateUrl: './complete-profile.html',
  styleUrls: ['../auth.scss', './complete-profile.scss'],
})
export class CompleteProfilePage {
  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute);
  private tenant = inject(TenantConfig);
  logoSrc = this.tenant.logoSrc;
  clientName = this.tenant.name;

  /** Provider drives the eyebrow copy; capitalised for display. */
  protected provider = (() => {
    const p = (this.route.snapshot.queryParamMap.get('provider') || 'google').toLowerCase();
    return p === 'apple' ? 'Apple' : 'Google';
  })();

  birthDate = signal('');
  gender = signal('');
  country = signal('');

  genders: SegOption[] = [
    { key: 'female', label: t('auth.female') },
    { key: 'male', label: t('auth.male') },
    { key: 'other', label: t('auth.other') },
  ];

  protected ready = computed(() => this.birthDate().length > 0 && this.gender().length > 0 && this.country().trim().length > 0);

  finish(): void { if (this.ready()) void this.router?.navigate(['/onboarding']); }
}
