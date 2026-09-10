import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { plural } from './i18n/i18n';

/** The bands, and how many cards a capped rail shows in each. From 768 the rail
 *  is a grid and the cap is exactly one full row. Below 768 it is a horizontal
 *  scroller, and it takes the same shape of answer: a sample you can swipe, with
 *  the rest behind See all.
 *
 *  Four on a phone, and the number is measured, not guessed. At 375 a card is
 *  302px against a 12px gap, so 1.14 of them are on screen: four cards is about
 *  three screens of swipe, which is a peek. Ten — the first attempt — was 8.4
 *  screens per section across four sections, and worse, ten was also the length
 *  of the seeded catalogue, so See all appeared NOWHERE on a phone and the lane
 *  pages were unreachable from Home (Maryna 2026-09-02).
 *
 *  The count dips from 4 to 2 at 768 and that is correct: a phone shows 1.14
 *  cards and swipes the rest, a tablet shows both of its two at once. What goes
 *  down is the reach of the gesture, not what is visible.
 *
 *  Mirrors the grid in home.scss; the two have to agree. */
const BANDS: { min: number; visible: number }[] = [
  { min: 2000, visible: 6 },
  { min: 1600, visible: 5 },
  { min: 1280, visible: 4 },
  { min: 1024, visible: 3 },
  { min: 768, visible: 2 },
  { min: 0, visible: 4 },
];

/**
 * HOW MANY CARDS A CAPPED RAIL IS SHOWING, so the section header can say
 * whether there is more.
 *
 * It exists because the two halves disagreed. The cap is CSS — one row per
 * band, `:nth-child` in home.scss — and the "See all" link was a hand-written
 * `length > 4` in the template. At 900px the row holds two cards, so a section
 * with four games showed two and offered no way to the other two; same at 1024
 * with a fourth game. Demonstrated at 900px with State = Victoria, which
 * narrows Full games to exactly four (Maryna 2026-09-02).
 *
 * A media query cannot be read from TypeScript and a custom property cannot be
 * read inside a media query, so one of the two sides has to be duplicated. This
 * is that duplication, in one file, with the band ladder written once.
 */
@Injectable({ providedIn: 'root' })
export class RailCapacity {
  /** matchMedia, not window.innerWidth. The cap is decided by a media query, and
   *  innerWidth counts the scrollbar while a media query does not — so at a band
   *  edge the two could disagree by ~15px and the link would be wrong for
   *  exactly the widths where it matters most. Asking matchMedia asks the same
   *  question the CSS asked, and it reports its own changes, so there is no
   *  resize listener to throttle. */
  private readonly queries = typeof window === 'undefined' ? []
    : BANDS.filter((b) => b.min > 0).map((b) => ({
      visible: b.visible,
      mq: window.matchMedia(`(min-width: ${b.min}px)`),
    }));

  private band = signal(0);

  constructor() {
    if (!this.queries.length) return;
    // The queries are the SOURCE of the answer; these two events only say
    // "re-ask". Both are listened to on purpose: a signal whose only
    // invalidation is one event type is stale the moment that event is missed,
    // and a `change` that never arrives leaves a See all wrong for the whole
    // session. resize is the cheap second opinion — it re-reads `.matches`,
    // which was right all along.
    const bump = () => this.band.update((n) => n + 1);
    for (const q of this.queries) q.mq.addEventListener('change', bump);
    window.addEventListener('resize', bump, { passive: true });
    inject(DestroyRef).onDestroy(() => {
      for (const q of this.queries) q.mq.removeEventListener('change', bump);
      window.removeEventListener('resize', bump);
    });
  }

  /** Cards visible in a capped rail at the current width. */
  readonly visible = computed(() => {
    this.band();
    const hit = this.queries.find((q) => q.mq.matches);
    return hit ? hit.visible : BANDS[BANDS.length - 1].visible;
  });

  /** Does this list have more in it than the rail is showing? The whole
   *  condition behind a See all: not "is the list long", but "is any of it out
   *  of reach from here". */
  hasMore(total: number): boolean { return total > this.visible(); }

  /** "N games" for a section header, counting the WHOLE list — the count says
   *  how much there is, the link says the rest is one tap away. */
  count(total: number, noun: string): string {
    // Singular/plural forms are full strings per language (Hebrew dual, Japanese none).
    const k = noun === 'clip' ? 'clip' : noun === 'video' ? 'video' : 'game';
    return plural(total, `count.${k}1` as const, `count.${k}N` as const);
  }
}
