import { Component, input, output } from '@angular/core';
import { PremiumTicket } from '../../molecules/premium-ticket/premium-ticket';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * BlurLock — lock-don't-hide wrapper for premium content. When `locked`, the
 * projected content renders blurred + inert behind the app's premium-ticket
 * gate (tap Unlock → `upgrade`). When unlocked it's a transparent pass-through.
 * Blurring the real content (not hiding it) is what drives the upsell.
 * Pure organism — the caller decides `locked` from tier.
 */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-blur-lock',
  standalone: true,
  imports: [PremiumTicket, TPipe],
  template: `
    <div class="bl" [class.locked]="locked()">
      <div class="bl-body"><ng-content /></div>
      @if (locked()) {
        <div class="bl-over">
          <halo-premium-ticket [title]="title()" [meta]="note()" [cta]="'common.upgrade' | t" (unlock)="upgrade.emit()" />
        </div>
      }
    </div>
  `,
  styleUrl: './blur-lock.scss',
})
export class BlurLock {
  locked = input(false);
  title = input(t('common.premium'));
  note = input('');
  upgrade = output<void>();
}
