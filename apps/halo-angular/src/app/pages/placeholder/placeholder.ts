import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HaloIcon, IconName } from '../../../lib/atoms/icon/icon';
import { SettingsPage } from '../../settings-page';
import { t } from '../../i18n/i18n';
import { TPipe } from '../../i18n/t.pipe';

/**
 * Honest placeholder for menu destinations not yet built (settings, account,
 * follows, notifications, insights, admin). Each route carries its own
 * `{ title, icon }` data, so the menu wiring points at real paths today — when a
 * real screen lands, only its route's `component` swaps; the menu never changes.
 *
 * Wrapped in halo-settings-page (2026-08-29): every route that reaches this is a
 * settings destination, and rendering its own bare chrome meant that on a
 * desktop, choosing "Help & about" from the settings sidebar threw away the
 * sidebar and the app header to show one line of text. A destination inside
 * settings has to stay inside settings.
 */
@Component({
  selector: 'halo-placeholder-page',
  standalone: true,
  imports: [SettingsPage, HaloIcon, TPipe],
  template: `
    <halo-settings-page [title]="title" [activeKey]="key">
      <div class="body">
        <span class="ic"><halo-icon [name]="icon" [size]="30" /></span>
        <p class="h">{{ title }}</p>
        <p class="sub">{{ 'ph.next' | t }}</p>
      </div>
    </halo-settings-page>
  `,
  styles: [`
    :host { display: block; }
    .body {
      display: flex; flex-direction: column; align-items: center; gap: var(--gap-snug);
      // 88px, above the rhythm ladder: a layout dimension that sits this
      // not-yet-built screen's message in the upper-middle of the viewport
      // instead of against the header.
      text-align: center; padding: 88px var(--pad-x) 0;
    }
    .body .ic {
      width: 64px; height: 64px; display: grid; place-items: center;
      border-radius: 20px; color: var(--accent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
    }
    .body .h { margin: var(--space-2) 0 0; font-family: var(--disp); font-weight: 800; font-size: var(--fs-title); }
    .body .sub { margin: 0; font-size: var(--fs-body); color: var(--ink2); }
  `],
})
export class PlaceholderPage {
  private route = inject(ActivatedRoute);

  title = (this.route.snapshot.data['title'] as string) ?? t('ph.comingSoon');
  icon = (this.route.snapshot.data['icon'] as IconName) ?? 'bookmark';
  /** Which sidebar entry to mark, when this route is one of them. */
  key = (this.route.snapshot.data['key'] as string) ?? '';
}
