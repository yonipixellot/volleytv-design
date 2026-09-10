import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthShell } from '../../../../lib/layouts/auth-shell/auth-shell';
import { SegmentedToggle } from '../../../../lib/molecules/segmented-toggle/segmented-toggle';
import { FormField } from '../../../../lib/molecules/form-field/form-field';
import { HaloButton } from '../../../../lib/atoms/button/button';
import { SocialButton } from '../../../../lib/molecules/social-button/social-button';
import { AuthEmbed } from '../../../../lib/organisms/auth-embed/auth-embed';
import { TenantConfig } from '../../../tenant';
import { t } from '../../../i18n/i18n';
import { TPipe } from '../../../i18n/t.pipe';

/** Sign in — the identity provider's own page, embedded 1:1 (Maryna
 * 2026-08-27). The email→code front used to be a Halo-styled form here; the
 * real flow hands the whole step to Australian Basketball iD, which we neither
 * restyle nor re-theme, so this route is now a frame around their page.
 *
 * The classic email+password form is kept as the V1 / non-SSO tenant variant,
 * reachable at /auth/sign-in?classic=1. */
@Component({
  selector: 'halo-sign-in-page',
  standalone: true,
  imports: [AuthShell, SegmentedToggle, FormField, HaloButton, SocialButton, AuthEmbed, TPipe],
  templateUrl: './sign-in.html',
  styleUrl: '../auth.scss',
})
export class SignInPage {
  private router = inject(Router, { optional: true });
  private tenant = inject(TenantConfig);
  logoSrc = this.tenant.logoSrc;
  clientName = this.tenant.name;

  /** Brandmark + wordmark — the app header's lockup, Green colorway (for dark
   *  grounds), supplied files verbatim. NOT the boxed HoopsTV_Logo lockup: that
   *  one is itself a plate, and above the provider's card it made the screen a
   *  stack of nested plates (2026-08-27). */
  brandmarkSrc = this.tenant.brandmarkDark;
  wordmarkSrc = this.tenant.wordmarkDark;

  /** DEV: the provider's iframe belongs on this screen — see halo-auth-embed.
   *  Until it lands, their card is a picture: a stand-in, not a sign-in. */
  idpShot = computed(() => this.tenant.idp()?.signInShot ?? '');
  idpCodeShot = computed(() => this.tenant.idp()?.codeShot ?? '');

  /**
   * WHERE IN THE PROVIDER'S ROUND-TRIP the preview is: their page asks for the
   * email, then for the one-time code, and only then redirects back. One
   * picture told half that story — the tap read as a sign-in that never asked
   * for a code, which is not what the user will meet (Maryna 2026-08-30).
   * Two pictures, one tap each, and the second tap is the redirect.
   */
  protected idpStep = signal<'email' | 'code'>('email');
  protected idpShotSrc = computed(() =>
    this.idpStep() === 'code' ? this.idpCodeShot() : this.idpShot());
  // The title above the card names WHOSE page this is, and that does not change
  // between their two steps — mirroring the card's own heading printed "Check
  // your inbox" twice, ten pixels apart. Only the hint moves.
  /** The provider names itself on the screen — from the tenant, not a literal:
   *  a tenant on another IdP would otherwise still read "Australian Basketball
   *  iD" above somebody else's card. */
  protected idpName = computed(() => this.tenant.idp()?.name ?? '');
  /** The SSO screen's copy names the credential the user is about to use: the
   *  IdP where there is one, the operator's own account where there is not. It
   *  was the literal "Hoops TV ID" on a screen kept expressly for other
   *  tenants (Maryna 2026-09-02). */
  protected credentialName = computed(() => this.tenant.idp()?.name ?? `${this.tenant.name()} account`);
  protected idpHint = computed(() =>
    this.idpStep() === 'code' ? t('auth.previewVerify') : t('auth.previewSignIn'));

  /** Which of the three sign-in screens is showing:
   *  · preview — the provider's card, embedded 1:1, tap to sign in;
   *  · sso     — our own email → Hoops TV ID screen (non-provider tenants);
   *  · classic — email + password, the V1 / non-SSO tenant variant.
   *  ?sso=1 / ?classic=1 deep-link straight to one, which is also how the
   *  Storybook stories and journey walkthroughs reach them. */
  /** A deep link, or a stage the user switched to from the screen itself. null
   *  means "whatever this tenant's default is", below. */
  private chosen = signal<'preview' | 'sso' | 'classic' | null>(
    (() => {
      const q = inject(ActivatedRoute, { optional: true })?.snapshot.queryParamMap;
      if (q?.get('classic') === '1') return 'classic';
      return q?.get('sso') === '1' ? 'sso' : null;
    })(),
  );
  /** DERIVED, not initialised once. A tenant with NO IdP has no provider card,
   *  and the preview stage is nothing but that card: it rendered "Sign in with"
   *  naming nobody, above an empty column. Our own email screen is the
   *  documented non-provider path, so that is where such a tenant starts.
   *  Written but never exercised until a second tenant existed, and computing
   *  it once at construction was not enough — the DEV tenant switch swaps the
   *  identity under a page that is already open (Maryna 2026-09-02). */
  protected stage = computed<'preview' | 'sso' | 'classic'>(
    () => this.chosen() ?? (this.tenant.idp() ? 'preview' : 'sso'));
  protected setStage(s: 'preview' | 'sso' | 'classic'): void { this.chosen.set(s); }

  /** Tapping the preview stands in for the entire provider round-trip. Both the
   *  email and the one-time code are entered inside THEIR page, so our
   *  email/code screens are skipped (Maryna 2026-08-27) and the user lands
   *  where the provider's redirect would drop them: the SSO handoff, which
   *  shows the branded "Signed in with Hoops TV ID" screen and then resolves
   *  their teams. */
  enterIdp(): void {
    if (this.idpStep() === 'email') { this.idpStep.set('code'); return; }
    void this.router?.navigate(['/onboarding/sso']);
  }

  /** BA chain for the non-provider path: our screen takes the email, the IdP
   *  mails a code. */
  sso(): void {
    void this.router?.navigate(['/auth/verify-code'], { queryParams: { email: this.ssoEmail().trim() } });
  }

  /** BA-style SSO front: just an email, no password to set up. */
  ssoEmail = signal('');
  ssoValid = computed(() => /.+@.+\..+/.test(this.ssoEmail().trim()));

  modes = [
    { key: 'signin', label: t('auth.signIn') },
    { key: 'signup', label: t('auth.signUp') },
  ];
  mode = signal('signin');

  email = signal('');
  password = signal('');
  showPw = signal(false);
  pwType = computed(() => (this.showPw() ? 'text' : 'password'));
  valid = computed(() => this.email().includes('@') && this.password().length >= 4);

  onMode(m: string) {
    if (m === 'signup') this.router?.navigate(['/auth/sign-up']);
  }
  submit() {
    if (this.valid()) this.router?.navigate(['/home']);
  }
  forgot() {
    this.router?.navigate(['/auth/forgot']);
  }
}
