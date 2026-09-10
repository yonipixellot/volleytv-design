import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../lib/layouts/auth-shell/auth-shell';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { TenantConfig } from '../../../tenant';
import { t, plural } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

const CODE_LEN = 6;
const CODE_TTL = 300;      // 5:00 — BA reference
const RESEND_COOLDOWN = 30;
const LOCK_TTL = 300;      // wrong ×3 → locked 5:00 — BA reference
const MAX_ATTEMPTS = 3;
/** PREVIEW: any complete code succeeds EXCEPT this one (demos error + lockout). */
const FAIL_CODE = '000000';

/**
 * Verify code — the BA-PT OTP screen for the Hoops TV ID (SSO) path:
 * the IdP emails a 6-digit code; Halo never sees a password. Six boxes with
 * paste + auto-advance, code TTL countdown, resend cooldown, edit-email
 * escape. Verified → the SSO handoff → onboarding (BA: /auth/verify →
 * /auth/handoff → /onboarding/start).
 */
@Component({
  selector: 'halo-verify-code-page',
  standalone: true,
  imports: [AuthShell, HaloButton, HaloIcon, TPipe],
  templateUrl: './verify-code.html',
  styleUrls: ['../auth.scss', './verify-code.scss'],
})
export class VerifyCodePage implements OnDestroy {
  protected readonly plural = plural;
  private router = inject(Router, { optional: true });
  private tenant = inject(TenantConfig);
  logoSrc = this.tenant.logoSrc;
  clientName = this.tenant.name;

  /** ?email= from the sign-in screen (shown masked, BA-style). */
  email = input('you@example.com');
  protected masked = computed(() => {
    // Router input binding sets undefined when ?email= is absent (direct visit / refresh):
    // guard, or the throw aborts rendering and the Verify/Resend labels vanish (a11y audit G10).
    const email = this.email() ?? '';
    const [u, d] = email.split('@');
    return u && d ? `${u[0]}•••@${d}` : (email || t('auth.yourEmail'));
  });

  digits = signal<string[]>(Array(CODE_LEN).fill(''));
  ttl = signal(CODE_TTL);
  resendIn = signal(RESEND_COOLDOWN);
  verifying = signal(false);
  attempts = signal(0);
  lockSecs = signal(0);
  wrong = signal(false);

  protected locked = computed(() => this.lockSecs() > 0);
  protected lockMmss = computed(() => {
    const s = this.lockSecs();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });
  protected expired = computed(() => this.ttl() <= 0);
  protected complete = computed(() => this.digits().every((d) => d !== ''));
  protected mmss = computed(() => {
    const s = Math.max(0, this.ttl());
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });
  protected resendLabel = computed(() =>
    this.resendIn() > 0 ? `${t('auth.resendCode')} · 0:${String(this.resendIn()).padStart(2, '0')}` : t('auth.resendCode'));

  private tick = setInterval(() => {
    this.ttl.update((v) => (v > 0 ? v - 1 : 0));
    this.resendIn.update((v) => (v > 0 ? v - 1 : 0));
    this.lockSecs.update((v) => {
      if (v === 1) { // lockout over — clean slate (BA: attempts reset, code cleared)
        this.attempts.set(0);
        this.wrong.set(false);
        this.digits.set(Array(CODE_LEN).fill(''));
      }
      return v > 0 ? v - 1 : 0;
    });
  }, 1000);

  onInput(i: number, ev: Event): void {
    this.wrong.set(false);
    const el = ev.target as HTMLInputElement;
    const raw = el.value.replace(/\D/g, '');
    const next = [...this.digits()];
    if (raw.length > 1) {
      // paste: distribute from this box
      for (let k = 0; k < raw.length && i + k < CODE_LEN; k++) next[i + k] = raw[k];
      this.digits.set(next);
      this.focusBox(Math.min(i + raw.length, CODE_LEN - 1));
    } else {
      next[i] = raw;
      this.digits.set(next);
      if (raw && i < CODE_LEN - 1) this.focusBox(i + 1);
    }
    el.value = next[i];
  }

  onKeydown(i: number, ev: KeyboardEvent): void {
    if (ev.key === 'Backspace' && !this.digits()[i] && i > 0) this.focusBox(i - 1);
  }

  private focusBox(i: number): void {
    const el = document.querySelectorAll<HTMLInputElement>('.otp input')[i];
    el?.focus(); el?.select();
  }

  verify(): void {
    if (!this.complete() || this.expired() || this.verifying() || this.locked()) return;
    // demo: the IdP accepts any complete code EXCEPT 000000 (error → lockout)
    if (this.digits().join('') === FAIL_CODE) {
      const n = this.attempts() + 1;
      this.attempts.set(n);
      this.wrong.set(true);
      if (n >= MAX_ATTEMPTS) this.lockSecs.set(LOCK_TTL);
      else this.digits.set(Array(CODE_LEN).fill(''));
      return;
    }
    this.verifying.set(true);
    setTimeout(() => { void this.router?.navigate(['/onboarding/sso']); }, 650);
  }

  resend(): void {
    if (this.resendIn() > 0 || this.locked()) return;
    this.ttl.set(CODE_TTL);
    this.resendIn.set(RESEND_COOLDOWN);
    this.digits.set(Array(CODE_LEN).fill(''));
    this.wrong.set(false);
    this.focusBox(0);
  }

  editEmail(): void { void this.router?.navigate(['/auth/sign-in']); }

  ngOnDestroy(): void { clearInterval(this.tick); }
}
