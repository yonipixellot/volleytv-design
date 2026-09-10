import { DestroyRef, Directive, ElementRef, Injector, afterNextRender, inject, output } from '@angular/core';

/**
 * HOW MANY COLUMNS A GRID ACTUALLY HAS, reported to the host.
 *
 * For capping a grid by ROWS rather than by a fixed number of tiles. A fixed
 * number cannot be right on a grid that reflows: the clip and moment grids are
 * `repeat(auto-fill, minmax(144px, 1fr))`, so nine tiles is three tidy rows at
 * three columns and one and a half at six — a half-empty row sitting above a
 * "Show all", which says the tiles ran out of room when they plainly had not
 * (Maryna 2026-09-02).
 *
 * Measured, not derived from a breakpoint. `auto-fill` counts against the
 * CONTAINER's width, and these grids sit inside a column that is narrower than
 * the page, so no media query knows the answer — but
 * `getComputedStyle().gridTemplateColumns` does, because it is the resolved
 * track list.
 */
@Directive({
  selector: '[haloGridColumns]',
  standalone: true,
})
export class GridColumns {
  /** The resolved column count, on first render and on every resize. */
  columns = output<number>();

  constructor() {
    // No type argument on inject(ElementRef) — `inject(ElementRef<HTMLElement>)`
    // is a type argument on an untyped overload, which is TS2347 and fails the
    // build while the dev server keeps serving the last good bundle.
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    const injector = inject(Injector);

    const read = () => {
      const tracks = getComputedStyle(el).gridTemplateColumns;
      // "none" on a non-grid, one entry per resolved track otherwise.
      const n = tracks && tracks !== 'none' ? tracks.split(/\s+/).filter(Boolean).length : 1;
      this.columns.emit(Math.max(1, n));
    };

    // BOTH a ResizeObserver and a window resize listener, for the same reason
    // RailCapacity listens twice: a measurement whose only invalidation is one
    // event is stale the moment that event is missed, and a stale column count
    // puts the control back under a half-empty row. The observer catches a
    // container that changes width while the window does not (a panel opening);
    // the window listener is the cheap second opinion, and it is the one that
    // works when the observer does not fire at all, which is measurably the case
    // in the preview harness (Maryna 2026-09-02).
    const ro = new ResizeObserver(read);
    ro.observe(el);
    window.addEventListener('resize', read, { passive: true });
    afterNextRender(read, { injector });
    destroy.onDestroy(() => {
      ro.disconnect();
      window.removeEventListener('resize', read);
    });
  }
}
