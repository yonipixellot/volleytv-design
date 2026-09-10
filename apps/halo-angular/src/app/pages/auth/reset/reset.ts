import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../lib/layouts/auth-shell/auth-shell';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { TenantConfig } from '../../../tenant';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

/** Reset password — set a new password from an email link. Shows a saved state. */
@Component({
  selector: 'halo-reset-page',
  standalone: true,
  imports: [AuthShell, FormField, HaloButton, TPipe],
  templateUrl: './reset.html',
  styleUrl: '../auth.scss',
})
export class ResetPage {
  private router = inject(Router, { optional: true });
  private tenant = inject(TenantConfig);
  logoSrc = this.tenant.logoSrc;
  clientName = this.tenant.name;

  /** When true the reset link is expired/used — show the invalid-token state. */
  invalid = input(false);

  password = signal('');
  confirm = signal('');
  showPw = signal(false);
  saved = signal(false);

  pwType = computed(() => (this.showPw() ? 'text' : 'password'));
  pwError = computed(() =>
    this.password().length > 0 && this.password().length < 6 ? t('auth.use6') : null,
  );
  confirmError = computed(() =>
    this.confirm().length > 0 && this.confirm() !== this.password() ? "Passwords don't match" : null,
  );
  valid = computed(() => this.password().length >= 6 && this.confirm() === this.password());

  submit() {
    if (this.valid()) this.saved.set(true);
  }
  backToSignIn() {
    this.router?.navigate(['/auth/sign-in']);
  }
  requestNew() {
    this.router?.navigate(['/auth/forgot']);
  }
}
