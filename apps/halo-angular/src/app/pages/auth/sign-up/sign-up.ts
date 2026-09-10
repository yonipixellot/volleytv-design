import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../lib/layouts/auth-shell/auth-shell';
import { SegmentedToggle } from '../../../../lib/molecules/segmented-toggle/segmented-toggle';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { FormSelect } from '../../../../lib/molecules/form-select/form-select';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { SocialButton } from '../../../../lib/molecules/social-button/social-button';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { TenantConfig } from '../../../tenant';
import { t, regionName } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

/** Sign up — account details (step 1 of 3), flat BA style. */
@Component({
  selector: 'halo-sign-up-page',
  standalone: true,
  imports: [AuthShell, SegmentedToggle, FormField, FormSelect, HaloButton, SocialButton, HaloIcon, TPipe],
  templateUrl: './sign-up.html',
  styleUrl: '../auth.scss',
})
export class SignUpPage {
  private router = inject(Router, { optional: true });
  private tenant = inject(TenantConfig);
  logoSrc = this.tenant.logoSrc;
  clientName = this.tenant.name;

  modes = [
    { key: 'signin', label: t('auth.signIn') },
    { key: 'signup', label: t('auth.signUp') },
  ];
  mode = signal('signup');

  name = signal('');
  email = signal('');
  password = signal('');
  confirm = signal('');
  birth = signal('');
  gender = signal('');
  country = signal('');
  showPw = signal(false);
  pwType = computed(() => (this.showPw() ? 'text' : 'password'));

  genders = [
    { value: 'm', label: t('auth.male') },
    { value: 'f', label: t('auth.female') },
    { value: 'nb', label: t('auth.nonBinary') },
    { value: 'na', label: t('auth.preferNot') },
  ];
  countries = [
    { value: 'au', label: regionName('au') },
    { value: 'nz', label: regionName('nz') },
    { value: 'us', label: regionName('us') },
    { value: 'gb', label: regionName('gb') },
    { value: 'ca', label: regionName('ca') },
  ];

  // age gate (13+) derived from the birth-date field
  private age = computed<number | null>(() => {
    const b = this.birth();
    if (!b) return null;
    const d = new Date(b);
    if (isNaN(d.getTime())) return null;
    const t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return a;
  });
  isUnder13 = computed(() => this.age() !== null && (this.age() as number) < 13);

  pwError = computed(() =>
    this.password().length > 0 && this.password().length < 6 ? t('auth.use6') : null,
  );
  confirmError = computed(() =>
    this.confirm().length > 0 && this.confirm() !== this.password() ? "Passwords don't match" : null,
  );
  valid = computed(
    () =>
      this.name().length > 1 &&
      this.email().includes('@') &&
      this.password().length >= 6 &&
      this.confirm() === this.password() &&
      this.birth().length > 0 &&
      this.gender().length > 0 &&
      this.country().length > 0 &&
      !this.isUnder13(),
  );

  onMode(m: string) {
    if (m === 'signin') this.router?.navigate(['/auth/sign-in']);
  }
  submit() {
    // Email+password sign-up goes through email verification first (C3).
    if (this.valid()) this.router?.navigate(['/auth/verify'], { queryParams: { email: this.email() } });
  }
  /** Social SSO returns a partial profile → complete the mandatory fields (C4). */
  social(provider: 'apple' | 'google') {
    this.router?.navigate(['/auth/complete-profile'], { queryParams: { provider } });
  }
}
