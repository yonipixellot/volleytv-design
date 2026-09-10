import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsPanel } from '../../../lib/organisms/settings-panel/settings-panel';
import { ViewContext } from '../../view-context';
import { A11yPrefs } from '../../a11y-prefs';
import { AccountView } from '../../account-view';
import { LANG_DEF } from '../../i18n/i18n';
import { previewSignOut } from '../../../preview-gate/gate';

/**
 * Account & settings — the app header avatar's destination. A route, not an overlay
 * (2026-08-26): same family as Notification Center, so it renders in the page
 * region with the status bar and dev bar intact, arrives with no animation of
 * its own, and dismisses with X → history back.
 *
 * Holds the app wiring (persona-shaped identity, theme toggle, a11y panel,
 * sign out); the presentation lives in the `halo-settings-panel` organism.
 */
@Component({
  selector: 'halo-settings-page',
  standalone: true,
  imports: [SettingsPanel],
  template: `
    <halo-settings-panel
      [name]="acct.name()"
      [sub]="acct.sub()"
      [personaLabel]="acct.personaLabel()"
      [avatarSrc]="acct.avatarSrc()"
      [planLabel]="acct.planLabel()"
      [language]="langName"
      [theme]="vc.theme()"
      [isCoach]="vc.caps().isCoach"
      (close)="close()"
      (navigate)="go($event)"
      (toggleTheme)="vc.toggleTheme()"
      (openA11y)="a11y.open()"
      (signOut)="signOut()"
    />
  `,
  // No wide layout on purpose: this is a list of settings ROWS, and a row
  // stretched past a readable measure puts its label at one end of the screen
  // and its chevron at the other. From the tablet band up the same list is also
  // the header popover, so the route is the deep-link fallback rather than the
  // main way in (Maryna 2026-08-29).
  styles: [':host { display: flex; flex-direction: column; flex: 1 0 auto; min-width: 0; }'],
})
export class SettingsPage {
  protected readonly langName = LANG_DEF.native;
  protected vc = inject(ViewContext);
  protected a11y = inject(A11yPrefs);
  /** Shared with the header popover so the two can never show a different you. */
  protected acct = inject(AccountView);
  private router = inject(Router);
  private location = inject(Location);

  /** The avatar is a global header action on every tab, not a drill-down from
   *  one parent screen — X + history back, same reasoning as the bell's feed. */
  protected close(): void { this.location.back(); }

  /** `navigate(['/', path])` treats a multi-segment path ('settings/notifications')
   *  as one literal segment, missing every route and falling through to the
   *  wildcard redirect (a silent flash back to Home) — navigateByUrl parses the
   *  full path string correctly regardless of depth (Yuval 2026-08-26). */
  protected go(path: string): void {
    void this.router.navigateByUrl('/' + path);
  }
  protected signOut(): void {
    void previewSignOut().then(() => this.router.navigate(['/auth/sign-in']));
  }
}
