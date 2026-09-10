import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ViewContext } from './view-context';
import { UpgradeState } from './upgrade-state';

/**
 * Drives bottom-tab navigation from a BottomNav `(select)` event.
 * Router is optional so the page components that use it still render in
 * Storybook (which provides no router) — there `go()` simply no-ops.
 *
 * Entitlement gate: the "You" tab is Premium/Basic-only. On Free it doesn't
 * navigate — it raises the upgrade sheet instead (the tab renders locked).
 */
@Injectable({ providedIn: 'root' })
export class TabNav {
  private router = inject(Router, { optional: true });
  private vc = inject(ViewContext);
  private upgrade = inject(UpgradeState);

  go(key: string): void {
    if (key === 'you' && this.vc.tier() === 'free') {
      this.upgrade.open();
      return;
    }
    this.router?.navigate(['/', key]);
  }
}
