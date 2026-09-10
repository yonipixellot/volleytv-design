import { Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { DatePreset, DateRangePicker } from '../../molecules/date-range-picker/date-range-picker';
import { TPipe } from '../../../app/i18n/t.pipe';

/** An option whose stored value is not the text on screen (a game id shown as
 *  "vs Hustle HQ", a range key shown as "Last 30 days"). A plain string is the
 *  common case and means value === label. */
export interface FilterBarOption { value: string; label: string; }

export interface FilterBarCategory {
  key: string;
  label: string;
  options: (string | FilterBarOption)[];
  /** Single-select: a radio list that replaces rather than accumulates, and
   *  closes on the pick because there is nothing more to say. */
  single?: boolean;
  /** The option that means "no filter" (e.g. "All time"). It is ticked when it
   *  is the selection, but not counted as active, so choosing it does not raise
   *  the Clear link. Only meaningful with `single`. */
  defaultValue?: string;
  /** Renders the DATE panel — named presets plus a calendar — in place of the
   *  option list and its find field. A list of every day in an archive does not
   *  scale, and it cannot express "that week" at all (Maryna 2026-09-02). The
   *  panel emits through the same `toggleOption`, so the page has one entry
   *  point whichever category moved. */
  date?: { presets: DatePreset[]; days: readonly string[]; anchor?: string };
  /** Overrides the pill's text. The date category's selection is a range, whose
   *  wording is the page's business, not a lookup in `options`. */
  pillText?: string;
}

/**
 * EventFilterBar — compact-pill multi-select filter row (wireframe-PT
 * EventFilterBar, design B). Each category is a pill that sizes to its label;
 * the row scrolls horizontally. A pill shows the category name when empty,
 * the value when one is picked, and "Category · N" for several — going accent
 * when active. Tapping a pill opens an anchored option menu (single-open);
 * every toggle filters live — no Apply step, the pills ARE the state.
 *
 * Every menu carries a find field, not just the long ones. The categories are
 * the same control repeated across a row, and giving three of five a search box
 * makes the other two look broken; the field is also where the user's hands
 * already are once they have opened one picker. It is genuinely needed on Team
 * and Club, which run to dozens of options on Home and Events (Yuval
 * 2026-08-31).
 */
@Component({
  selector: 'halo-event-filter-bar',
  standalone: true,
  imports: [HaloIcon, DateRangePicker, TPipe],
  template: `
    @if (openMenu()) {
      <div class="efb-away" aria-hidden="true" (click)="closeMenu()"></div>
    }
    <div class="efb" role="group" [attr.aria-label]="'efb.a11y' | t">
      @for (c of categories(); track c.key) {
        <span class="wrap">
          <button class="pill" type="button" [class.on]="count(c.key) > 0" [class.open]="openMenu() === c.key"
            [attr.aria-expanded]="openMenu() === c.key" (click)="toggleMenu(c.key)">
            {{ pillLabel(c) }} <halo-icon class="halo-chev" name="chevron-down" [size]="12" />
          </button>
          @if (openMenu() === c.key) {
            <!-- The menu is a group, not the listbox: a listbox may only contain
                 options, so the find field would be invalid inside it. The
                 listbox is the option list below. -->
            <div #menu class="menu" [class.up]="flipUp()"
              [style.--menu-shift.px]="shift()"
              [style.--menu-max-h.px]="maxH() || null" role="group"
              [attr.aria-label]="c.label" (keydown)="onKey($event, c)">
              @if (c.date) {
                <halo-date-range-picker class="dp"
                  [presets]="c.date.presets" [days]="c.date.days"
                  [anchor]="c.date.anchor || ''" [value]="selected()[c.key][0] || ''"
                  (pick)="pick(c, $event)" (viewChange)="reclamp()" />
              } @else {
              <div class="find">
                <halo-icon class="find-ic" name="search" [size]="13" />
                <input #find class="find-in" type="text" autocomplete="off" spellcheck="false"
                  [placeholder]="'efb.search' | t" [attr.aria-label]="'efb.searchIn' | t: { cat: c.label }"
                  [value]="query()" (input)="query.set($any($event.target).value)" />
                @if (query()) {
                  <button class="find-x" type="button" [attr.aria-label]="'efb.clearSearch' | t" (click)="clearQuery()">
                    <halo-icon name="close" [size]="12" />
                  </button>
                }
              </div>
              <div class="opts" role="listbox" [attr.aria-label]="c.label"
                [attr.aria-multiselectable]="c.single ? null : 'true'">
                @for (o of shown(c); track o.value) {
                  <button class="opt" type="button" role="option" [attr.aria-selected]="isOn(c.key, o.value)"
                    [class.on]="isOn(c.key, o.value)" (click)="pick(c, o.value)">
                    <!-- A radio dot for one-of, a check for many-of: the shape
                         says whether picking a second value replaces the first. -->
                    <span class="tick" [class.rd]="c.single" aria-hidden="true">
                      @if (isOn(c.key, o.value) && !c.single) { <halo-icon name="check" [size]="12" /> }
                    </span>
                    {{ o.label }}
                  </button>
                }
                @if (shown(c).length === 0) {
                  <p class="none">{{ 'efb.noMatch' | t: { q: query() } }}</p>
                }
              </div>
              }
            </div>
          }
        </span>
      }
      @if (activeCount() > 0) {
        <button class="halo-clear-link clr" type="button" (click)="clear.emit(); closeMenu()">{{ 'nc.clearAll' | t }}</button>
      }
    </div>
  `,
  styleUrl: './event-filter-bar.scss',
})
export class EventFilterBar {
  private injector = inject(Injector);
  categories = input.required<FilterBarCategory[]>();
  /** Selected values per category key. */
  selected = input.required<Record<string, string[]>>();
  toggleOption = output<{ cat: string; value: string }>();
  clear = output<void>();

  openMenu = signal<string | null>(null);
  /** One query, because only one menu is open at a time. */
  query = signal('');
  private find = viewChild<ElementRef<HTMLInputElement>>('find');
  private menu = viewChild<ElementRef<HTMLElement>>('menu');
  /** Horizontal nudge, in px, that keeps the menu on screen. The menu anchors to
   *  its pill's left edge, which put the last pill's menu 85px past the right of
   *  a 375 viewport. A flip to the pill's right edge fixes that pill and breaks
   *  a narrow one near the right (Comp went to -55 on the left), so this clamps
   *  instead of flipping: one number, both edges, and it is MEASURED, because
   *  which pill overflows depends on where the row wrapped and how wide the
   *  longest option is (Maryna 2026-08-31). */
  protected shift = signal(0);
  /** Opens above the pill instead of below it. */
  protected flipUp = signal(false);
  /** Measured height cap, in px. 0 means "unset" — the CSS default applies. */
  protected maxH = signal(0);

  constructor() {
    // An anchored menu whose anchor has moved is stale, and on a page with fixed
    // bottom chrome it is worse than stale: the menu travels with the content and
    // ends up drawn across the CTA dock, which is exactly what was reported
    // (Maryna 2026-08-31). Scrolling the page closes it. The option list has
    // `overscroll-behavior: contain`, so scrolling INSIDE the menu never reaches
    // the document and cannot close it from within.
    // Not captured: only the document's own scroll should count, and a capturing
    // listener would also see the list's.
    const onScroll = () => { if (this.openMenu()) this.closeMenu(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('scroll', onScroll));

    // Focus the field only where a keyboard is already there. On touch, focusing
    // raises the software keyboard over the very list it is meant to narrow.
    //
    // An effect rather than a timeout inside the click handler: the input does
    // not exist until the @if renders it, and a setTimeout races Angular's
    // render — it fired first here and read an undefined view query. Depending
    // on find() means this runs when the element actually arrives.
    effect(() => {
      const el = this.openMenu() ? this.find()?.nativeElement : null;
      if (el && matchMedia('(hover: hover) and (pointer: fine)').matches) el.focus();
    });

    // Same tick, same reason: the menu has to exist before it can be measured.
    effect(() => {
      const m = this.openMenu() ? this.menu()?.nativeElement : null;
      if (!m) return;
      this.place(m);
    });
  }

  /** Re-clamp an open menu whose panel swapped to a different-sized view — the
   *  date category trades its preset list for a wider calendar.
   *
   *  `afterNextRender`, and it took three tries to land on it. A ResizeObserver
   *  on the menu never fired for the swap. A requestAnimationFrame ran before
   *  Angular had rendered the new view. And an effect re-runs during the
   *  PARENT's change detection, which is still before the child panel's own
   *  template is refreshed — so it measured 532px of preset list where 282px of
   *  calendar was about to be (Maryna 2026-09-02). Only afterNextRender is
   *  after the whole render. */
  protected reclamp(): void {
    afterNextRender(() => {
      const m = this.menu()?.nativeElement;
      if (m) this.place(m);
    }, { injector: this.injector });
  }

  /** Clamp the open menu into its frame, horizontally and vertically. */
  private place(m: HTMLElement): void {
    // untracked, or reading the current shift here would make this a dependency
    // of the effect that calls it and re-run it forever. toggleMenu zeroes the
    // shift before the menu renders, so what is measured is the unshifted box.
    const cur = untracked(() => this.shift());
    const r = m.getBoundingClientRect();
    const left = r.left - cur;
    const right = r.right - cur;
    const edge = 8;
    // The FRAME, not the window. Below 768 the app is a centred 430px canvas
    // with `overflow-x: clip`, so a menu can sit well inside the viewport and
    // still be cut off by the shell it lives in — measuring against
    // window.innerWidth said there was room where there was none.
    const frame = m.closest('.shell')?.getBoundingClientRect();
    const minX = (frame?.left ?? 0) + edge;
    const maxX = (frame?.right ?? window.innerWidth) - edge;
    let s = 0;
    if (right > maxX) s = maxX - right;
    // Right first, then left: on a frame narrower than the menu, staying
    // readable from the start of the label beats staying inside the far edge.
    if (left + s < minX) s = minX - left;
    if (s !== cur) this.shift.set(s);

    // ---- vertical, the same measure-and-clamp idea ----
    const anchor = m.parentElement!.getBoundingClientRect();
    const gap = 6;
    // Fixed bottom chrome the menu must stay clear of — a CTA dock, the nav
    // dock. Declared in CSS beside the scroll clearance those docks already
    // need, so the number lives next to its sibling rather than in a template.
    const safeBottom = parseFloat(
      getComputedStyle(m).getPropertyValue('--filter-safe-bottom')) || 0;
    const below = window.innerHeight - safeBottom - (anchor.bottom + gap) - edge;
    // The top boundary is the viewport. A page with fixed TOP chrome could see
    // a flipped menu reach under it; neither page that uses this bar has the
    // pills low enough for that, and a second property would have to be kept
    // in sync for a case that does not exist yet.
    const above = anchor.top - gap - edge;
    // The natural height is what the menu WANTS, which is only what it measures
    // when no cap is in force — with one applied, r.height is the cap.
    const capped = untracked(() => this.maxH());
    const natural = capped ? Math.max(r.height, capped) : r.height;
    // Below unless it genuinely does not fit AND above is roomier. A menu that
    // fits below stays below: flipping a menu that had the space is a jump the
    // user did not ask for.
    const up = natural > below && above > below;
    if (up !== untracked(() => this.flipUp())) this.flipUp.set(up);
    const room = up ? above : below;
    // Only cap when it bites. Setting max-height to the room every time would
    // pin the menu to the space available at open, so a short list stopped
    // sizing to its content.
    const cap = natural > room ? Math.max(Math.floor(room), 120) : 0;
    if (cap !== capped) this.maxH.set(cap);
  }

  toggleMenu(key: string): void {
    const next = this.openMenu() === key ? null : key;
    this.openMenu.set(next);
    this.query.set('');
    this.resetPlacement();
  }
  closeMenu(): void { this.openMenu.set(null); this.query.set(''); this.resetPlacement(); }
  /** Back to the unshifted, unflipped, uncapped menu — the state the effect
   *  below measures. Leaving a stale cap in place would have the next menu
   *  measured through the previous one's constraint. */
  private resetPlacement(): void { this.shift.set(0); this.flipUp.set(false); this.maxH.set(0); }
  clearQuery(): void { this.query.set(''); this.find()?.nativeElement.focus(); }

  /** A category's options in one shape, whichever shape the page supplied. */
  opts(c: FilterBarCategory): FilterBarOption[] {
    return c.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  }

  /** Options narrowed by the find field. Matched on the LABEL, which is what
   *  the user can see and therefore what they are typing at. Substring, case
   *  insensitive: "vic" means find it anywhere in "Basketball Victoria". */
  shown(c: FilterBarCategory): FilterBarOption[] {
    const q = this.query().trim().toLowerCase();
    const all = this.opts(c);
    return q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all;
  }

  pick(c: FilterBarCategory, value: string): void {
    this.toggleOption.emit({ cat: c.key, value });
    // A single-select answer is complete on the click. Multi-select stays open
    // so a second and third value do not each cost a re-open. The date panel
    // only emits once both ends of a range are in, so it counts as complete too.
    if (c.single || c.date) this.closeMenu();
  }

  onKey(e: KeyboardEvent, c: FilterBarCategory): void {
    // The date panel has no find field to back out of, so Escape closes the
    // menu in one step rather than two.
    if (c.date) {
      if (e.key === 'Escape') { e.stopPropagation(); this.closeMenu(); }
      return;
    }
    if (e.key === 'Escape') {
      // Escape backs out one step at a time: the query first, the menu second.
      e.stopPropagation();
      if (this.query()) { this.clearQuery(); } else { this.closeMenu(); }
      return;
    }
    // Enter on a narrowed list takes the obvious answer, so a search that leaves
    // one option does not then need a click.
    if (e.key === 'Enter' && this.query()) {
      const hits = this.shown(c);
      if (hits.length > 0) { e.preventDefault(); this.pick(c, hits[0].value); }
    }
  }

  /** The selection minus a single-select category's "no filter" option: sitting
   *  on "All time" is not a filter, and must not light the pill or the link. */
  private active(c: FilterBarCategory): string[] {
    return (this.selected()[c.key] ?? []).filter((v) => v !== c.defaultValue);
  }
  count(key: string): number {
    const c = this.categories().find((x) => x.key === key);
    return c ? this.active(c).length : 0;
  }
  isOn(key: string, value: string): boolean { return this.selected()[key]?.includes(value) ?? false; }
  activeCount = computed(() => this.categories().reduce((n, c) => n + this.active(c).length, 0));
  pillLabel(c: FilterBarCategory): string {
    const sel = this.active(c);
    if (sel.length === 0) return c.label;
    if (c.pillText) return c.pillText;
    if (sel.length === 1) return this.opts(c).find((o) => o.value === sel[0])?.label ?? sel[0];
    return `${c.label} · ${sel.length}`;
  }
}
