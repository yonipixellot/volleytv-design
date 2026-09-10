import { Component } from '@angular/core';
import { SettingsPage } from '../../../settings-page';
import { HaloIcon } from '../../../../lib/atoms/icon/icon';
import { TPipe } from '../../../i18n/t.pipe';
import { LANG, LANGS, setLang, type Lang } from '../../../i18n/i18n';

/**
 * Language (phone screen). The header popover swaps its own pane for this list
 * (settings-panel.ts); the phone's settings screen has no pane to swap, so the
 * Language row drills into this route instead. Same list, same behaviour:
 * pick a language, the app persists it and reloads in that language.
 */
@Component({
  selector: 'halo-language-page',
  standalone: true,
  imports: [SettingsPage, HaloIcon, TPipe],
  template: `
    <halo-settings-page activeKey="lang" [title]="'lang.nav' | t">
      <nav class="rows" [attr.aria-label]="'lang.nav' | t">
        @for (l of langs; track l.code) {
          <button class="row" type="button" [attr.lang]="l.code"
            [attr.aria-current]="l.code === lang ? 'true' : null" (click)="pick(l.code)">
            <span class="tx"><span class="lb">{{ l.native }}</span></span>
            <span class="ck"><halo-icon name="check" [size]="16" [strokeWidth]="3" /></span>
          </button>
        }
      </nav>
      <p class="note">{{ 'lang.note' | t }}</p>
    </halo-settings-page>
  `,
  styleUrls: ['../settings-common.scss'],
  styles: [`
    .rows { display: flex; flex-direction: column; gap: var(--gap-snug); }
    .row {
      display: flex; align-items: center; gap: var(--gap-loose); width: 100%;
      padding: var(--pad-card-sm) var(--pad-card); border-radius: var(--r-card-sm);
      background: var(--card); border: 1px solid var(--hair); color: inherit;
      font: inherit; text-align: start; cursor: pointer;
    }
    .row[aria-current] { border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
    .row .tx { flex: 1; min-width: 0; }
    .row .lb { font-weight: 700; font-size: var(--fs-body-lg); color: var(--ink); }
    .row .ck { flex: none; display: grid; place-items: center; color: var(--accent); }
    .row:not([aria-current]) .ck { visibility: hidden; }
  `],
})
export class LanguagePage {
  protected readonly langs = LANGS;
  protected readonly lang = LANG;
  protected pick(code: Lang): void { setLang(code); }
}
