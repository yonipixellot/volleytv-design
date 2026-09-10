import { Component, input } from '@angular/core';
import { HaloIcon, type IconName } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';

/**
 * Centred empty/cleared state — icon disc, title, supporting line, and an
 * optional CTA projected via ng-content (typically a small halo-button).
 * Replaces the hand-rolled `.empty` / `.fedempty` blocks — fold in as touched.
 */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-empty-state',
  standalone: true,
  imports: [HaloIcon],
  template: `
    <div class="es">
      <span class="disc"><halo-icon [name]="icon()" [size]="22" /></span>
      <p class="t">{{ title() }}</p>
      @if (sub()) { <p class="s">{{ sub() }}</p> }
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .es {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-tight);
      text-align: center;
      padding: var(--space-8) var(--space-6);
    }
    .disc {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--card2);
      border: 1px solid var(--hair);
      color: var(--ink3);
      margin-bottom: var(--space-1);
    }
    .t {
      margin: 0;
      font-family: var(--disp);
      font-weight: 800;
      font-size: var(--fs-title);
      color: var(--ink);
    }
    .s {
      margin: 0 0 var(--space-2);
      font-family: var(--body);
      font-weight: 500;
      font-size: var(--fs-body);
      color: var(--ink2);
      // A reading MEASURE, not a phone-width box. 260px was the narrowest column
      // this ever appeared in, and it wrapped a 367px line into three on a
      // 982px page (Maryna 2026-08-30). In ch, so it tracks the type scale when
      // the accessibility text control resizes it. 46ch keeps a one-line message
      // on one line and still breaks a long one before it becomes unreadable —
      // the longest sub in the app wants 703px on one line, which it should not
      // get.
      max-width: min(100%, 46ch);
      line-height: var(--lh-body);
    }
  `],
})
export class EmptyState {
  icon = input<IconName>('search');
  title = input(t('you.nothingYet'));
  sub = input('');
}
