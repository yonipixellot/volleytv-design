import { Component, inject, input, output } from '@angular/core';
import { Location } from '@angular/common';
import { StatusBar } from '../../molecules/status-bar/status-bar';
import { HaloIcon } from '../../atoms/icon/icon';
import { TPipe } from '../../../app/i18n/t.pipe';

export interface SettingsNavItem { key: string; label: string; path: string; }

/**
 * Shell for the menu / settings sub-screens (Account, Notifications, Following,
 * Subscription, Coach admin, Change-password, Delete-account). Status bar + a
 * circular back button + title header (the app's standing sub-page pattern,
 * lifted from PlaceholderPage), then a scrollable content column projected in.
 *
 * The back button emits `back` and, unless `[autoBack]="false"`, also runs
 * `Location.back()` — so a plain page gets history navigation for free while a
 * page that must route somewhere specific opts out and handles `(back)` itself.
 * Pass a `[title]`; project actions into `[slot=action]` for a right-aligned
 * header control.
 */
@Component({
  selector: 'halo-settings-shell',
  standalone: true,
  imports: [StatusBar, HaloIcon, TPipe],
  // `title` is both this component's input AND a native HTML attribute, so a
  // static `title="Account & profile"` in a page template sets the input and
  // ALSO leaves the attribute on the element — the browser then shows it as a
  // tooltip on hover, which is where the stray grey label in the corner of the
  // settings screens was coming from. Stripping the attribute keeps the input
  // name, which reads better at every call site than `heading` would.
  host: { '[attr.title]': 'null' },
  template: `
    <div class="halo-page set" [class.set--two]="navItems().length">
      <!-- Desktop chrome. Projected rather than built here so this layout stays a
           pure lib component with a story: the app supplies its own top bar. -->
      <div class="set-top"><ng-content select="[slot=topbar]" /></div>

      <halo-status-bar />

      <div class="set-cols">
        @if (navItems().length) {
          <!-- Sidebar, from the tablet-landscape band up. Below it the back
               button is the way out and this would eat the column the form needs. -->
          <nav class="set-nav" [attr.aria-label]="'shell.settings' | t">
            @for (it of navItems(); track it.key) {
              <button class="sn" type="button"
                [class.on]="it.key === activeKey()"
                [attr.aria-current]="it.key === activeKey() ? 'page' : null"
                (click)="navSelect.emit(it.path)">{{ it.label }}</button>
            }
          </nav>
        }

        <div class="set-main">
          <header class="top">
            <!-- Hidden from the two-pane band up: the sidebar says where you are
                 and the app header is still there, so a back button would be a
                 third way to leave one screen. -->
            <button class="back" type="button" [attr.aria-label]="'common.back' | t" (click)="onBack()">
              <halo-icon name="chevron-left" [size]="16" />
            </button>
            <h1>{{ title() }}</h1>
            <span class="action"><ng-content select="[slot=action]" /></span>
          </header>
          <div class="body">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './settings-shell.scss',
})
export class SettingsShell {
  private location = inject(Location);

  title = input('');
  /** Sidebar destinations. Empty (the default) renders no sidebar, which is what
   *  every width below the two-pane band gets. */
  navItems = input<SettingsNavItem[]>([]);
  /** Key of the section being shown, so the sidebar can mark it. */
  activeKey = input('');
  /** A sidebar entry was chosen. Emits its `path`; the app routes. */
  navSelect = output<string>();
  /** When true (default) the back button also pops browser history. Set false
      on pages that route to a specific parent via `(back)`. */
  autoBack = input(true);
  back = output<void>();

  protected onBack(): void {
    this.back.emit();
    if (this.autoBack()) this.location.back();
  }
}
