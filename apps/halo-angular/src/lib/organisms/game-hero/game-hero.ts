import { Component, input, output } from '@angular/core';
import { HaloIcon } from '../../atoms/icon/icon';
import { HaloButton } from '../../atoms/button/button';
import { TeamName } from '../../atoms/team-name/team-name';
import { Score } from '../../atoms/score/score';
import { t } from '../../../app/i18n/i18n';
import { TPipe } from '../../../app/i18n/t.pipe';

/** Big featured game hero (.ehero): real photo bg, live badge + meta, teams/score stacked, watch CTA. */
@Component({
  selector: 'halo-game-hero',
  standalone: true,
  imports: [HaloIcon, TeamName, HaloButton, Score, TPipe],
  template: `
    <article class="ehero">
      <img [src]="image()" [alt]="homeName() + ' vs ' + awayName()" />
      <div class="scr"></div>

      <div class="top">
        @if (status() === 'live') {
          <span class="livebadge"><span class="pz"></span>{{ 'home.liveNow' | t }}</span>
        } @else if (status() === 'final') {
          <span class="livebadge fin">{{ 'status.final' | t }}</span>
        } @else {
          <span class="livebadge up">{{ 'home.upcoming' | t }}</span>
        }
        <span class="hmeta">{{ meta() }}</span>
      </div>

      <div class="foot">
        <div class="eteam"><halo-team-name [name]="homeName()" [teamId]="teamIdOf()(homeName())" (open)="openTeam.emit($event)" /></div>
        @if (status() !== 'pre') {
          <div class="escore">
            <halo-score [home]="homeScore()" [away]="awayScore()"
                        [homeName]="homeName()" [awayName]="awayName()" />
          </div>
        } @else {
          <div class="vs">{{ ('common.vs' | t).toUpperCase() }}</div>
        }
        <div class="eteam lo"><halo-team-name [name]="awayName()" [teamId]="teamIdOf()(awayName())" (open)="openTeam.emit($event)" /></div>

        <halo-button class="wl" variant="primary" (press)="watch.emit()">
          <halo-icon [name]="status() === 'pre' ? 'calendar' : 'play'" [size]="16" />
          {{ status() === 'live' ? ('cta.watchLive' | t).toUpperCase() : status() === 'final' ? ('cta.watchReplay' | t) : tipTime() }}
        </halo-button>
      </div>
    </article>
  `,
  styleUrl: './game-hero.scss',
})
export class GameHero {
  teamIdOf = input<(name: string) => string | null>(() => null);
  openTeam = output<string>();
  homeName = input.required<string>();
  awayName = input.required<string>();
  homeScore = input<number | string>(0);
  awayScore = input<number | string>(0);
  status = input<'live' | 'pre' | 'final'>('live');
  meta = input('');
  tipTime = input(t('hero.setReminder'));
  image = input('img/hero-court.webp');
  watch = output<void>();
}
