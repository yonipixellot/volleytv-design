import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../lib/layouts/auth-shell/auth-shell';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { TenantConfig } from '../../../tenant';
import { TPipe } from '../../../i18n/t.pipe';

/** Forgot password — request a reset link. Shows a sent-confirmation state. */
@Component({
  selector: 'halo-forgot-page',
  standalone: true,
  imports: [AuthShell, FormField, HaloButton, TPipe],
  templateUrl: './forgot.html',
  styleUrl: '../auth.scss',
})
export class ForgotPage {
  private router = inject(Router, { optional: true });
  private tenant = inject(TenantConfig);
  logoSrc = this.tenant.logoSrc;
  clientName = this.tenant.name;

  email = signal('');
  sent = signal(false);
  valid = computed(() => this.email().includes('@'));

  submit() {
    if (this.valid()) this.sent.set(true);
  }
  backToSignIn() {
    this.router?.navigate(['/auth/sign-in']);
  }
}
