import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

/** The two panels the top bar can open. */
export type HeaderMenu = 'account' | 'notifications';

/** Below this they are screens; from here up they are popovers. */
const POPOVER_FROM = 768;

const ROUTE: Record<HeaderMenu, string> = {
  account: '/settings',
  notifications: '/notifications',
};

/**
 * Where the top bar's two panels open, which is a function of the screen.
 *
 * On a phone they stay what they have always been: routed screens, full width,
 * dismissed with X. Those decisions (2026-08-26, pages rather than fixed
 * overlays) are not undone here — a popover on a 375px screen is a full-screen
 * sheet wearing a card's clothes, and it would sit under the dev bar again.
 *
 * From the tablet band up each trigger is a small control in a wide bar with
 * empty space beside it, and the conventional answer is a panel hanging off it.
 * Sending either one to a whole screen throws away the page the user was on.
 *
 * ONE service for both, so they are mutually exclusive by construction: two
 * panels hanging off the same bar at once is two things claiming to be the
 * thing you just opened (Maryna 2026-08-29).
 */
@Injectable({ providedIn: 'root' })
export class HeaderMenuState {
  private router = inject(Router);
  private opened = signal<HeaderMenu | null>(null);

  readonly which = this.opened.asReadonly();
  isOpen(m: HeaderMenu): boolean { return this.opened() === m; }

  private wide(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= POPOVER_FROM;
  }

  constructor() {
    // Crossing the band with one open would leave a popover pinned to a header
    // that no longer has room for it.
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (this.opened() && !this.wide()) this.opened.set(null);
      });
    }
  }

  /** A trigger in the bar was pressed. */
  trigger(m: HeaderMenu): void {
    if (this.wide()) { this.opened.update((v) => (v === m ? null : m)); return; }
    this.opened.set(null);
    void this.router.navigate([ROUTE[m]]);
  }

  close(): void { this.opened.set(null); }
}
