import { Component, computed, input } from '@angular/core';

/**
 * Score — the app's one scoreline: two numbers, one separator, one face.
 *
 * It exists because the same fact was written four ways. A hyphen on the home
 * hero ("24-20"), a middle dot on the live card and both players ("34 · 31"),
 * an en dash with no air in the rails ("64–58"), and a spaced en dash on the
 * game page — in three faces and two weights, one of them the body face. Read
 * down a page, that stops looking like a system and starts looking like four
 * teams shipped four scoreboards (Maryna 2026-08-30).
 *
 * The standard this settles on is the one broadcast and league scoreboards use:
 *   · an EN DASH, never a hyphen (too short to separate two numerals) and never
 *     a middle dot — the dot is this app's metadata separator ("Tuesday B3 Men ·
 *     Open A/1"), and lending it to scores made a result read like a field list;
 *   · the DISPLAY face with tabular figures, so 64–58 and 9–12 occupy the same
 *     width and a column of results does not wobble;
 *   · air proportional to the size (`em`, not a token) — the dash needs room at
 *     54px and almost none at 12px, so one fixed gap cannot serve both.
 *
 * Size, weight and colour are INHERITED, never set here: those are hierarchy,
 * which belongs to the surface. The hero's 600 (700 reads near-black at that
 * size) and the rail's 700 both survive; what they no longer choose is the
 * glyph.
 */
@Component({
  selector: 'halo-score',
  standalone: true,
  template: `
    <span class="sl" role="img" [attr.aria-label]="label()">
      <span class="v" [class.win]="winner() === 'home'" [class.lo]="winner() === 'away'" aria-hidden="true">{{ h() }}</span
      ><span class="d" aria-hidden="true">–</span
      ><span class="v" [class.win]="winner() === 'away'" [class.lo]="winner() === 'home'" aria-hidden="true">{{ a() }}</span>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; min-width: 0; }
    .sl {
      display: inline-flex;
      align-items: center;
      // Proportional, so the dash keeps the same optical air at every size.
      gap: 0.16em;
      font-family: var(--disp);
      font-variant-numeric: tabular-nums;
      line-height: 1;
      white-space: nowrap;
    }
    // Quieter than the numerals and never bold: the dash is punctuation, not a
    // third value. currentColor so it works on card, on media and on the gold
    // ticket without the atom knowing which it is on.
    // Shorter than the numerals, but the SAME weight as them: at hero size a
    // full-em en dash starts reading as a third value, while dropping it to 400
    // turned it into a hairline that disappeared on the 16px live card. Length
    // is what makes it quiet; stroke is what keeps it visible (Maryna
    // 2026-08-30). Proportional, so both hold at 12px and at 54px.
    .d { font-size: .62em; opacity: .55; }
    // Who won, in the accent — the atom owns this because the dash must NOT
    // take it: inheriting the winner's colour painted the separator green on
    // the game card, which reads as a third team colour (Maryna 2026-08-30).
    .v.win { color: var(--accent); }
    // The other half. Neutral rather than a dimmed accent: a 55% accent still
    // reads as "highlighted".
    .v.lo { color: var(--ink); opacity: .55; }
  `],
})
export class Score {
  /** The two halves, when the surface has them apart. */
  home = input<number | string | null | undefined>(null);
  away = input<number | string | null | undefined>(null);
  /**
   * A score already stored as ONE string — "64–58", "64 - 58", "64 · 58".
   * Mock data older than this component keeps that shape, so the atom is the
   * one place that knows every separator it might have been written with.
   */
  pair = input('');
  /**
   * Which half won, where the surface marks it: that half takes the accent and
   * the other goes quiet neutral. Surfaces that treat both equally — every rail
   * card, every player — leave it null and keep their own colour.
   */
  winner = input<'home' | 'away' | null>(null);
  /** Team names, so the screen reader hears a result and not two digits. */
  homeName = input('');
  awayName = input('');

  private parts = computed(() => this.pair().split(/\s*[–—·-]\s*/).filter(Boolean));
  protected h = computed(() => this.pair() ? (this.parts()[0] ?? '') : this.home());
  protected a = computed(() => this.pair() ? (this.parts()[1] ?? '') : this.away());

  protected label = computed(() => {
    const hn = this.homeName(), an = this.awayName();
    return hn && an ? `${hn} ${this.h()}, ${an} ${this.a()}` : `${this.h()} to ${this.a()}`;
  });
}
