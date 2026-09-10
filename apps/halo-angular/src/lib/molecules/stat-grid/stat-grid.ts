import { Component, input } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { t } from '../../../app/i18n/i18n';

/** One cell: a stat code and its value.
    `hero` promotes it to a full-width band above the grid (the summary stat),
    `hot` paints the value accent, `delta` states the distance from the player's
    own average, and `note` is the hero band's one-line verdict. */
export interface StatGridCell {
  k: string;
  v: string | number;
  hot?: boolean;
  hero?: boolean;
  /** Signed distance from this player's season average. 0 = level with it. */
  delta?: number;
  /** Hero band only: the verdict line under the value. */
  note?: string;
}

/**
 * Stat grid — the value-per-cell table used for box scores and season
 * averages. Hairline dividers, value over its stat code, `cols` columns.
 *
 * Extracted from the You tab's own `.avg-grid` (2026-08-27) so the game page
 * can show a box score the same way. The game page previously drew a BAR per
 * stat, with each bar's fill measured against a different invented "strong
 * game" cap, so 4 FTM rendered longer than 4 2FGM: the length encoded nothing.
 *
 * `hero` + `cols=2` exists because a single game has FIVE stats, which never
 * divide into three columns: the summary stat takes a full-width band and the
 * four contributors sit under it in an even 2×2.
 *
 * `delta` gives each number the reference point it was missing: 18 points is
 * neither good nor bad until you know the player averages 14.3. Direction is
 * carried by a drawn arrow, not by colour alone, and a below-average game is
 * muted rather than red: a quiet Tuesday game is not an error.
 */
@Component({
  selector: 'halo-stat-grid',
  standalone: true,
  imports: [HaloIcon],
  template: `
    @if (label()) { <div class="sglab">{{ label() }}</div> }
    <div class="sgrid" [class.flush]="flush()" [style.--sg-cols]="cols()">
      @for (c of cells(); track c.k) {
        <div class="cell" [class.hot]="c.hot" [class.hero]="c.hero">
          <span class="v num">{{ c.v }}</span>
          <span class="k">{{ c.k }}</span>
          @if (showDelta() && c.delta !== undefined) {
            <span class="d" role="img" [class.up]="c.delta > 0" [class.flat]="c.delta === 0"
              [attr.aria-label]="deltaLabel(c)">
              @if (c.delta !== 0) {
                <halo-icon [name]="c.delta > 0 ? 'arrow-up' : 'arrow-down'" [size]="11" />
              }
              <span aria-hidden="true">{{ deltaText(c.delta) }}</span>
            </span>
          }
          @if (showDelta() && c.hero && c.note) { <span class="note">{{ c.note }}</span> }
        </div>
      }
    </div>
  `,
  styleUrl: './stat-grid.scss',
})
export class StatGrid {
  label = input('');
  cells = input.required<StatGridCell[]>();
  /** Columns for the non-hero cells. */
  cols = input(3);
  /**
   * NO OUTER BOX — dividers only, and a tighter cell.
   *
   * The grid normally closes into a bordered, rounded card. Inside another card
   * that reads as a card within a card, so the identity panels drop the outer
   * border and the radius and keep just the 1px-gap dividers. You's rail did
   * this in its own stylesheet; the team card would have been a second copy, so
   * it lives here instead (Maryna 2026-08-30).
   */
  flush = input(false);
  /** Whose stats these are, possessive, for the spoken delta: "your" or
   *  "Maya's". A parent reading their kid's game must not be told "yours". */
  possessive = input(t('common.yourLower'));
  /** Temporary kill switch for the delta arrows/numbers. Off hides them
   *  without touching the per-game delta data itself. */
  showDelta = input(true);

  /** "3.7" beside the trend arrow, or "average" when level with it. One
   *  decimal, matching how the averages themselves are printed. */
  protected deltaText(d: number): string {
    return d === 0 ? t('grid.average') : Math.abs(d).toFixed(1);
  }
  /** Spoken form: the arrow glyphs read as noise. */
  protected deltaLabel(c: StatGridCell): string {
    const d = c.delta ?? 0;
    const whose = this.possessive();
    if (d === 0) return t('grid.sameAs', { k: c.k, whose });
    return t(d > 0 ? 'grid.above' : 'grid.below', { k: c.k, n: Math.abs(d).toFixed(1), whose });
  }
}
