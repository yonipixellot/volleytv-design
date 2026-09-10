import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { A11yPrefs } from '../a11y-prefs';
import { t } from '../i18n/i18n';
import { TPipe } from '../i18n/t.pipe';
import { VOLLEY_BALL_SEAMS } from '../../lib/brand/volleytv-preset';

const SEEN_KEY = 'halo:splash-seen';

/**
 * Splash — the Volley TV lockup: the card drops in and settles (CSS, no Lottie
 * player, so nothing is fetched and the initial bundle stays lean), the credit
 * fades in under it. Plays once per session; any tap skips; reduced-motion shows
 * the still lockup for a beat instead of the entrance.
 */
@Component({
  selector: 'halo-splash',
  standalone: true,
  imports: [TPipe],
  template: `
    @if (visible()) {
      <div class="splash" [class.leaving]="leaving()" (click)="dismiss()" role="presentation">
        <!-- The lockup card built from its parts so each can move: the card settles,
             the ball serves in from above and lands with a squash, the wordmark wipes
             on, the tagline fades. Same geometry as VolleyTV_Logo.svg (120×143 → 150×179).
             Reduced motion: everything sits in its final place (V4, 2026-09-08). -->
        <div class="lockup" [class.enter]="!reduced" aria-hidden="true">
          <svg class="ball" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#ff6b35" />
            <path [attr.d]="seams" fill="none" stroke="#0b1a22" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="50" cy="50" r="43.4" fill="none" stroke="#0b1a22" stroke-width="5.2" />
            <ellipse cx="33" cy="30" rx="12" ry="7" transform="rotate(-32 33 30)" fill="#fff" opacity=".26" />
          </svg>
          <img class="wm" src="img/brand/VolleyTV_Wordmark_Coral.svg" alt="" />
          <span class="tag">VOLLEYBALL · LIVE</span>
        </div>
        <div class="credit" [class.on]="creditOn()">
          <span class="by">{{ 'splash.by' | t }}</span>
          <span class="vendor">Pixellot</span>
        </div>
      </div>
    }
  `,
  styleUrl: './splash.scss',
})
export class Splash implements AfterViewInit, OnDestroy {
  private a11y = inject(A11yPrefs);
  private router = inject(Router, { optional: true });
  private timers: ReturnType<typeof setTimeout>[] = [];

  reduced = false;
  protected seams = VOLLEY_BALL_SEAMS;
  visible = signal(false);
  leaving = signal(false);
  creditOn = signal(false);
  /** Boot wants the splash, but the viewport is desktop — redirect to login
      without playing it (splash is a mobile-only experience, Yuval 2026-08-23). */
  private bootRedirectOnly = false;

  constructor() {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch { /* private mode */ }
    // ?splash=1 forces a replay (design review convenience)
    const force = typeof location !== 'undefined' && location.search.includes('splash=1');
    const wantSplash = force || !seen;
    // Mobile-only: the lockup animation is authored for a phone canvas; on a
    // desktop-width viewport its slice-scaled artwork blows up full-screen.
    const isMobile = typeof matchMedia === 'undefined' || matchMedia('(max-width: 767px)').matches;
    this.visible.set(wantSplash && isMobile);
    this.bootRedirectOnly = wantSplash && !isMobile;
    this.reduced =
      this.a11y.motion() === 'reduce' ||
      (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  ngAfterViewInit(): void {
    if (!this.visible()) {
      // Desktop boot: keep the login-first landing, just skip the animation.
      if (this.bootRedirectOnly) {
        try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode */ }
        if (this.router && !this.router.url.startsWith('/auth')) void this.router.navigate(['/auth/sign-in']);
      }
      return;
    }
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode */ }
    if (this.reduced) {
      // static lockup: credit immediately, gone after a beat
      this.creditOn.set(true);
      this.timers.push(setTimeout(() => this.dismiss(), 1400));
      return;
    }
    // entrance is CSS (see splash.scss); credit follows the settle, then out
    this.timers.push(setTimeout(() => this.creditOn.set(true), 1500));
    this.timers.push(setTimeout(() => { if (this.visible() && !this.leaving()) this.dismiss(); }, 3600));
  }

  dismiss(): void {
    if (this.leaving()) return;
    this.leaving.set(true);
    // App boot lands on the login page (Yoni 2026-08-22) — the sign-in screen
    // is revealed under the fading splash. Already-auth routes stay put.
    if (!this.router?.url.startsWith('/auth')) {
      void this.router?.navigate(['/auth/sign-in']);
    }
    this.timers.push(setTimeout(() => this.visible.set(false), 380));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
  }
}
