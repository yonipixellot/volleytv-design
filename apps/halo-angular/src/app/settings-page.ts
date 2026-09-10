import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsShell, SettingsNavItem } from '../lib/layouts/settings-shell/settings-shell';
import { settingsSections } from '../lib/organisms/settings-panel/settings-sections';
import { AppTopBar } from './app-top-bar';
import { ViewContext } from './view-context';
import { LANG_DEF } from './i18n/i18n';

/**
 * A settings sub-screen, wired.
 *
 * `halo-settings-shell` stays a pure lib layout with a story; everything that
 * needs the app — the top bar, the sidebar's contents, the active section and
 * the routing — is supplied here, once, for all seven sub-screens.
 *
 * The sidebar is built from `settingsSections()`, the same list the phone screen
 * and the header popover read, filtered to the rows that are actually a
 * destination.
 *
 * Two kinds of row are excluded, for one reason: a row that resolves in place is
 * not a place. Theme and Accessibility act on the spot (no `path`), and Language
 * opens a pane inside the menu (`submenu`) rather than leaving for a screen — it
 * keeps a route only so the phone's settings screen has somewhere to send you
 * (Maryna 2026-08-29).
 */
@Component({
  selector: 'halo-settings-page',
  standalone: true,
  imports: [SettingsShell, AppTopBar],
  // `title` is both this component's input AND a native HTML attribute, so a
  // static `title="Account & profile"` in a page template sets the input and
  // ALSO leaves the attribute on the element — the browser then shows it as a
  // tooltip on hover, which is where the stray grey label in the corner of the
  // settings screens was coming from. Stripping the attribute keeps the input
  // name, which reads better at every call site than `heading` would.
  host: { '[attr.title]': 'null' },
  template: `
    <halo-settings-shell
      [title]="title()" [autoBack]="autoBack()"
      [navItems]="navItems()" [activeKey]="activeKey()"
      (navSelect)="go($event)" (back)="back.emit()">
      <halo-app-top-bar slot="topbar" />
      <ng-content />
    </halo-settings-shell>
  `,
  styles: [':host { display: block; }'],
})
export class SettingsPage {
  private router = inject(Router);
  private vc = inject(ViewContext);

  title = input('');
  autoBack = input(true);
  /** Which sidebar entry to mark, by its row key ('profile', 'follows', …). */
  activeKey = input('');
  back = output<void>();

  protected navItems = computed<SettingsNavItem[]>(() =>
    settingsSections({ isCoach: this.vc.caps().isCoach, theme: this.vc.theme(), language: LANG_DEF.native })
      .flatMap((s) => s.rows)
      .filter((r) => !!r.path && !r.submenu)
      .map((r) => ({ key: r.key, label: r.label, path: r.path! })),
  );

  /** navigateByUrl, not navigate(['/', path]): a multi-segment path like
   *  'settings/notifications' is treated as ONE literal segment by the array
   *  form, missing every route and falling through to the wildcard redirect. */
  protected go(path: string): void { void this.router.navigateByUrl('/' + path); }
}
