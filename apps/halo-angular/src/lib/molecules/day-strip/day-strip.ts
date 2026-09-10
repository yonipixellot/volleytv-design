import { Component, ElementRef, effect, inject, input, model } from '@angular/core';
import { t } from '../../../app/i18n/i18n';

export interface DayCell {
  w: string;
  n: string | number;
  /** True when that day has games — the strip marks it with a dot so the
   *  schedule can be scanned without tapping into empty days. */
  has?: boolean;
  /** Today. Stays marked while the viewer browses other days, so they never
   *  lose the anchor they started from. */
  today?: boolean;
}

/**
 * Horizontal day picker (.dseg): weekday + date cells, the active one
 * accent-highlighted. Tapping a cell sets `activeIndex` (two-way).
 *
 * `scroll` mode: when the strip carries a whole month (not a fixed 6-day
 * window) the cells become fixed-width and the row scrolls horizontally; the
 * active day is auto-scrolled into view. Default (false) keeps the original
 * evenly-distributed flex:1 layout for short strips.
 *
 * A day carrying games gets a dot (2026-08-27) and says so in its accessible
 * label, since a coloured dot alone communicates nothing to a screen reader.
 * Today keeps a primary-coloured ring whichever day is selected — the ring
 * rather than a coloured numeral because `--primary` is skin-supplied, so its
 * contrast against the cell cannot be guaranteed for text.
 */
@Component({
  selector: 'halo-day-strip',
  standalone: true,
  template: `
    <div class="dseg" [class.scroll]="scroll()">
      @for (d of days(); track $index; let i = $index) {
        <button class="d" type="button" [class.on]="i === activeIndex()" [class.today]="d.today"
          [attr.aria-label]="label(d)" (click)="activeIndex.set(i)">
          <span class="w">{{ d.w }}</span>
          <span class="n num">{{ d.n }}</span>
          @if (d.has) { <span class="dot" aria-hidden="true"></span> }
        </button>
      }
    </div>
  `,
  styleUrl: './day-strip.scss',
})
export class DayStrip {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  days = input.required<DayCell[]>();
  activeIndex = model<number>(0);
  scroll = input(false);

  /** "Sat 9" / "Sun 10, today, has games" — both markers, spoken. */
  protected label(d: DayCell): string {
    return [`${d.w} ${d.n}`, d.today ? t('day.today') : '', d.has ? t('day.hasGames') : '']
      .filter(Boolean)
      .join(', ');
  }

  constructor() {
    // Keep the selected day visible when it (or the month) changes.
    effect(() => {
      const i = this.activeIndex();
      if (!this.scroll()) return;
      queueMicrotask(() => {
        const cells = this.host.nativeElement.querySelectorAll<HTMLElement>('.dseg .d');
        cells[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
    });
  }
}
