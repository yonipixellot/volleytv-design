import { Component, computed, input, output } from '@angular/core';
import { Crest } from '../../atoms/crest/crest';
import { Score } from '../../atoms/score/score';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

/**
 * Finished-game scorebug — FINAL · date/venue eyebrow, then a winner-rows
 * leaderboard: each team is a row (crest · name · score); the winner row holds
 * a gold rail + "Win" pill and the winning score glows. `final=false` (pre-game)
 * drops the scores/win markers and just lists the matchup.
 */
@Component({
  selector: 'halo-score-hero',
  standalone: true,
  imports: [Crest, Score, TPipe],
  template: `
    <div class="sh">
      <div class="eye">
        <span class="badge"><span class="dot"></span>{{ statusLabel() }}</span>
        @if (when()) { <span class="when">{{ when() }}</span> }
      </div>

      <!-- The score as ONE line. As two row-end numbers it made the reader do
           the comparing: find 64, find 58, subtract. Here the comparison is
           already made, which is what a finished game's card is for (Maryna
           2026-08-30). The rows below keep the order, so which number belongs to
           whom is positional — the aria-label says it in words for anyone who
           cannot use that. -->
      @if (final()) {
        <p class="bigline">
          <halo-score [home]="homeScore()" [away]="awayScore()"
                      [homeName]="homeName()" [awayName]="awayName()"
                      [winner]="homeWon() ? 'home' : awayWon() ? 'away' : null" />
        </p>
      }

      <div class="rows">
        <div class="row" [class.win]="final() && homeWon()">
          <halo-crest [src]="homeCrest()" [monogram]="homeMono()" [size]="36" />
          @if (homeTeamId()) {
            <button class="nm nm-link" type="button" (click)="$event.stopPropagation(); openTeam.emit(homeTeamId())">{{ homeName() }}</button>
          } @else {
            <span class="nm">{{ homeName() }}</span>
          }
          @if (final() && homeWon()) { <span class="wpill">{{ 'hero.win' | t }}</span> }
        </div>

        <div class="row" [class.win]="final() && awayWon()">
          <halo-crest [src]="awayCrest()" [monogram]="awayMono()" [size]="36" />
          @if (awayTeamId()) {
            <button class="nm nm-link" type="button" (click)="$event.stopPropagation(); openTeam.emit(awayTeamId())">{{ awayName() }}</button>
          } @else {
            <span class="nm">{{ awayName() }}</span>
          }
          @if (final() && awayWon()) { <span class="wpill">{{ 'hero.win' | t }}</span> }
        </div>
      </div>

      <!-- The card's own action slot. The page supplies the button, so the
           component does not need to know what Editor is or who may see it. -->
      <div class="act"><ng-content /></div>
    </div>
  `,
  styleUrl: './score-hero.scss',
})
export class ScoreHero {
  /** Own/followed team id — when set, the HOME name links to its team page
      (opponents stay plain text per the gating rule). */
  homeTeamId = input('');
  awayTeamId = input('');
  openTeam = output<string>();
  statusLabel = input(t('status.final'));
  when = input('');
  venue = input('');
  final = input(true);
  homeName = input('');
  awayName = input('');
  homeSub = input('');
  awaySub = input('');
  homeCrest = input('');
  awayCrest = input('');
  homeMono = input('?');
  awayMono = input('?');
  homeScore = input(0);
  awayScore = input(0);

  homeWon = computed(() => this.homeScore() > this.awayScore());
  awayWon = computed(() => this.awayScore() > this.homeScore());
}
