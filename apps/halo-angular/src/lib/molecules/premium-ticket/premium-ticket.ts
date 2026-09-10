import { Component, input, output } from '@angular/core';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * PremiumTicket — the app's premium-gate signature: the locked thing as an
 * event ticket. Gold vertical PREMIUM rail, body (title + meta), perforated
 * tear-off strip holding the unlock CTA, optional quiet skip below.
 * Used by the highlight reel's locked slide and the BlurLock overlay so every
 * gate speaks the same language. Gold is the fixed --premium token — never re-skinned.
 */
@Component({
  // `title` is a global HTML attribute, so a static `title="…"` in a caller's
  // template stays on the HOST and the browser raises its own tooltip over the
  // component — duplicating text already on screen (Maryna 2026-08-30). The
  // input keeps its natural name; the host simply stops carrying it.
  host: { '[attr.title]': 'null' },
  selector: 'halo-premium-ticket',
  standalone: true,
  imports: [TPipe],
  template: `
    <div class="ticket">
      <span class="rail" aria-hidden="true"><span>{{ 'common.premium' | t }}</span></span>
      <div class="tbody">
        <span class="tt">{{ title() }}</span>
        @if (meta()) { <span class="tm">{{ meta() }}</span> }
      </div>
      <div class="tear">
        <span class="notch l" aria-hidden="true"></span>
        <span class="notch r" aria-hidden="true"></span>
        <button class="cta" type="button" (click)="unlock.emit()">{{ cta() }}</button>
      </div>
    </div>
    @if (skipLabel()) {
      <button class="tskip" type="button" (click)="skip.emit()">{{ skipLabel() }} ›</button>
    }
  `,
  styles: [`
    :host { display: block; }
    .ticket {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      text-align: start;
      background: linear-gradient(180deg, #201a0c, #14100a);
      border: 1px solid color-mix(in srgb, var(--premium) 40%, transparent);
      box-shadow:
        var(--shadow-3),
        0 0 40px -12px color-mix(in srgb, var(--premium) 40%, transparent);
    }
    .rail {
      position: absolute; inset-inline-start: 0; top: 0; bottom: 0; width: 26px;
      display: grid; place-items: center;
      background: linear-gradient(180deg,
        var(--premium),
        color-mix(in srgb, var(--premium) 82%, #000));
    }
    .rail span {
      writing-mode: vertical-rl; transform: rotate(180deg);
      font-family: var(--body); font-weight: 800; font-size: var(--fs-caption);
      letter-spacing: .28em; text-transform: uppercase;
      color: var(--premium-ink);
    }
    .tbody { padding-block: var(--space-4) var(--space-3); padding-inline: var(--space-10) var(--space-4); }
    .tt {
      display: block;
      font-family: var(--disp); font-weight: 800; font-size: var(--fs-heading);
      line-height: var(--lh-snug); letter-spacing: .01em; color: #fff;
      text-transform: uppercase;
    }
    .tm {
      display: block; margin-top: 3px;
      font-family: var(--body); font-weight: 600; font-size: var(--fs-caption);
      color: rgba(255, 255, 255, .62);
    }
    .tear {
      position: relative;
      margin-inline-start: var(--space-6);
      border-top: 2px dashed color-mix(in srgb, var(--premium) 35%, transparent);
      padding: var(--space-3) var(--space-4);
    }
    .notch {
      position: absolute; top: -7px; width: 14px; height: 14px; border-radius: 50%;
      background: #0a0906;
    }
    .notch.l { inset-inline-start: 19px; }
    .notch.r { inset-inline-end: -7px; }
    .cta {
      width: 100%;
      cursor: pointer;
      border: 0;
      border-radius: 9px;
      padding: var(--space-3);
      font-family: var(--body); font-weight: 800; font-size: var(--fs-body);
      background: linear-gradient(180deg,
        color-mix(in srgb, var(--premium) 55%, #fff),
        var(--premium) 42%,
        color-mix(in srgb, var(--premium) 88%, #000));
      color: var(--premium-ink);
      box-shadow: 0 10px 26px -8px color-mix(in srgb, var(--premium) 50%, transparent), inset 0 1px 0 rgba(255, 255, 255, .55);
      transition: transform var(--dur-fast);
    }
    .cta:active { transform: scale(.98); }
    .tskip {
      margin-top: var(--space-3);
      width: 100%;
      cursor: pointer;
      border: 0; background: none;
      font-family: var(--body); font-weight: 600; font-size: var(--fs-body);
      color: rgba(255, 255, 255, .7);
      padding-block: var(--space-2); margin-block: calc(var(--space-2) * -1);  // a11y 2.5.8: >=24px hit area
    }
  `],
})
export class PremiumTicket {
  title = input.required<string>();
  meta = input('');
  cta = input(t('ticket.unlock'));
  skipLabel = input('');
  unlock = output<void>();
  skip = output<void>();
}
