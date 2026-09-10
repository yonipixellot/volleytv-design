import { Component, DestroyRef, ElementRef, computed, inject, input } from '@angular/core';
import { AppHeader } from '../lib/organisms/app-header/app-header';
import type { NavItem } from '../lib/organisms/bottom-nav/bottom-nav';
import { NotificationStore } from './notification-store';
import { NotificationCenterPage } from './pages/notifications/notification-center';
import { AccountMenu } from './account-menu';
import { HeaderMenuState } from './header-menu-state';
import { AccountView } from './account-view';
import { ViewContext } from './view-context';
import { TabNav } from './tab-nav';
import { t } from './i18n/i18n';

/**
 * The app's top bar, wired.
 *
 * `halo-app-header` stays a pure organism (it renders in Storybook and knows
 * nothing about personas). Everything that has to be plugged into it — the
 * unread count, the identity, the entitlement-gated tab set and the two
 * popovers — lives here, once.
 *
 * It exists because the wiring was copied into Home, Games and You, and adding
 * the settings sub-pages would have made a fourth copy. It also closes a gap
 * that duplication had already opened: only Home was passing `navItems`, so
 * from 1280 up Games and You had no inline nav at all and no way out but the
 * wordmark (Maryna 2026-08-29).
 */
@Component({
  selector: 'halo-app-top-bar',
  standalone: true,
  imports: [AppHeader, NotificationCenterPage, AccountMenu],
  template: `
    <halo-app-header
      [unread]="notifs.unread()"
      [avatarSrc]="acct.avatarSrc()"
      [initials]="initials()"
      [navItems]="headerNavItems()"
      [activeNav]="activeNav()"
      [menuOpen]="hmenu.isOpen('account')"
      [notifOpen]="hmenu.isOpen('notifications')"
      (navSelect)="tabNav.go($event)"
      (menu)="hmenu.trigger('account')"
      (menuClose)="hmenu.close()"
      (bell)="hmenu.trigger('notifications')"
      (notifClose)="hmenu.close()"
      (home)="tabNav.go('home')"
    >
      <halo-notification-center-page slot-notifications
        variant="popover" [visible]="hmenu.isOpen('notifications')" />
      <halo-account-menu slot-menu />
    </halo-app-header>
  `,
  styles: [':host { display: block; }'],
})
export class AppTopBar {
  /** Key of the current tab, e.g. 'home'. Empty on screens that are not a tab. */
  activeNav = input('');

  protected vc = inject(ViewContext);
  protected acct = inject(AccountView);
  protected notifs = inject(NotificationStore);
  protected hmenu = inject(HeaderMenuState);
  protected tabNav = inject(TabNav);

  /**
   * Publishes the bar's measured height as --topbar-h, the same contract the DEV
   * bar has with --devbar-h. Anything that pins itself below the header can then
   * be exact in both states instead of guessing: the Games date panel sticks at
   * devbar + topbar and is exactly that much shorter than the viewport.
   *
   * Measured rather than declared because the bar's height moves with the a11y
   * text scale and with whatever the tenant's lockup turns out to be.
   */
  constructor() {
    const el = inject(ElementRef).nativeElement as HTMLElement;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty('--topbar-h', `${Math.round(el.getBoundingClientRect().height)}px`);

    // Same three triggers as the dev bar: the observer for content changes, the
    // timeout for first paint, and resize for viewport changes — a hidden or
    // backgrounded tab does not run the rendering loop the observer depends on.
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    const first = setTimeout(publish);
    window.addEventListener('resize', publish);

    inject(DestroyRef).onDestroy(() => {
      ro.disconnect();
      clearTimeout(first);
      window.removeEventListener('resize', publish);
      root.style.removeProperty('--topbar-h');
    });
  }

  protected initials = computed(() => (this.vc.caps().isFan ? 'GV' : 'TW'));

  /** You: locked on Free (athlete metrics are Basic+), gone for fans. Home is
   *  absent on purpose — up here the wordmark is already the way back, so a Home
   *  tab beside it is a second control for one destination. */
  protected headerNavItems = computed<NavItem[]>(() => [
    { key: 'games', label: t('nav.games'), icon: 'games' },
    ...(this.vc.caps().isFan ? [] : [{ key: 'you', label: t('nav.you'), icon: 'user' as const, locked: this.vc.tier() === 'free' }]),
  ]);
}
