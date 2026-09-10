import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsPage } from '../../../settings-page';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';
import { previewSignOut } from '../../../../preview-gate/gate';

const EXPECTED_EMAIL = 'tal.weiss@example.com';

/**
 * Delete account (C21). Irreversible-warning card + type-email-to-confirm guard;
 * confirming swaps to a scheduled-deletion terminal state with a sign-out CTA.
 */
@Component({
  selector: 'halo-delete-account-page',
  standalone: true,
  imports: [SettingsPage, HaloButton, HaloIcon, TPipe],
  templateUrl: './delete-account.html',
  styleUrls: ['../settings-common.scss', './delete-account.scss'],
})
export class DeleteAccountPage {
  private router = inject(Router);

  protected expectedEmail = EXPECTED_EMAIL;
  typed = signal('');
  confirmed = signal(false);
  protected canDelete = computed(() => this.typed().trim().toLowerCase() === EXPECTED_EMAIL);

  bullets = [
    t('del.b1'),
    t('del.b2'),
    t('del.b3'),
  ];

  confirm(): void { if (this.canDelete()) this.confirmed.set(true); }
  cancel(): void { void this.router.navigate(['/account']); }
  signOut(): void { void previewSignOut().then(() => this.router.navigate(['/auth/sign-in'])); }
}
