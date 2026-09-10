import { Component, OnDestroy, computed, effect, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { StatusBar } from '../../../lib/molecules/status-bar/status-bar';
import { PageTop } from '../../../lib/molecules/page-top/page-top';
import { HaloIcon } from '../../../lib/atoms/icon/icon';
import { HaloButton } from '../../../lib/atoms/button/button';
import { NotificationStore, HaloNotification, NotifType } from '../../notification-store';
import { ToastState } from '../../toast-state';
import { t } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

/**
 * Notification center (CM-1417) — the bell's full-page feed, rendered from the
 * HALO notification store (never Braze UI). Grouped Today / Earlier; unread rows
 * carry the accent edge + dot.
 *
 * VISITING marks the feed read (see `readTimer`), so the bell's badge clears by
 * opening this screen rather than by tapping every row. Tapping a row still
 * routes via the record's stored deep-link metadata. "Clear all" empties the
 * feed and offers an undo.
 *
 * No bottom tab dock (2026-08-26) — same family as the Menu sheet and the
 * settings sub-pages: an X-dismissible destination, not a tab peer of
 * Home/Games/You. Showing the dock here blurred that distinction.
 */
@Component({
  selector: 'halo-notification-center-page',
  standalone: true,
  imports: [StatusBar, PageTop, HaloIcon, HaloButton, TPipe],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss',
})
export class NotificationCenterPage implements OnDestroy {
  /**
   * `page` is the phone screen: status bar, title + X, full width.
   * `popover` is the same feed hanging off the header bell from the tablet band
   * up — the page chrome comes off because the popover already has an edge and a
   * way out (click away, Esc). Same component, one feed, so the two can never
   * disagree about what is unread (Maryna 2026-08-29).
   */
  variant = input<'page' | 'popover' | undefined>('page');
  /** Whether the panel is on screen. The popover keeps this component alive
   *  between openings, so this is what tells it a visit has begun. */
  visible = input<boolean | undefined>(true);

  /**
   * Read through these, never through the inputs directly.
   *
   * This component is ALSO a route, and the app runs the router with
   * `withComponentInputBinding()`, which sets every one of a routed component's
   * inputs from the route — passing `undefined` for the ones the route does not
   * carry. That overwrites the declared defaults, so on /notifications `variant`
   * arrived as undefined and the screen rendered the popover's chrome, while
   * `visible` arrived undefined and the timer that clears the bell badge never
   * started (Maryna 2026-08-29).
   */
  protected mode = computed(() => this.variant() ?? 'page');
  protected shown = computed(() => this.visible() ?? true);

  protected store = inject(NotificationStore);
  private router = inject(Router);
  private location = inject(Location);
  private toast = inject(ToastState);

  /**
   * Visiting is what marks the feed read — you should not have to tap every row
   * to silence the bell (Maryna 2026-08-28, and it matches the platform rule
   * that a badge clears after the user visits).
   *
   * The delay is deliberate. Marking on construction would let a mis-tap that
   * bounces straight back out wipe the unread state, and it would also erase the
   * accent dots before the viewer had a chance to see WHICH rows were new. 800ms
   * is long enough to have looked, short enough to feel automatic.
   *
   * Marked wholesale rather than per row scrolled into view: on a long feed,
   * scroll-tracking would leave rows below the fold unread and the badge still
   * showing after a visit, which is the exact complaint this fixes. Wholesale is
   * also what the notification centres people compare us to do (Instagram, X,
   * LinkedIn); scroll-position tracking belongs to chat, where losing your place
   * in a long history actually costs something.
   */
  private readTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Driven by visibility rather than construction. As a page the two are the
    // same moment, but the popover's instance outlives its openings — a timer
    // started in the constructor would have marked the feed read once, at app
    // start, and never again.
    effect(() => {
      clearTimeout(this.readTimer);
      if (this.shown()) this.readTimer = setTimeout(() => this.store.markAllRead(), 800);
    });
  }
  ngOnDestroy(): void { clearTimeout(this.readTimer); }

  /** Bell is a global header action on every tab (Home/Games/You), not a
   *  drill-down from one parent screen — X (not a back-chevron) matches
   *  that, same reasoning as the Menu sheet's close button. */
  close(): void { this.location.back(); }
  /** Recoverable while the toast is up — the app's only other destructive
   *  pattern is delete-account's type-your-email page, far too heavy here. */
  clear(): void {
    this.store.clearAll();
    this.toast.show(t('nc.cleared'), 'neutral', {
      label: t('nc.undo'),
      run: () => this.store.undoClear(),
    });
  }

  open(n: HaloNotification): void {
    this.store.markRead(n.id);
    void this.router.navigate(n.route, n.query ? { queryParams: n.query } : {});
  }

  // 'share' fallback archived 2026-08-26 alongside the 'clip' notification
  // type (notification-store.ts) — restore together.
  // icon(t: NotifType): 'play' | 'games' | 'user' | 'share' {
  //   return t === 'live' ? 'play' : t === 'recap' ? 'games' : t === 'highlight' ? 'user' : 'share';
  // }
  icon(t: NotifType): 'play' | 'games' | 'user' {
    return t === 'live' ? 'play' : t === 'recap' ? 'games' : 'user';
  }
}
