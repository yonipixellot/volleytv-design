import { Component, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';

/**
 * Header for an X-dismissible full-page destination — Settings and Notification
 * Center, the screens you reach from the app header (avatar / bell) rather than
 * by drilling into a parent. Title left, projected `[slot=actions]` next, then
 * the X as the outermost, rightmost control.
 *
 * One component on purpose (2026-08-26): these two headers were separate
 * look-alike copies that had already drifted apart (different X diameters, icon
 * sizes and paddings). Drill-down sub-pages use `halo-settings-shell` instead —
 * same rhythm, but a back-chevron.
 */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-page-top',
  standalone: true,
  imports: [HaloIcon],
  template: `
    <header class="top">
      <h1>{{ title() }}</h1>
      <ng-content select="[slot=actions]" />
      <button class="x" type="button" [attr.aria-label]="dismissLabel()" (click)="dismiss.emit()">
        <halo-icon name="close" [size]="17" />
      </button>
    </header>
  `,
  styles: [`
    :host { display: block; }

    .top {
      display: flex; align-items: center; gap: var(--gap-snug);
      padding: var(--space-3) var(--pad-x) var(--space-2);
    }
    h1 {
      flex: 1; margin: 0;
      font-family: var(--disp); font-weight: 700; font-size: var(--fs-d-xs);
      text-transform: uppercase; letter-spacing: .01em; color: var(--ink);
    }
    .x {
      flex: none; width: 36px; height: 36px;
      display: grid; place-items: center; cursor: pointer;
      border-radius: 50%; color: var(--ink);
      background: var(--card2); border: 1px solid var(--hair);
    }
  `],
})
export class PageTop {
  title = input('');
  /** Screen-reader label for the X — name what's being dismissed. */
  dismissLabel = input(t('common.close'));
  dismiss = output<void>();
}
