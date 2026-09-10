import { Component, ElementRef, effect, inject, input, model, signal } from '@angular/core';

export interface SegOption { key: string; label: string; count?: number; }

/** Pill segmented control — 2+ mutually-exclusive options; active fills with accent.
 *  `mode="tabs"` renders the same API as a scrollable underline tab row (page
 *  sections) instead of a filled pill — use it instead of hand-rolling tab strips.
 *
 *  The active marker is a single sliding layer, not a state on the button
 *  (2026-08-27): the fill/underline travels to the picked segment so the
 *  switch shows where it came from. Only `transform` animates. The pill's
 *  thumb takes its width from a variable and glides on translateX, which keeps
 *  its 22px round ends undistorted; the 2px underline scales on the same
 *  transform, where scaling a 2px bar costs nothing visually.
 */
@Component({
  selector: 'halo-segmented-toggle',
  standalone: true,
  template: `
    <div class="seg" [class.inline]="size() === 'inline'" [class.tabs]="mode() === 'tabs'"
      [class.scrolls]="scrolls()" [class.ready]="ready()"
      [class.fade-l]="fadeL()" [class.fade-r]="fadeR()"
      [style.--tx]="ind().x + 'px'" [style.--sw]="ind().w + 'px'" [style.--sx]="ind().w / 100"
      role="tablist">
      @if (size() !== 'inline') {
        <span class="thumb" aria-hidden="true"></span>
      }
      @for (o of options(); track o.key) {
        <button
          class="segbtn"
          type="button"
          role="tab"
          [class.on]="o.key === value()"
          [attr.aria-selected]="o.key === value()"
          (click)="value.set(o.key)"
        >{{ o.label }}@if (o.count != null) {<span class="sr-only">, </span><span class="n">{{ o.count }}</span>}</button>
      }
    </div>
  `,
  styleUrl: './segmented-toggle.scss',
})
export class SegmentedToggle {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  options = input<SegOption[]>([]);
  value = model('');
  /** 'full' fills the width (equal segments); 'inline' hugs content, left-aligned. */
  size = input<'full' | 'inline'>('full');
  /** 'seg' = filled pill (default); 'tabs' = scrollable underline tab row. */
  mode = input<'seg' | 'tabs'>('seg');

  /** Active marker geometry, in the row's own content coordinates. */
  protected ind = signal({ x: 0, w: 0 });
  /** Suppresses the travel animation until the first measurement has landed,
   *  so the marker doesn't fly in from x=0 on load. */
  protected ready = signal(false);
  /** Only a row that actually overflows gets `overflow-x: auto` — the scroll
   *  box would otherwise clip the global focus ring's outer halo. */
  protected scrolls = signal(false);
  /** Which end still has content hidden behind it — the fade belongs there and
   *  nowhere else, so a row scrolled to its end doesn't dim a label for nothing. */
  protected fadeL = signal(false);
  protected fadeR = signal(false);

  constructor() {
    effect(() => {
      // Re-measure whenever the selection or the option set changes.
      this.value();
      this.options();
      this.size();
      this.mode();
      queueMicrotask(() => this.measure());
    });

    /* Widths change with the viewport AND with the a11y text steps. The row
       has to be watched for the first, every segment for the second: a text
       step grows the labels while the row keeps its full width, so watching
       only the row left the marker 11px short of its segment (2026-08-27). */
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.measure());
    }
    /* Two more triggers, because the observer is not always enough: `resize`
       covers viewport changes even where observer callbacks are throttled, and
       re-measuring on pointerdown makes any interaction self-healing — the
       accessibility text steps change label widths without changing the row's,
       and a marker that lagged would otherwise stay wrong until the next
       selection. */
    if (typeof window !== 'undefined') {
      const onResize = () => this.measure();
      window.addEventListener('resize', onResize, { passive: true });
      this.host.nativeElement.addEventListener('pointerdown', onResize, { passive: true, capture: true });
      this.host.nativeElement.addEventListener('scroll', () => this.edges(), { passive: true, capture: true });
    }
    queueMicrotask(() => this.measure());
  }

  private ro?: ResizeObserver;

  private row(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('.seg');
  }

  /** Fade only the end that still hides content. */
  private edges(): void {
    const row = this.row();
    if (!row) return;
    // scrollLeft runs negative from the right edge in RTL, so measure distance
    // from the START edge and map it to a physical side per direction.
    const rtl = getComputedStyle(row).direction === 'rtl';
    const fromStart = Math.abs(row.scrollLeft);
    const hidStart = fromStart > 1;
    const hidEnd = fromStart + row.clientWidth < row.scrollWidth - 1;
    const l = rtl ? hidEnd : hidStart;
    const r = rtl ? hidStart : hidEnd;
    if (l !== this.fadeL()) this.fadeL.set(l);
    if (r !== this.fadeR()) this.fadeR.set(r);
  }

  /** Reads geometry once per change (never per frame) and hands it to CSS. */
  private measure(): void {
    const row = this.row();
    if (!row) return;
    const overflows = row.scrollWidth > row.clientWidth + 1;
    if (overflows !== this.scrolls()) this.scrolls.set(overflows);
    const btns = [...row.querySelectorAll<HTMLElement>('.segbtn')];
    // observe() is idempotent per element, so this also picks up new options.
    if (this.ro) { this.ro.observe(row); btns.forEach((b) => this.ro!.observe(b)); }
    const i = this.options().findIndex((o) => o.key === this.value());
    // No option matches the value (an unanswered picker, or a stale value): NO thumb.
    // Clamping to option 0 painted the accent pill under an unselected label — muted
    // ink on lime measured ≈1:1 (WCAG 1.4.3, a11y audit 2026-09-02 G2).
    if (i < 0) {
      if (this.ind().w !== 0) this.ind.set({ x: 0, w: 0 });
      if (!this.ready()) queueMicrotask(() => this.ready.set(true));
      return;
    }
    const el = btns[i];
    if (!el) return;
    // Only write when it actually moved: the observer watches elements this
    // very method can influence, and an unconditional set could loop.
    const next = { x: el.offsetLeft, w: el.offsetWidth };
    const cur = this.ind();
    if (next.x !== cur.x || next.w !== cur.w) this.ind.set(next);
    if (!this.ready()) queueMicrotask(() => this.ready.set(true));
    /* Keep the picked tab on screen when the row scrolls (Home's team filter).
       Instant, not smooth: the reveal is a correctness guarantee, not a moment,
       and an animated scroll that gets interrupted leaves the selection off
       screen. It also honours the in-app reduce-motion toggle by definition. */
    if (this.mode() === 'tabs' && this.scrolls()) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    }
    // AFTER any scrolling: the fade belongs to wherever the row now sits.
    this.edges();
  }
}
