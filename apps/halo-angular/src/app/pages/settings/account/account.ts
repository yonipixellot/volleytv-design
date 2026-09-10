import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsPage } from '../../../settings-page';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

/** Demo identity, consistent with the side-menu identity card. */
const INITIAL = { name: 'Tal Weiss', email: 'tal.weiss@example.com', phone: '+61 412 345 678' };

/**
 * Account & profile (C19). Display name / email / phone with a gradient avatar
 * coin, plus a Delete account (C21) link-out.
 *
 * READ-ONLY as of 2026-08-26: no profile-editing flow exists yet, so the fields
 * render `[disabled]` and Change password is commented out of the template
 * (route + page kept). The email re-auth machinery below stays wired but is
 * unreachable until then — `onEmailBlur` can't fire while the input is
 * disabled, so `pendingEmail` never sets and the sheet never opens. Left intact
 * rather than archived: it's the exact behaviour editing needs back, and it
 * costs nothing dormant.
 */
@Component({
  selector: 'halo-account-page',
  standalone: true,
  imports: [SettingsPage, FormField, HaloButton, TPipe],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class AccountPage {
  private router = inject(Router);

  protected initials = INITIAL.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  name = signal(INITIAL.name);
  email = signal(INITIAL.email);
  phone = signal(INITIAL.phone);
  pendingEmail = signal<string | null>(null);

  // Re-auth confirm sheet
  reauthOpen = signal(false);
  reauthPwd = signal('');
  reauthErr = signal<string | null>(null);

  /** On email blur — if it changed and isn't already pending, ask for re-auth. */
  onEmailBlur(): void {
    if (this.email() !== INITIAL.email && this.email() !== this.pendingEmail()) {
      this.reauthOpen.set(true);
    }
  }
  confirmReauth(): void {
    if (!this.reauthPwd()) {
      this.reauthErr.set(t('account.enterCurrent'));
      return;
    }
    this.pendingEmail.set(this.email());
    this.closeReauth();
  }
  cancelReauth(): void {
    this.email.set(INITIAL.email);
    this.pendingEmail.set(null);
    this.closeReauth();
  }
  private closeReauth(): void {
    this.reauthOpen.set(false);
    this.reauthPwd.set('');
    this.reauthErr.set(null);
  }
  protected pendingBody = computed(
    () => t('account.pendingBody', { email: this.pendingEmail() ?? '' }),
  );

  changePassword(): void { void this.router.navigate(['/account/change-password']); }
  deleteAccount(): void { void this.router.navigate(['/account/delete']); }
}
