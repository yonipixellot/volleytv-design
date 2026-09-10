import { Component, input, output } from '@angular/core';
import { Crest } from '../../atoms/crest/crest';
import { Score } from '../../atoms/score/score';
import { TPipe } from '../../../app/i18n/t.pipe';

export interface LiveSide { name: string; mono?: string; crest?: string; score?: number; }

/** Live-game card for the "Live now" rail (.livecard): red-dot LIVE badge, horizontal VS with crest tiles.
    No quarter/clock label — the product won't have it (Yuval 2026-08-23). */
@Component({
  selector: 'halo-live-game-card',
  standalone: true,
  imports: [Crest, Score, TPipe],
  template: `
    <button class="livecard" type="button" (click)="open.emit()">
      <div class="lc-top">
        <span class="lc-live"><span class="pz"></span>{{ 'status.live' | t }}</span>
      </div>
      <div class="lc-vsrow">
        <div class="lc-side">
          <halo-crest [src]="home().crest || ''" [monogram]="home().mono || '?'" [size]="34" />
          <span class="nm">{{ home().name }}</span>
        </div>
        @if (home().score != null && away().score != null) {
          <halo-score class="lc-score" [home]="home().score" [away]="away().score"
                      [homeName]="home().name" [awayName]="away().name" />
        } @else {
          <span class="lc-vs">VS</span>
        }
        <div class="lc-side r">
          <halo-crest [src]="away().crest || ''" [monogram]="away().mono || '?'" [size]="34" />
          <span class="nm">{{ away().name }}</span>
        </div>
      </div>
      <div class="lc-meta">{{ meta() }}</div>
    </button>
  `,
  styleUrl: './live-game-card.scss',
})
export class LiveGameCard {
  home = input.required<LiveSide>();
  away = input.required<LiveSide>();
  meta = input('');
  open = output<void>();
}
