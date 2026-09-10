import { Component, computed, input } from '@angular/core';
import { Crest } from '../../atoms/crest/crest';

export interface UpcomingSide { name: string; mono?: string; crest?: string; }

/** Upcoming fixture row (.uprow): date block, two teams, court-circle deco.
    `variant='card'` fixes the width so it sits in a horizontal carousel (Home);
    the default 'row' stays full-width for the stacked lane.

    INFORMATION ONLY since 2026-08-27: no card tap, and the team names are plain
    text rather than links. A fixture has nothing of its own to open yet — the
    card used to navigate to the home team's page, which is not what a tap on a
    two-team fixture promises. */
@Component({
  selector: 'halo-upcoming-row',
  standalone: true,
  imports: [Crest],
  host: { '[class.card]': "variant() === 'card'" },
  template: `
    <div class="uprow">
      <span class="updeco"></span>
      <div class="update">
        <!-- Two lines, not one. "SAT 17 MAY" is 91px of text (and "WED 28 SEP",
             the worst case, is 96) against a 60px content box, so on one line it
             painted straight over the divider. Fitting it would need a 112px
             column out of a 288px card, which is 40% of the width spent on the
             date. Split, it stays in the 76px column and inside the card's
             existing height, since the date block was 40px against the teams'
             68 (Maryna 2026-09-02). -->
        <div class="dd">{{ weekday() }}</div>
        @if (dateLine()) { <div class="dm">{{ dateLine() }}</div> }
        <div class="tt num">{{ time() }}</div>
      </div>
      <div class="upteams">
        <div class="u">
          <halo-crest [src]="home().crest || ''" [monogram]="home().mono || '?'" [size]="28" />
          <span class="nm">{{ home().name }}</span>
        </div>
        <div class="u">
          <halo-crest [src]="away().crest || ''" [monogram]="away().mono || '?'" [size]="28" />
          <span class="nm">{{ away().name }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './upcoming-row.scss',
})
export class UpcomingRow {
  /** A display label: "Sat 17 May", or "Sat 17" where the month is implied. */
  day = input.required<string>();
  /** "Sat 17 May" becomes "SAT" over "17 MAY": the weekday takes the first line,
   *  the date and its month stay together on the second, because a number and
   *  its month are one value and splitting them read as two (Maryna 2026-09-03).
   *
   *  The split happens here rather than in the data so a caller keeps passing
   *  one string. Months arrive as three letters — never "Sept", see MONTH_ABBR
   *  on the Games page for why the platform hardcodes them rather than asking
   *  toLocaleDateString. A string with no month ("Sat 17") still splits, and one
   *  with no weekday leaves the second line empty rather than dropping a token. */
  protected weekday = computed(() => this.day().trim().split(/\s+/)[0] ?? '');
  protected dateLine = computed(() => this.day().trim().split(/\s+/).slice(1).join(' '));
  time = input.required<string>();
  home = input.required<UpcomingSide>();
  away = input.required<UpcomingSide>();
  variant = input<'row' | 'card'>('row');
}
