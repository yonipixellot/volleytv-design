import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsPage } from '../../../settings-page';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

/**
 * Change password (C20). Three fields — current / new / confirm. Validates the
 * current is filled, the new is ≥8 chars and matches confirm; submit swaps to a
 * success card. Back returns to Account.
 */
@Component({
  selector: 'halo-change-password-page',
  standalone: true,
  imports: [SettingsPage, FormField, HaloButton, HaloIcon, TPipe],
  templateUrl: './change-password.html',
  styleUrl: '../settings-common.scss',
})
export class ChangePasswordPage {
  private router = inject(Router);

  current = signal('');
  next = signal('');
  confirm = signal('');
  done = signal(false);

  protected pwOk = computed(() => this.next().length >= 8 && this.next() === this.confirm());
  protected canSubmit = computed(() => this.current().length > 0 && this.pwOk());
  protected mismatch = computed(() =>
    this.confirm().length > 0 && this.next() !== this.confirm() ? t('pw.mismatch') : null,
  );

  submit(): void { if (this.canSubmit()) this.done.set(true); }
  back(): void { void this.router.navigate(['/account']); }
}
