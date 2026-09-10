import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ViewContext } from './view-context';
import { DevBar, DEV_TOOLS_ENABLED } from './dev-bar/dev-bar';
import { UpgradeState, PREMIUM_PLANS } from './upgrade-state';
import { ShareState } from './share-state';
import { PremiumSheet } from '../lib/organisms/premium-sheet/premium-sheet';
import { ShareSheet } from '../lib/organisms/share-sheet/share-sheet';
import { HaloToasts } from '../lib/organisms/toasts/toasts';
import { ToastState } from './toast-state';
import { A11yPrefs } from './a11y-prefs';
import { A11yFab, A11yPanel } from '../lib/organisms/a11y-panel/a11y-panel';
import { HaloIcon } from '../lib/atoms/icon/icon';
import { Splash } from './splash/splash';
import { AppTopBar } from './app-top-bar';
import { TenantConfig } from './tenant';
import { TPipe } from './i18n/t.pipe';
import { keepLangInUrl, LANG, LANG_DEF, LANGS, setLang, type Lang } from './i18n/i18n';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevBar, PremiumSheet, ShareSheet, HaloToasts, A11yFab, A11yPanel, Splash, HaloIcon, AppTopBar, TPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected vc = inject(ViewContext);
  /** Who this deployment is — the shell's data-skin comes from here, not a
   *  literal, so a re-skin is one object rather than a search-and-replace. */
  protected tenant = inject(TenantConfig);
  protected upgrade = inject(UpgradeState);
  protected share = inject(ShareState);
  protected toast = inject(ToastState);
  protected a11y = inject(A11yPrefs);
  protected plans = PREMIUM_PLANS;
  private router = inject(Router);
  protected readonly langs = LANGS;
  protected readonly lang = LANG;
  protected readonly langDef = LANG_DEF;
  protected onLang(e: Event): void { setLang((e.target as HTMLSelectElement).value as Lang); }

  /** Dev bar visibility — gated by the master flag, toggled with ⌘/Ctrl+Shift+0
      so it can be hidden for a clean demo and brought back on demand. */
  protected showDevBar = signal(DEV_TOOLS_ENABLED);

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(e: KeyboardEvent): void {
    if (!DEV_TOOLS_ENABLED) return;
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'Digit0') {
      e.preventDefault();
      this.showDevBar.update((v) => !v);
    }
  }

  // Pre-auth surfaces carry the accessibility fab (PT AccessibilityFab rule:
  // anonymous viewers have no menu; signed-in users reach prefs via Menu).
  private url = signal(this.router.url);
  protected preAuth = computed(() => /^\/(auth|get-started|onboarding|invite)/.test(this.url()));
  /** Marks the shell `.dhome` on the Home route so shell-level, desktop-only
      styling (`:host-context(.dhome)` across the card rails, ad slot, hero,
      section headers, status bar, etc.) can key off it even though those
      surfaces render inside `<router-outlet>`, not as a descendant of any
      single component that "knows" it's on Home (Maryna 2026-08-25). */
  protected isDesktopHomeRoute = computed(() => /^\/(home)?$/.test(this.url()));

  /**
   * The shell's own header, for the routes that carry none of their own.
   *
   * Home, Games and You render `halo-app-top-bar` themselves, and every screen
   * under the settings shell projects one into its topbar slot. That left the
   * drill-downs — a game, a team, a "See all" lane, the settings panel, the
   * notification feed, upgrade — showing a bare back chevron once the dock goes
   * at 1024, with no wordmark and no way to reach another tab. Maryna rejected
   * exactly that on the settings screens: the header is the same on every page.
   *
   * The players carry it too, since 2026-08-30. They used to be excluded on the
   * grounds that a header over a full-bleed video is chrome on top of content —
   * true of a phone, wrong of the web. On desktop a video lives INSIDE the site:
   * YouTube keeps its masthead, Twitch keeps its nav, and only fullscreen takes
   * the screen. Excluding them left /watch as the one route with no way out but
   * a floating close button, which is a mobile affordance the web does not need
   * (Maryna 2026-08-30). Fullscreen still hides everything: it is a --z-sheet
   * overlay and the header is --z-header, so it paints over it.
   *
   * Still not the pre-auth flows: the auth shell has its own.
   */
  protected showShellHeader = computed(() =>
    /^\/(game|team|events|notifications|upgrade|watch)(\/|\?|$)/.test(this.url()) ||
    /^\/settings(\?|$)/.test(this.url()));

  constructor() {
    this.router.events.subscribe((e) => {
      if (!(e instanceof NavigationEnd)) return;
      this.url.set(e.urlAfterRedirects);
      // The chosen language rides along in the URL (see i18n.ts keepLangInUrl).
      keepLangInUrl();
    });
  }

  // The identity/plan/nav wiring that used to feed the menu sheet from here
  // moved to SettingsPage (2026-08-26) along with the screen itself.

  /** Premium sheet → checkout: route to /upgrade with the chosen package. */
  protected onUnlock(planId: string): void {
    this.upgrade.close();
    this.router.navigate(['/upgrade'], { queryParams: { pkg: planId } });
  }
}
