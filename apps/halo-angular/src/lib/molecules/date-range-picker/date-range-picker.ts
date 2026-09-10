import { Component, ElementRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { HaloButton } from '../../atoms/button/button';
import { t, WEEKDAYS, fmtDate, fmtMonthYear } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

/** A named span the page can resolve itself ("Last 30 days"). */
export interface DatePreset { value: string; label: string; }

/** The custom-range sentinel: not a value the page ever stores, only the row
 *  that swaps this panel over to the calendar. */
export const CUSTOM_RANGE = '__custom__';

// Monday-first, in the current language (i18n.ts keeps the English table).
const WEEK = [1, 2, 3, 4, 5, 6, 0].map((i) => WEEKDAYS[i]);
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

interface Cell { iso: string; day: number; has: boolean; }

/**
 * DateRangePicker — the date filter's panel: named presets first, a calendar
 * second.
 *
 * Presets lead because over an archive of a whole season most questions are
 * relative ("this month", "the last 30 days"), and a calendar answers those
 * only by counting backwards through months. The calendar is what the presets
 * cannot do: a specific week, a specific finals day.
 *
 * A day with nothing behind it is NOT pickable. The catalogue is on the client,
 * so we know exactly which days have games, and a filter that can be set to an
 * empty result is a dead end the user has to undo. Days that do have games
 * carry a dot, the same convention the Games page's day strip already uses.
 *
 * Range, not a single date: one day of a season-long archive is a game or two,
 * which the list already shows at the top. A range covers the single day as
 * well, by clicking the same day twice.
 */
@Component({
  selector: 'halo-date-range-picker',
  standalone: true,
  imports: [HaloIcon, HaloButton, TPipe],
  template: `
    @if (mode() === 'presets') {
      <div class="opts" role="listbox" [attr.aria-label]="'date.range' | t">
        @for (p of presets(); track p.value) {
          <button class="opt" type="button" role="option" [class.on]="value() === p.value"
            [attr.aria-selected]="value() === p.value" (click)="pick.emit(p.value)">
            <span class="tick rd" aria-hidden="true"></span>{{ p.label }}
          </button>
        }
        <!-- Not an option in the list above: it opens a second view rather than
             answering, so it is a row that leads somewhere and says so. -->
        <button class="opt lead" type="button" [class.on]="isRange()"
          (click)="openCalendar()">
          <span class="tick rd" aria-hidden="true"></span>
          <span class="lead-t">{{ 'date.custom' | t }}</span>
          <halo-icon class="lead-ic" name="chevron-right" [size]="14" />
        </button>
      </div>
    } @else {
      <div class="cal">
        <div class="cal-top">
          <button class="nav" type="button" [attr.aria-label]="'date.prevMonth' | t"
            [disabled]="!canStep(-1)" (click)="step(-1)">
            <halo-icon name="chevron-left" [size]="15" />
          </button>
          <span class="cal-mo" aria-live="polite">{{ monthLabel() }}</span>
          <button class="nav" type="button" [attr.aria-label]="'date.nextMonth' | t"
            [disabled]="!canStep(1)" (click)="step(1)">
            <halo-icon name="chevron-right" [size]="15" />
          </button>
        </div>

        <!-- The hint carries the whole state of a two-click interaction: after
             the first click there is a start and no end, and nothing else on
             screen would say so. -->
        <p class="cal-hint" aria-live="polite">{{ hint() }}</p>

        <!-- role="grid" with a roving tab stop: the grid is ONE tab stop and the
             arrows move inside it, which is the pattern a calendar owes the
             keyboard. 31 individual tab stops would otherwise sit between the
             month header and the Back link. -->
        <div class="grid" role="grid" [attr.aria-label]="monthLabel()" (keydown)="onKey($event)">
          <div class="wk" role="row">
            @for (w of week; track w) {
              <span class="wd" role="columnheader" [attr.aria-label]="w">{{ w.charAt(0) }}</span>
            }
          </div>
          <div class="days" role="row">
            @for (c of cells(); track $index) {
              @if (c) {
                <button class="dy" type="button" role="gridcell" [attr.data-iso]="c.iso"
                  [disabled]="!c.has"
                  [class.on]="isEdge(c.iso)" [class.in]="isInside(c.iso)"
                  [class.rs]="isStart(c.iso)" [class.re]="isEnd(c.iso)"
                  [attr.aria-label]="dayLabel(c)" [attr.aria-selected]="isEdge(c.iso)"
                  [tabIndex]="c.iso === focusIso() ? 0 : -1" (click)="tap(c)">
                  {{ c.day }}
                  @if (c.has) { <span class="dot" aria-hidden="true"></span> }
                </button>
              } @else {
                <span class="dy pad" role="gridcell" aria-hidden="true"></span>
              }
            }
          </div>
        </div>

        <!-- Apply, not commit-on-click. A range is one value in two parts, so
             until the second end is picked there is nothing valid to apply, and
             closing on that second click made every correction cost a re-open
             of the panel (Maryna 2026-09-02). The presets above stay instant:
             each is a single complete value, exactly like every other pill in
             the filter bar. -->
        <div class="cal-foot">
          <button class="halo-clear-link back" type="button" (click)="backToPresets()">{{ 'common.back' | t }}</button>
          @if (draftFrom()) {
            <button class="halo-clear-link" type="button" (click)="reset()">{{ 'date.reset' | t }}</button>
          }
          <halo-button variant="primary" size="sm" [disabled]="!complete()"
            (press)="apply()">{{ 'date.apply' | t }}</halo-button>
        </div>
      </div>
    }
  `,
  styleUrl: './date-range-picker.scss',
})
export class DateRangePicker {
  /** Scoped to this instance: a page could hold two of these, and a global
   *  document query would move the other one's focus. `inject(ElementRef)`
   *  without a type argument — writing `inject(ElementRef<HTMLElement>)` is a
   *  type argument on an untyped overload, which is TS2347 and takes the whole
   *  build down while the dev server keeps serving the last good bundle, so the
   *  code looks like it runs and does nothing (Maryna 2026-09-02). */
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  /** Named spans, in menu order. The page resolves them; this panel only names them. */
  presets = input<DatePreset[]>([]);
  /** The current selection: a preset value, or `start..end` in ISO. */
  value = input<string>('');
  /** ISO days that have content. Everything else is unpickable. */
  days = input<readonly string[]>([]);
  /** ISO day the calendar opens on when the selection is a preset. The newest
   *  game, not the real today: the catalogue is what is being browsed, and an
   *  archive's last month is where a range is nearly always drawn. */
  anchor = input<string>('');
  /** A preset value, or `start..end`. */
  pick = output<string>();
  /** The panel swapped views, so its BOX changed size. Whoever anchors this
   *  panel has to re-clamp it: the calendar is half again as wide as the preset
   *  list, and a clamp measured when the list was open leaves the calendar
   *  hanging outside the frame (Maryna 2026-09-02). Announced rather than
   *  observed — a ResizeObserver on the anchoring menu did not fire for this
   *  swap, and the panel knows exactly when it happens. */
  viewChange = output<void>();

  protected week = WEEK;
  protected mode = signal<'presets' | 'calendar'>('presets');
  /** Which day owns the tab stop, so the grid is one stop and arrows move in it. */
  protected focusIso = signal<string>('');
  /** The range being DRAWN, which is not the range in force until Apply. Two
   *  signals rather than one "start + maybe end", because a half-drawn range and
   *  a one-day range are different states and the footer has to tell them
   *  apart: one cannot be applied, the other can. */
  protected draftFrom = signal<string | null>(null);
  protected draftTo = signal<string | null>(null);
  protected complete = computed(() => !!this.draftFrom() && !!this.draftTo());
  private month = signal<{ y: number; m: number }>({ y: 2026, m: 0 });

  private daySet = computed(() => new Set(this.days()));
  /** Bounds: an archive's calendar has no business wandering into empty years. */
  private first = computed(() => [...this.days()].sort()[0] ?? '');
  private last = computed(() => [...this.days()].sort().at(-1) ?? '');

  protected isRange = computed(() => this.value().includes('..'));
  private edges = computed<[string, string] | null>(() => {
    const v = this.value();
    if (!v.includes('..')) return null;
    const [a, b] = v.split('..');
    return [a, b];
  });

  constructor() {
    // Open where the selection already is: a chosen range opens on its own
    // month, a preset opens on the newest game. Reading the inputs in an effect
    // rather than initialising a signal, because inputs are not set yet at
    // construction.
    effect(() => {
      const e = this.edges();
      const a = this.anchor() || this.last();
      const on = e ? e[0] : a;
      if (!on) return;
      untracked(() => {
        this.mode.set(e ? 'calendar' : 'presets');
        // A range already in force opens as its own draft, so Apply is live and
        // the panel reads as "this is what is on" rather than a blank slate.
        this.draftFrom.set(e ? e[0] : null);
        this.draftTo.set(e ? e[1] : null);
        this.showMonthOf(on);
      });
    });
  }

  private showMonthOf(day: string): void {
    const [y, m] = day.split('-').map(Number);
    this.month.set({ y, m: m - 1 });
    this.focusIso.set(day);
  }

  openCalendar(): void {
    this.mode.set('calendar');
    const e = this.edges();
    this.draftFrom.set(e ? e[0] : null);
    this.draftTo.set(e ? e[1] : null);
    const on = e?.[0] || this.anchor() || this.last();
    if (on) this.showMonthOf(on);
    this.viewChange.emit();
  }
  /** Back discards the draft: leaving the calendar without applying is how you
   *  cancel, so it must not leave a half-drawn range behind for next time. */
  backToPresets(): void { this.clearDraft(); this.mode.set('presets'); this.viewChange.emit(); }
  reset(): void { this.clearDraft(); }
  private clearDraft(): void { this.draftFrom.set(null); this.draftTo.set(null); }
  apply(): void {
    if (!this.complete()) return;
    this.pick.emit(`${this.draftFrom()}..${this.draftTo()}`);
  }

  protected monthLabel = computed(() => fmtMonthYear(this.month().y, this.month().m));

  /** The month as a Monday-first grid; leading and trailing blanks are nulls
   *  rather than neighbouring days, which would be pickable-looking cells from
   *  a month the header does not name. */
  protected cells = computed<(Cell | null)[]>(() => {
    const { y, m } = this.month();
    const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0
    const len = new Date(y, m + 1, 0).getDate();
    const out: (Cell | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= len; d++) {
      const s = iso(y, m, d);
      out.push({ iso: s, day: d, has: this.daySet().has(s) });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  });

  canStep(dir: number): boolean {
    const { y, m } = this.month();
    const next = iso(y, m + dir, 1).slice(0, 7);
    return dir < 0 ? next >= this.first().slice(0, 7) : next <= this.last().slice(0, 7);
  }
  step(dir: number): void {
    if (!this.canStep(dir)) return;
    const { y, m } = this.month();
    const d = new Date(y, m + dir, 1);
    this.month.set({ y: d.getFullYear(), m: d.getMonth() });
  }

  isStart(day: string): boolean { return this.draftFrom() === day; }
  isEnd(day: string): boolean { return (this.draftTo() ?? this.draftFrom()) === day; }
  isEdge(day: string): boolean { return this.isStart(day) || this.isEnd(day); }
  isInside(day: string): boolean {
    const a = this.draftFrom(); const b = this.draftTo();
    return !!a && !!b && day > a && day < b;
  }

  tap(c: Cell): void {
    this.focusIso.set(c.iso);
    const a = this.draftFrom();
    // A click on a COMPLETE range starts a new one. The alternative — moving
    // whichever end is nearer — reads as the calendar arguing with the click.
    if (!a || this.draftTo()) { this.draftFrom.set(c.iso); this.draftTo.set(null); return; }
    // Backwards is allowed and simply normalised, so the second click does not
    // have to be the later date.
    const [from, to] = a <= c.iso ? [a, c.iso] : [c.iso, a];
    this.draftFrom.set(from);
    this.draftTo.set(to);
  }

  protected hint = computed(() => {
    const a = this.draftFrom(); const b = this.draftTo();
    if (!a) return t('date.pickStart');
    if (!b) return t('date.fromPickEnd', { from: this.pretty(a) });
    return a === b ? this.pretty(a) : t('date.fromTo', { from: this.pretty(a), to: this.pretty(b) });
  });

  private pretty(day: string): string {
    const [y, m, d] = day.split('-').map(Number);
    return fmtDate(new Date(y, m - 1, d), { day: 'numeric', month: 'short', year: 'numeric' });
  }
  dayLabel(c: Cell): string {
    return `${this.pretty(c.iso)}${c.has ? '' : `, ${t('games.a11yNone')}`}`;
  }

  /** Arrows by day, PageUp/PageDown by month. Stepping off the month steps the
   *  month with it, which is what makes the whole archive reachable without a
   *  mouse. Bounded by the archive, so the keyboard cannot walk into the empty
   *  years the header's own arrows already refuse to open. */
  onKey(e: KeyboardEvent): void {
    const by: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      this.step(e.key === 'PageUp' ? -1 : 1);
      const c = this.cells().find((x): x is Cell => !!x);
      if (c) this.moveFocus(c.iso);
      return;
    }
    const delta = by[e.key];
    if (!delta) return;
    e.preventDefault();
    const cur = this.focusIso();
    if (!cur) return;
    const [y, m, d] = cur.split('-').map(Number);
    const t = new Date(y, m - 1, d + delta);
    const next = iso(t.getFullYear(), t.getMonth(), t.getDate());
    if (next < this.first() || next > this.last()) return;
    if (next.slice(0, 7) !== cur.slice(0, 7)) this.showMonthOf(next);
    this.moveFocus(next);
  }
  private moveFocus(day: string): void {
    this.focusIso.set(day);
    // Twice, and both are needed. The cell usually exists already, so the first
    // call moves focus in the same task the key was pressed in. A month STEP
    // re-renders the grid, and on that path only the second call finds the cell.
    const go = () => this.host.nativeElement
      .querySelector<HTMLElement>(`.dy[data-iso="${day}"]`)?.focus();
    go();
    requestAnimationFrame(go);
  }
}
