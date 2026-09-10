import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsPanel } from '../lib/organisms/settings-panel/settings-panel';
import { ViewContext } from './view-context';
import { A11yPrefs } from './a11y-prefs';
import { AccountView } from './account-view';
import { HeaderMenuState } from './header-menu-state';
import { LANG_DEF } from './i18n/i18n';
import { previewSignOut } from '../preview-gate/gate';

/**
 * Account & settings as the header avatar's popover — the same organism the
 * /settings screen renders, in its `popover` variant.
 *
 * Deliberately the SAME component and the same rows as the screen. An account
 * menu that shows a shortened list is a second place to forget to add a
 * setting, and the user then has to learn which of the two has the one they
 * want. Here there is one list with two shapes.
 *
 * Smart on purpose (it injects ViewContext and the router) so the three pages
 * that carry the header project it as a bare `<halo-account-menu slot-menu />`
 * with no inputs to keep in step across three templates.
 */
@Component({
  selector: 'halo-account-menu',
  standalone: true,
  imports: [SettingsPanel],
  template: `
    <halo-settings-panel
      variant="popover"
      [visible]="menu.isOpen('account')"
      [name]="acct.name()"
      [sub]="acct.sub()"
      [personaLabel]="acct.personaLabel()"
      [avatarSrc]="acct.avatarSrc()"
      [planLabel]="acct.planLabel()"
      [language]="langName"
      [theme]="vc.theme()"
      [isCoach]="vc.caps().isCoach"
      (navigate)="go($event)"
      (toggleTheme)="toggleTheme()"
      (openA11y)="openA11y()"
      (signOut)="signOut()"
    />
  `,
})
export class AccountMenu {
  protected readonly langName = LANG_DEF.native;
  protected vc = inject(ViewContext);
  protected acct = inject(AccountView);
  private a11y = inject(A11yPrefs);
  protected menu = inject(HeaderMenuState);
  private router = inject(Router);

  /** Every row closes the menu, theme included. Leaving it open for the one
   *  in-place toggle looked defensible on paper — you see the change without
   *  losing your place — but in the hand it is the single row that behaves
   *  unlike its seven neighbours, and the whole app recolouring behind a menu
   *  that stays put is a stranger way to show the change than simply showing
   *  the app. Consistency wins; reopening to switch back is one click. */
  protected toggleTheme(): void { this.vc.toggleTheme(); this.menu.close(); }

  protected go(path: string): void {
    this.menu.close();
    void this.router.navigateByUrl('/' + path);
  }
  protected openA11y(): void { this.menu.close(); this.a11y.open(); }
  protected signOut(): void { this.menu.close(); void previewSignOut().then(() => this.router.navigate(['/auth/sign-in'])); }
}
